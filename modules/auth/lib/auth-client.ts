'use client'

import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  NotAuthorizedException,
  ResendConfirmationCodeCommand,
  RespondToAuthChallengeCommand,
  UserNotConfirmedException
} from '@aws-sdk/client-cognito-identity-provider'

import { ApiError, apiRequest } from '@/lib/api/client'

import { AUTH_ERRORS, COGNITO } from '../constants'
import {
  forceChangePasswordSchema,
  forgotPasswordSchema,
  otpVerificationSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  tenantSetupSchema,
  type ForceChangePasswordInput,
  type ForgotPasswordInput,
  type OtpVerificationInput,
  type ResetPasswordInput,
  type SignInInput,
  type SignUpInput,
  type TenantSetupInput
} from '../schemas'
import type { ActionResponse } from '../types'
import {
  clearClientSession,
  getClientRefreshToken,
  getFreshClientIdToken,
  getRedirectPathFromToken,
  refreshClientSession,
  saveClientSession
} from './session-client'

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO.REGION
})

function firstValidationError(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message || AUTH_ERRORS.UNKNOWN
}

function apiErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message
  return AUTH_ERRORS.UNKNOWN
}

function getCognitoErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message

    if (typeof message === 'string') return message
  }

  return ''
}

function isUserDisabledError(error: unknown) {
  return getCognitoErrorMessage(error)
    .toLowerCase()
    .includes('user is disabled')
}

export async function signUpClient(
  input: SignUpInput
): Promise<ActionResponse<{ email: string }>> {
  const validated = signUpSchema.safeParse(input)

  if (!validated.success) {
    return { success: false, error: firstValidationError(validated.error) }
  }

  const { firstName, lastName, email, password } = validated.data

  try {
    await apiRequest('/auth/register', {
      method: 'POST',
      body: {
        name: firstName,
        lastName,
        email,
        password
      }
    })

    return { success: true, data: { email } }
  } catch (error) {
    console.error('Sign up error:', error)
    return { success: false, error: apiErrorMessage(error) }
  }
}

export async function confirmEmailClient(
  input: OtpVerificationInput
): Promise<ActionResponse> {
  const validated = otpVerificationSchema.safeParse(input)

  if (!validated.success) {
    return { success: false, error: firstValidationError(validated.error) }
  }

  try {
    await cognitoClient.send(
      new ConfirmSignUpCommand({
        ClientId: COGNITO.CLIENT_ID,
        Username: validated.data.email,
        ConfirmationCode: validated.data.code
      })
    )

    return { success: true }
  } catch (error) {
    console.error('Confirm email error:', error)
    return { success: false, error: 'Código incorrecto o expirado' }
  }
}

export async function resendCodeClient(email: string): Promise<ActionResponse> {
  try {
    await cognitoClient.send(
      new ResendConfirmationCodeCommand({
        ClientId: COGNITO.CLIENT_ID,
        Username: email
      })
    )

    return { success: true }
  } catch (error) {
    console.error('Resend code error:', error)
    return { success: false, error: AUTH_ERRORS.UNKNOWN }
  }
}

export async function signInClient(
  input: SignInInput
): Promise<
  ActionResponse<{ redirectTo: string; session?: string; email?: string }>
> {
  const validated = signInSchema.safeParse(input)

  if (!validated.success) {
    return { success: false, error: firstValidationError(validated.error) }
  }

  const { email, password } = validated.data

  try {
    const response = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: COGNITO.CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      })
    )

    if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      return {
        success: true,
        data: {
          redirectTo: '/force-change-password',
          session: response.Session,
          email
        }
      }
    }

    const idToken = response.AuthenticationResult?.IdToken

    if (!idToken) {
      return { success: false, error: AUTH_ERRORS.UNKNOWN }
    }

    saveClientSession({
      idToken,
      refreshToken: response.AuthenticationResult?.RefreshToken
    })

    return {
      success: true,
      data: { redirectTo: getRedirectPathFromToken(idToken) }
    }
  } catch (error) {
    console.error('Sign in error:', error)

    if (error instanceof UserNotConfirmedException) {
      return { success: false, error: AUTH_ERRORS.EMAIL_NOT_CONFIRMED }
    }

    if (error instanceof NotAuthorizedException) {
      if (isUserDisabledError(error)) {
        return { success: false, error: AUTH_ERRORS.USER_DISABLED }
      }

      return { success: false, error: AUTH_ERRORS.INVALID_CREDENTIALS }
    }

    return { success: false, error: AUTH_ERRORS.UNKNOWN }
  }
}

