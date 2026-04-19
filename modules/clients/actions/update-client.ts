'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import { CLIENT_ERRORS } from '../constants'
import { updateClientSchema } from '../schemas'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function updateClient(
  clientId: string,
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    phone: formData.get('phone'),
    reference: formData.get('reference') || undefined
  }

  const validatedFields = updateClientSchema.safeParse(rawData)

  if (!validatedFields.success) {
    const firstIssue = validatedFields.error.issues[0]
    return {
      success: false,
      error: firstIssue?.message || CLIENT_ERRORS.UNKNOWN
    }
  }

  const { phone, reference } = validatedFields.data

  const cookieStore = await cookies()
  const idToken = cookieStore.get("telar.idToken")?.value
  if (!idToken) return { success: false, error: "No session" }
  try {
    const response = await fetch(`${API_URL}/customers/${clientId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({ phone, reference: reference || '' })
    })

    if (response.status === 404) {
      return {
        success: false,
        error: CLIENT_ERRORS.NOT_FOUND
      }
    }

    if (response.status === 409) {
      return {
        success: false,
        error: CLIENT_ERRORS.PHONE_EXISTS
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: CLIENT_ERRORS.UNKNOWN
      }
    }

    revalidatePath('/admin/clients')

    return {
      success: true
    }
  } catch (error) {
    console.error('Update client error:', error)
    return {
      success: false,
      error: CLIENT_ERRORS.UNKNOWN
    }
  }
}
