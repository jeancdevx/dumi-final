'use server'

import { cookies } from 'next/headers'

import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand
} from '@aws-sdk/client-cognito-identity-provider'
import { decodeJwt } from 'jose'

import { AUTH_COOKIES, AUTH_ERRORS, COGNITO, REDIRECT_PATHS } from '../constants'
import { tenantSetupSchema } from '../schemas'
import type { ActionResponse, CognitoJWTPayload, Role } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO.REGION
})

export async function tenantSetup(
  _prevState: ActionResponse<{ redirectTo: string }>,
  formData: FormData
): Promise<ActionResponse<{ redirectTo: string }>> {
  const rawData = {
    name: formData.get('name'),
    ruc: formData.get('ruc') || undefined,
    address: formData.get('address') || undefined
  }

  const validated = tenantSetupSchema.safeParse(rawData)

  if (!validated.success) {
    const firstIssue = validated.error.issues[0]
    return { success: false, error: firstIssue?.message || AUTH_ERRORS.UNKNOWN }
  }

  const cookieStore = await cookies()
  const idToken = cookieStore.get(AUTH_COOKIES.ID_TOKEN)?.value
  const refreshToken = cookieStore.get(AUTH_COOKIES.REFRESH_TOKEN)?.value

  if (!idToken || !refreshToken) {
    return { success: false, error: AUTH_ERRORS.SESSION_EXPIRED }
  }

  try {
    const response = await fetch(`${API_URL}/tenant/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify(validated.data)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { success: false, error: errorData?.message || AUTH_ERRORS.UNKNOWN }
    }

    // Refrescar el token por medio de Cognito para obtener el que tiene el tenant_id
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
        ClientId: COGNITO.CLIENT_ID,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken
        }
      })

      const cognitoResponse = await cognitoClient.send(command)

      if (cognitoResponse.AuthenticationResult?.IdToken) {
        const newIdToken = cognitoResponse.AuthenticationResult.IdToken

        cookieStore.set(AUTH_COOKIES.ID_TOKEN, newIdToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/'
        })

        const payload = decodeJwt<CognitoJWTPayload>(newIdToken)
        const roles: Role[] = payload['cognito:groups'] ?? []
        const primaryRole = roles[0] as Role | undefined
        const redirectTo = primaryRole ? REDIRECT_PATHS[primaryRole] : '/sign-in'

        return { success: true, data: { redirectTo } }
      }
    } catch (refreshErr) {
      console.error('Error refrescando el token luego de setup:', refreshErr)
      // Fallback a redirección por rol sin token refresh silencioso
    }

    // Si falló el refresh, intentar redirigir basado en el token actual de todos modos,
    // o forzar el login denegando el setup success a menos que lo hayan actualizado.
    const currentPayload = decodeJwt<CognitoJWTPayload>(idToken)
    const roles: Role[] = currentPayload['cognito:groups'] ?? []
    const primaryRole = roles[0] as Role | undefined
    const redirectTo = primaryRole ? REDIRECT_PATHS[primaryRole] : '/sign-in'

    return { success: true, data: { redirectTo } }
  } catch (error) {
    console.error('Tenant setup error:', error)
    return { success: false, error: AUTH_ERRORS.UNKNOWN }
  }
}
