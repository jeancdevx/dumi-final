'use server'

import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  CodeMismatchException,
  ExpiredCodeException,
  LimitExceededException,
} from '@aws-sdk/client-cognito-identity-provider'

import { AUTH_ERRORS, COGNITO } from '../constants'
import { resetPasswordSchema } from '../schemas'
import type { ActionResponse } from '../types'

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO.REGION
})

export async function resetPassword(
  _prevState: ActionResponse<{ redirectTo: string }>,
  formData: FormData
): Promise<ActionResponse<{ redirectTo: string }>> {
  const rawData = {
    email: formData.get('email'),
    code: formData.get('code'),
    password: formData.get('password')
  }

  const validated = resetPasswordSchema.safeParse(rawData)

  if (!validated.success) {
    const firstIssue = validated.error.issues[0]
    return { success: false, error: firstIssue?.message || AUTH_ERRORS.UNKNOWN }
  }

  const { email, code, password } = validated.data

  try {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: COGNITO.CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: password
    })

    await cognitoClient.send(command)

    return { success: true, data: { redirectTo: '/sign-in?reset=success' } }
  } catch (error) {
    console.error('Reset password error:', error)

    if (error instanceof CodeMismatchException) {
      return { success: false, error: 'Código de verificación incorrecto.' }
    }

    if (error instanceof ExpiredCodeException) {
      return { success: false, error: 'El código de verificación ha expirado. Por favor, solicita uno nuevo.' }
    }

    if (error instanceof LimitExceededException) {
      return { success: false, error: 'Has superado el límite de intentos. Por favor, inténtalo más tarde.' }
    }

    return { success: false, error: AUTH_ERRORS.UNKNOWN }
  }
}
