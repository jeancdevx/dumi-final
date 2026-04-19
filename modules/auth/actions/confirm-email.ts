'use server'

import { AUTH_ERRORS } from '../constants'
import { otpVerificationSchema } from '../schemas'
import type { ActionResponse } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function confirmEmail(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    email: formData.get('email'),
    code: formData.get('code')
  }

  const validated = otpVerificationSchema.safeParse(rawData)

  if (!validated.success) {
    const firstIssue = validated.error.issues[0]
    return { success: false, error: firstIssue?.message || AUTH_ERRORS.UNKNOWN }
  }

  const { email, code } = validated.data

  try {
    const response = await fetch(`${API_URL}/auth/confirm-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { success: false, error: errorData?.message || 'Código incorrecto o expirado' }
    }

    return { success: true }
  } catch (error) {
    console.error('Confirm email error:', error)
    return { success: false, error: AUTH_ERRORS.UNKNOWN }
  }
}
