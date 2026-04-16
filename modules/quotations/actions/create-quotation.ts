'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import { QUOTATION_ERRORS } from '../constants'
import { createQuotationSchema } from '../schemas'
import type { CreateQuotationInput, CreateQuotationResponse } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function createQuotation(
  data: CreateQuotationInput
): Promise<ActionResponse<CreateQuotationResponse>> {

  // Validate input
  const validationResult = createQuotationSchema.safeParse(data)
  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0]
    return {
      success: false,
      error: firstError?.message || QUOTATION_ERRORS.UNKNOWN
    }
  }

  const { customerId, details } = validationResult.data

  const cookieStore = await cookies()
  const idToken = cookieStore.get("telar.idToken")?.value
  if (!idToken) return { success: false, error: "No session" }
  try {
    const response = await fetch(`${API_URL}/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        customerId,
        details
      })
    })

    if (response.status === 404) {
      const errorData = await response.json().catch(() => ({}))
      if (errorData.message?.includes('customer')) {
        return {
          success: false,
          error: QUOTATION_ERRORS.CUSTOMER_NOT_FOUND
        }
      }
      return {
        success: false,
        error: QUOTATION_ERRORS.VARIANT_NOT_FOUND
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[createQuotation] API error:', response.status, errorText)
      return {
        success: false,
        error: QUOTATION_ERRORS.UNKNOWN
      }
    }

    const quotationData: CreateQuotationResponse = await response.json()

    revalidatePath('/admin/quotations')

    return {
      success: true,
      data: quotationData
    }
  } catch (error) {
    console.error('[createQuotation] Error:', error)
    return {
      success: false,
      error: QUOTATION_ERRORS.UNKNOWN
    }
  }
}
