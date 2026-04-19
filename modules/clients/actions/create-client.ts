'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import { CLIENT_ERRORS } from '../constants'
import { createClientSchema } from '../schemas'
import type { CreateClientResponse } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function createClient(
  _prevState: ActionResponse<CreateClientResponse>,
  formData: FormData
): Promise<ActionResponse<CreateClientResponse>> {
  const rawData = {
    names: formData.get('names'),
    lastNames: formData.get('lastNames'),
    phone: formData.get('phone'),
    reference: formData.get('reference') || undefined
  }

  const validatedFields = createClientSchema.safeParse(rawData)

  if (!validatedFields.success) {
    const firstIssue = validatedFields.error.issues[0]
    return {
      success: false,
      error: firstIssue?.message || CLIENT_ERRORS.UNKNOWN
    }
  }

  const { names, lastNames, phone, reference } = validatedFields.data

  const body: Record<string, string> = { names, lastNames, phone }
  if (reference) {
    body.reference = reference
  }

  const cookieStore = await cookies()
  const idToken = cookieStore.get("telar.idToken")?.value
  if (!idToken) return { success: false, error: "No session" }
  try {
    const response = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify(body)
    })

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

    const data: CreateClientResponse = await response.json()

    revalidatePath('/admin/clients')

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Create client error:', error)
    return {
      success: false,
      error: CLIENT_ERRORS.UNKNOWN
    }
  }
}