export async function forgotPasswordClient(
  input: ForgotPasswordInput
): Promise<ActionResponse<{ redirectTo: string }>> {
  const validated = forgotPasswordSchema.safeParse(input)

  if (!validated.success) {
    return { success: false, error: firstValidationError(validated.error) }
  }

  try {
    await cognitoClient.send(
      new ForgotPasswordCommand({
        ClientId: COGNITO.CLIENT_ID,
        Username: validated.data.email
      })
    )

    return { success: true, data: { redirectTo: '/reset-password' } }
  } catch (error) {
    console.error('Forgot password error:', error)
    return { success: false, error: AUTH_ERRORS.UNKNOWN }
  }
}

export async function resetPasswordClient(
  input: ResetPasswordInput
): Promise<ActionResponse<{ redirectTo: string }>> {
  const validated = resetPasswordSchema.safeParse(input)

  if (!validated.success) {
    return { success: false, error: firstValidationError(validated.error) }
  }

  try {
    await cognitoClient.send(
      new ConfirmForgotPasswordCommand({
        ClientId: COGNITO.CLIENT_ID,
        Username: validated.data.email,
        ConfirmationCode: validated.data.code,
        Password: validated.data.password
      })
    )

    return { success: true, data: { redirectTo: '/sign-in' } }
  } catch (error) {
    console.error('Reset password error:', error)
    return { success: false, error: AUTH_ERRORS.UNKNOWN }
  }
}

export async function forceChangePasswordClient(
  input: ForceChangePasswordInput & { session: string; email: string }
): Promise<ActionResponse<{ redirectTo: string }>> {
  const validated = forceChangePasswordSchema.safeParse({
    password: input.password
  })

  if (!input.session || !input.email) {
    return {
      success: false,
      error: 'Sesión inválida o expirada. Por favor, inicia sesión nuevamente.'
    }
  }

  if (!validated.success) {
    return { success: false, error: firstValidationError(validated.error) }
  }

  try {
    const response = await cognitoClient.send(
      new RespondToAuthChallengeCommand({
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        ClientId: COGNITO.CLIENT_ID,
        Session: input.session,
        ChallengeResponses: {
          USERNAME: input.email,
          NEW_PASSWORD: validated.data.password
        }
      })
    )

    const idToken = response.AuthenticationResult?.IdToken

    if (!idToken) {
      return { success: false, error: AUTH_ERRORS.UNKNOWN }
    }

    saveClientSession({
      idToken,
      refreshToken: response.AuthenticationResult?.RefreshToken
    })

    return {
      success: true,
      data: { redirectTo: getRedirectPathFromToken(idToken) }
    }
  } catch (error) {
    console.error('Force change password error:', error)

    if (error instanceof NotAuthorizedException) {
      return { success: false, error: AUTH_ERRORS.INVALID_CREDENTIALS }
    }

    return { success: false, error: AUTH_ERRORS.UNKNOWN }
  }
}

export async function tenantSetupClient(
  input: TenantSetupInput
): Promise<ActionResponse<{ redirectTo: string }>> {
  const validated = tenantSetupSchema.safeParse(input)

  if (!validated.success) {
    return { success: false, error: firstValidationError(validated.error) }
  }

  const idToken = await getFreshClientIdToken()
  const refreshToken = getClientRefreshToken()

  if (!idToken) {
    return { success: false, error: AUTH_ERRORS.SESSION_EXPIRED }
  }

  try {
    await apiRequest('/tenant/setup', {
      method: 'POST',
      token: idToken,
      body: validated.data
    })

    if (refreshToken) {
      try {
        const newIdToken = await refreshClientSession()

        if (newIdToken) {
          return {
            success: true,
            data: { redirectTo: getRedirectPathFromToken(newIdToken) }
          }
        }
      } catch (error) {
        console.error('Error refrescando el token luego de setup:', error)
      }
    }

    return {
      success: true,
      data: { redirectTo: getRedirectPathFromToken(idToken) }
    }
  } catch (error) {
    console.error('Tenant setup error:', error)
    return { success: false, error: apiErrorMessage(error) }
  }
}

export function signOutClient() {
  clearClientSession()
}
