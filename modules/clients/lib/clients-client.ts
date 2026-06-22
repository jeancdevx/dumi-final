'use client'

import { ApiError, apiRequest } from '@/lib/api/client'

import { getFreshClientIdToken } from '@/modules/auth/lib/session-client'
import type { ActionResponse } from '@/modules/auth/types'

import { CLIENT_ERRORS } from '../constants'
import {
  createClientSchema,
  updateClientSchema,
  type CreateClientInput,
  type UpdateClientInput
} from '../schemas'
import type { Client, CreateClientResponse } from '../types'

async function getAuthenticatedTokenResponse() {
  const idToken = await getFreshClientIdToken()

  if (!idToken) {
    return { success: false, error: 'No session' } as const
  }

  return { success: true, idToken } as const
}

function getClientErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return CLIENT_ERRORS.UNKNOWN
  }

  if (error.status === 400) return CLIENT_ERRORS.INVALID_DATA
  if (error.status === 404) return CLIENT_ERRORS.NOT_FOUND
  if (error.status === 409) return CLIENT_ERRORS.PHONE_EXISTS

  return error.message || CLIENT_ERRORS.UNKNOWN
}

export async function createClientClient(
  input: CreateClientInput
): Promise<ActionResponse<CreateClientResponse>> {
  const validated = createClientSchema.safeParse(input)

  if (!validated.success) {
    const firstIssue = validated.error.issues[0]
    return {
      success: false,
      error: firstIssue?.message || CLIENT_ERRORS.UNKNOWN
    }
  }

  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const { names, lastNames, phone, reference } = validated.data
  const body: Record<string, string> = { names, lastNames, phone }

  if (reference) {
    body.reference = reference
  }

  try {
    const data = await apiRequest<CreateClientResponse>('/customers', {
      method: 'POST',
      token: auth.idToken,
      body
    })

    return { success: true, data }
  } catch (error) {
    console.error('Create client error:', error)
    return {
      success: false,
      error: getClientErrorMessage(error)
    }
  }
}

export async function getClientsClient(): Promise<ActionResponse<Client[]>> {
  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const data = await apiRequest<Client[]>('/customers', {
      method: 'GET',
      token: auth.idToken
    })

    return { success: true, data }
  } catch (error) {
    console.error('Get clients error:', error)

    if (error instanceof ApiError && error.status === 404) {
      return { success: true, data: [] }
    }

    return {
      success: false,
      error: getClientErrorMessage(error)
    }
  }
}

export async function searchClientsClient(params: {
  names?: string
  lastnames?: string
  phone?: string
}): Promise<ActionResponse<Client[]>> {
  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const query = new URLSearchParams()
  if (params.names) query.set('names', params.names)
  if (params.lastnames) query.set('lastnames', params.lastnames)
  if (params.phone) query.set('phone', params.phone)

  try {
    const data = await apiRequest<Client[]>(
      `/customers/search?${query.toString()}`,
      {
        method: 'GET',
        token: auth.idToken
      }
    )

    return { success: true, data }
  } catch (error) {
    console.error('Search clients error:', error)
    return {
      success: false,
      error: getClientErrorMessage(error)
    }
  }
}

export async function updateClientClient(
  id: string,
  input: UpdateClientInput
): Promise<ActionResponse<Client>> {
  const validated = updateClientSchema.safeParse(input)

  if (!validated.success) {
    const firstIssue = validated.error.issues[0]
    return {
      success: false,
      error: firstIssue?.message || CLIENT_ERRORS.UNKNOWN
    }
  }

  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const body: Record<string, string> = {}
  if (validated.data.phone) body.phone = validated.data.phone
  if (validated.data.reference) body.reference = validated.data.reference

  try {
    const data = await apiRequest<Client>(`/customers/${id}`, {
      method: 'PATCH',
      token: auth.idToken,
      body
    })

    return { success: true, data }
  } catch (error) {
    console.error('Update client error:', error)
    return {
      success: false,
      error: getClientErrorMessage(error)
    }
  }
}
