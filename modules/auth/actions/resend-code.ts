'use server'

import { AUTH_ERRORS } from '../constants'
import type { ActionResponse } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function resendCode(email: string): Promise<ActionResponse> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Correo electrónico inválido' }
  }

  try {
    const response = await fetch(`${API_URL}/auth/resend-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { success: false, error: errorData?.message || 'No se pudo reenviar el código' }
    }

    return { success: true }
  } catch (error) {
    console.error('Resend code error:', error)
    return { success: false, error: AUTH_ERRORS.UNKNOWN }
  }
}
