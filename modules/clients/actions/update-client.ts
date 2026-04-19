'use server'

import { revalidatePath } from 'next/cache'
import { fetchWithAuth } from '@/lib/fetch'
import type { ActionResponse } from '@/modules/auth/types'
import { CLIENT_ERRORS } from '../constants'
import type { Client } from '../types'

export async function updateClient(
  id: string,
  _prevState: ActionResponse<Client>,
  formData: FormData
): Promise<ActionResponse<Client>> {
  try {
    const phone = formData.get('phone')?.toString()
    const reference = formData.get('reference')?.toString()

    const body: Record<string, string> = {}
    if (phone) body.phone = phone
    if (reference) body.reference = reference

    const updatedClient = await fetchWithAuth<Client>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    })

    revalidatePath('/admin/clients')

    return {
      success: true,
      data: updatedClient
    }
  } catch (error: any) {
    console.error('Update client error:', error)
    
    if (error?.status === 400) return { success: false, error: CLIENT_ERRORS.INVALID_DATA }
    if (error?.status === 404) return { success: false, error: CLIENT_ERRORS.NOT_FOUND }
    if (error?.status === 409) return { success: false, error: CLIENT_ERRORS.PHONE_EXISTS }

    return { success: false, error: CLIENT_ERRORS.UNKNOWN }
  }
}
