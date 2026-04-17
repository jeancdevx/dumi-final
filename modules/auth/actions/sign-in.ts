'use server'

import { cookies } from 'next/headers'

import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  NotAuthorizedException,
  UserNotConfirmedException
} from '@aws-sdk/client-cognito-identity-provider'
import { decodeJwt } from 'jose'

import { AUTH_COOKIES, AUTH_ERRORS, COGNITO, REDIRECT_PATHS } from '../constants'
import { signInSchema } from '../schemas'
import type { ActionResponse, CognitoJWTPayload, Role } from '../types'

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO.REGION
})

function normalizeRoles(rawRoles: string[] = []): Role[] {
  return rawRoles
    .map(role => role.toLowerCase())
    .filter((role): role is Role =>
      role === 'owner' || role === 'admin' || role === 'seller'
    )
}

export async function signIn(
  _prevState: ActionResponse<{ redirectTo: string }>,
  formData: FormData
): Promise<ActionResponse<{ redirectTo: string }>> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password')
  }

  const validated = signInSchema.safeParse(rawData)

  if (!validated.success) {
    const firstIssue = validated.error.issues[0]
    return { success: false, error: firstIssue?.message || AUTH_ERRORS.UNKNOWN }
  }

  const { email, password } = validated.data

  try {
    const command = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: COGNITO.CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    })

    const response = await cognitoClient.send(command)

    if (!response.AuthenticationResult?.IdToken) {
      return { success: false, error: AUTH_ERRORS.UNKNOWN }
    }

    const { IdToken, RefreshToken } = response.AuthenticationResult

    // Decodificar el idToken para obtener roles y tenantId
    const payload = decodeJwt<CognitoJWTPayload>(IdToken)
    const roles = normalizeRoles(payload['cognito:groups'])
    const tenantId = payload['custom:tenant_id'] ?? null

    const cookieStore = await cookies()
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/'
    }

    cookieStore.set(AUTH_COOKIES.ID_TOKEN, IdToken, cookieOptions)

    if (RefreshToken) {
      cookieStore.set(AUTH_COOKIES.REFRESH_TOKEN, RefreshToken, cookieOptions)
    }

    // Si no tiene tenant → ir al setup de empresa
    if (!tenantId) {
      return { success: true, data: { redirectTo: '/tenant-setup' } }
    }

    let redirectTo = '/sign-in'

    if (roles.includes('owner')) {
      redirectTo = REDIRECT_PATHS.owner
    } else if (roles.includes('admin')) {
      redirectTo = REDIRECT_PATHS.admin
    } else if (roles.includes('seller')) {
      redirectTo = REDIRECT_PATHS.seller
    }

    return { success: true, data: { redirectTo } }
  } catch (error) {
    console.error('Sign in error:', error)

    if (error instanceof UserNotConfirmedException) {
      return { success: false, error: AUTH_ERRORS.EMAIL_NOT_CONFIRMED }
    }

    if (error instanceof NotAuthorizedException) {
      return { success: false, error: AUTH_ERRORS.INVALID_CREDENTIALS }
    }

    return { success: false, error: AUTH_ERRORS.UNKNOWN }
  }
}
