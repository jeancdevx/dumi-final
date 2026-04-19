'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import { QUOTATION_ERRORS } from '../constants'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface CancelQuotationResponse {
  id: string
  status: string
}

export async function cancelQuotation(
  id: string
): Promise<ActionResponse<CancelQuotationResponse>> {

  const cookieStore = await cookies()
  const idToken = cookieStore.get("telar.idToken")?.value
  if (!idToken) return { success: false, error: "No session" }
  try {
    const response = await fetch(`${API_URL}/quotes/${id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    })

    if (response.status === 404) {
      return {
        success: false,
        error: 'Cotización no encontrada'
      }
    }

    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error:
          errorData.message ||
          'No se puede cancelar esta cotización. Solo se pueden cancelar cotizaciones pendientes.'
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: QUOTATION_ERRORS.UNKNOWN
      }
    }

    const result: CancelQuotationResponse = await response.json()

    revalidatePath('/admin/quotations')
    revalidatePath(`/admin/quotations/${id}`)

    return {
      success: true,
      data: result
    }
  } catch {
    return {
      success: false,
      error: QUOTATION_ERRORS.UNKNOWN
    }
  }
}
