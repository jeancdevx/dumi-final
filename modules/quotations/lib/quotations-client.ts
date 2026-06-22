'use client'

import { ApiError, apiRequest } from '@/lib/api/client'

import { getFreshClientIdToken } from '@/modules/auth/lib/session-client'
import type { ActionResponse } from '@/modules/auth/types'

import { QUOTATION_ERRORS } from '../constants'
import {
  createQuotationSchema,
  updateQuotationSchema,
  type CreateQuotationInput,
  type UpdateQuotationInput
} from '../schemas'
import type {
  CreateQuotationResponse,
  Quotation,
  QuotationStatus,
  QuotationWithDetails
} from '../types'

interface CancelQuotationResponse {
  id: string
  status: string
}

async function getAuthenticatedTokenResponse() {
  const idToken = await getFreshClientIdToken()

  if (!idToken) {
    return { success: false, error: 'No session' } as const
  }

  return { success: true, idToken } as const
}

function getQuotationErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return QUOTATION_ERRORS.UNKNOWN
  }

  if (error.status === 404) {
    const message = error.message.toLowerCase()
    if (message.includes('customer')) return QUOTATION_ERRORS.CUSTOMER_NOT_FOUND
    if (message.includes('variant')) return QUOTATION_ERRORS.VARIANT_NOT_FOUND
    return 'Cotización no encontrada'
  }

  return error.message || QUOTATION_ERRORS.UNKNOWN
}

export async function getQuotationsClient(params?: {
  status?: QuotationStatus
}): Promise<ActionResponse<Quotation[]>> {
  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set('status', params.status)
  const query = searchParams.toString()
  const endpoint = query ? `/quotes?${query}` : '/quotes'

  try {
    const data = await apiRequest<Quotation[]>(endpoint, {
      method: 'GET',
      token: auth.idToken
    })

    return { success: true, data }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { success: true, data: [] }
    }

    console.error('Get quotations error:', error)
    return { success: false, error: getQuotationErrorMessage(error) }
  }
}

export async function getQuotationByIdClient(
  id: string
): Promise<ActionResponse<QuotationWithDetails>> {
  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const data = await apiRequest<QuotationWithDetails>(`/quotes/${id}`, {
      method: 'GET',
      token: auth.idToken
    })

    return { success: true, data }
  } catch (error) {
    console.error('Get quotation by id error:', error)
    return { success: false, error: getQuotationErrorMessage(error) }
  }
}

export async function createQuotationClient(
  input: CreateQuotationInput
): Promise<ActionResponse<CreateQuotationResponse>> {
  const validated = createQuotationSchema.safeParse(input)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || QUOTATION_ERRORS.UNKNOWN
    }
  }

  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const data = await apiRequest<CreateQuotationResponse>('/quotes', {
      method: 'POST',
      token: auth.idToken,
      body: validated.data
    })

    return { success: true, data }
  } catch (error) {
    console.error('Create quotation error:', error)
    return { success: false, error: getQuotationErrorMessage(error) }
  }
}

export async function updateQuotationClient(
  id: string,
  input: UpdateQuotationInput
): Promise<ActionResponse<CreateQuotationResponse>> {
  const validated = updateQuotationSchema.safeParse(input)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || QUOTATION_ERRORS.UNKNOWN
    }
  }

  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const data = await apiRequest<CreateQuotationResponse>(`/quotes/${id}`, {
      method: 'PUT',
      token: auth.idToken,
      body: validated.data
    })

    return { success: true, data }
  } catch (error) {
    console.error('Update quotation error:', error)
    return { success: false, error: getQuotationErrorMessage(error) }
  }
}

export async function cancelQuotationClient(
  id: string
): Promise<ActionResponse<CancelQuotationResponse | QuotationWithDetails>> {
  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const data = await apiRequest<
      CancelQuotationResponse | QuotationWithDetails
    >(`/quotes/${id}/cancel`, {
      method: 'PATCH',
      token: auth.idToken
    })

    return { success: true, data }
  } catch (error) {
    console.error('Cancel quotation error:', error)

    if (error instanceof ApiError && error.status === 400) {
      return {
        success: false,
        error:
          error.message ||
          'No se puede cancelar esta cotización. Solo se pueden cancelar cotizaciones pendientes.'
      }
    }

    return { success: false, error: getQuotationErrorMessage(error) }
  }
}
