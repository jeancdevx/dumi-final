'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import { QUOTATION_ERRORS } from '../constants'
import { updateQuotationSchema } from '../schemas'
import type { CreateQuotationResponse, UpdateQuotationInput } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function updateQuotation(
  id: string,
  data: UpdateQuotationInput
): Promise<ActionResponse<CreateQuotationResponse>> {

  // Validate input
  const validationResult = updateQuotationSchema.safeParse(data)
  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0]
    return {
      success: false,
      error: firstError?.message || QUOTATION_ERRORS.UNKNOWN
    }
  }

  const { details } = validationResult.data

  const cookieStore = await cookies()
  const idToken = cookieStore.get("telar.idToken")?.value
  if (!idToken) return { success: false, error: "No session" }
  try {
    const response = await fetch(`${API_URL}/quotes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({ details })
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
        error: errorData.message || QUOTATION_ERRORS.UNKNOWN
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: QUOTATION_ERRORS.UNKNOWN
      }
    }

    const result: CreateQuotationResponse = await response.json()

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
