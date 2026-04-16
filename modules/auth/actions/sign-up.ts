'use server'

import { AUTH_ERRORS } from '../constants'
import { signUpSchema } from '../schemas'
import type { ActionResponse } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function signUp(
  _prevState: ActionResponse<{ email: string }>,
  formData: FormData
): Promise<ActionResponse<{ email: string }>> {
  const rawData = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
    acceptedTerms: formData.get('acceptedTerms') === 'true'
  }

  const validated = signUpSchema.safeParse(rawData)

  if (!validated.success) {
    const firstIssue = validated.error.issues[0]
    return { success: false, error: firstIssue?.message || AUTH_ERRORS.UNKNOWN }
  }

  const { firstName, lastName, email, password } = validated.data

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: firstName,
        lastName,
        email,
        password
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { success: false, error: errorData?.message || AUTH_ERRORS.UNKNOWN }
    }

    return { success: true, data: { email } }
  } catch (error) {
    console.error('Sign up error:', error)
    return { success: false, error: AUTH_ERRORS.UNKNOWN }
  }
}
