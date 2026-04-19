'use server'

import { revalidatePath } from 'next/cache'
import { fetchWithAuth } from '@/lib/fetch'
import type { ActionResponse } from '@/modules/auth/types'
import { CLIENT_ERRORS } from '../constants'
import { createClientSchema } from '../schemas'
import type { CreateClientResponse } from '../types'

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

  try {
    const data = await fetchWithAuth<CreateClientResponse>('/customers', {
      method: 'POST',
      body: JSON.stringify(body)
    })

    revalidatePath('/admin/clients')

    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('Create client error:', error)
    if (error?.status === 409) return { success: false, error: CLIENT_ERRORS.PHONE_EXISTS }
    if (error?.status === 400) return { success: false, error: CLIENT_ERRORS.INVALID_DATA }
    return { success: false, error: CLIENT_ERRORS.UNKNOWN }
  }
}
