'use server'

import {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
  UserNotFoundException,
  LimitExceededException,
} from '@aws-sdk/client-cognito-identity-provider'

import { AUTH_ERRORS, COGNITO } from '../constants'
import { forgotPasswordSchema } from '../schemas'
import type { ActionResponse } from '../types'

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO.REGION
})

export async function forgotPassword(
  _prevState: ActionResponse<{ redirectTo: string }>,
  formData: FormData
): Promise<ActionResponse<{ redirectTo: string }>> {
  const rawData = {
    email: formData.get('email')
  }

  const validated = forgotPasswordSchema.safeParse(rawData)

  if (!validated.success) {
    const firstIssue = validated.error.issues[0]
    return { success: false, error: firstIssue?.message || AUTH_ERRORS.UNKNOWN }
  }

  const { email } = validated.data

  try {
    const command = new ForgotPasswordCommand({
      ClientId: COGNITO.CLIENT_ID,
      Username: email
    })

    await cognitoClient.send(command)

    return { success: true, data: { redirectTo: '/reset-password' } }
  } catch (error) {
    console.error('Forgot password error:', error)

    if (error instanceof UserNotFoundException) {
      // Para propósitos de seguridad, a menudo no se revela si el usuario existe,
      // pero si prevent_user_existence_errors está habilitado, Cognito puede enviar un error genérico 
      // o no lanzar error (dependiendo de la config). Asumiremos éxito simulado o error.
      // Aquí el cliente dice prevent_user_existence_errors = "ENABLED", así que AWS no lanzará UserNotFoundException normalmente.
      // Pero por si acaso:
      return { success: true, data: { redirectTo: '/reset-password' } }
    }

    if (error instanceof LimitExceededException) {
      return { success: false, error: 'Has superado el límite de intentos. Por favor, inténtalo más tarde.' }
    }

    // Por seguridad, incluso si hay un error, a menudo se redirige para no filtrar usuarios.
    // Pero asumiendo que prevenimos errores de existencia, cualquier otro error sí debe mostrarse (ej. throttle).
    return { success: false, error: AUTH_ERRORS.UNKNOWN }
  }
}
