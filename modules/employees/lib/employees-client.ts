'use client'

import { ApiError, apiRequest } from '@/lib/api/client'

import {
  getFreshClientIdToken,
  normalizeRoles
} from '@/modules/auth/lib/session-client'
import type { ActionResponse } from '@/modules/auth/types'

import { EMPLOYEE_ERRORS } from '../constants'
import {
  createEmployeeSchema,
  updateEmployeeProfileSchema,
  type CreateEmployeeInput,
  type UpdateEmployeeProfileInput
} from '../schemas'
import type {
  CreateEmployeeResponse,
  Employee,
  GetCurrentEmployeeResponse
} from '../types'

interface UpdateEmployeeStatusInput {
  employeeId: string
  shouldActivate: boolean
}

function getEmployeeErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return EMPLOYEE_ERRORS.UNKNOWN
  }

  if (error.status === 409) {
    return EMPLOYEE_ERRORS.EMAIL_ALREADY_EXISTS
  }

  return error.message || EMPLOYEE_ERRORS.UNKNOWN
}

function getEmployeeStatusErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return EMPLOYEE_ERRORS.UNKNOWN
  }

  if (error.status === 404) {
    return EMPLOYEE_ERRORS.NOT_FOUND
  }

  if (error.status !== 403) {
    return error.message || EMPLOYEE_ERRORS.UNKNOWN
  }

  const backendMessage = error.message ?? ''
  const normalizedMessage = backendMessage.toLowerCase()

  if (normalizedMessage.includes('your own account')) {
    return EMPLOYEE_ERRORS.CANNOT_DISABLE_SELF
  }
  if (normalizedMessage.includes('owner')) {
    return EMPLOYEE_ERRORS.CANNOT_DISABLE_OWNER
  }
  if (normalizedMessage.includes('disable another administrator')) {
    return EMPLOYEE_ERRORS.CANNOT_DISABLE_ADMIN
  }
  if (normalizedMessage.includes('modify your own profile')) {
    return EMPLOYEE_ERRORS.CANNOT_REACTIVATE_SELF
  }
  if (normalizedMessage.includes('reactivate another administrator')) {
    return EMPLOYEE_ERRORS.CANNOT_REACTIVATE_ADMIN
  }

  return backendMessage || EMPLOYEE_ERRORS.UNKNOWN
}

async function getAuthenticatedTokenResponse() {
  const idToken = await getFreshClientIdToken()

  if (!idToken) {
    return { success: false, error: 'No session' } as const
  }

  return { success: true, idToken } as const
}

export async function createEmployeeClient(
  input: CreateEmployeeInput
): Promise<ActionResponse<CreateEmployeeResponse>> {
  const validated = createEmployeeSchema.safeParse(input)

  if (!validated.success) {
    const firstIssue = validated.error.issues[0]
    return {
      success: false,
      error: firstIssue?.message || EMPLOYEE_ERRORS.UNKNOWN
    }
  }

  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const data = await apiRequest<CreateEmployeeResponse>('/admin/employees', {
      method: 'POST',
      token: auth.idToken,
      body: validated.data
    })

    return { success: true, data }
  } catch (error) {
    console.error('Create employee error:', error)
    return {
      success: false,
      error: getEmployeeErrorMessage(error)
    }
  }
}

export async function getEmployeesClient(): Promise<
  ActionResponse<Employee[]>
> {
  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const data = await apiRequest<Employee[]>('/admin/employees', {
      method: 'GET',
      token: auth.idToken
    })

    return {
      success: true,
      data: data.map(employee => ({
        ...employee,
        roles: normalizeRoles(employee.roles)
      }))
    }
  } catch (error) {
    console.error('Get employees error:', error)
    return {
      success: false,
      error: getEmployeeErrorMessage(error)
    }
  }
}

export async function getCurrentEmployeeClient(): Promise<
  ActionResponse<GetCurrentEmployeeResponse>
> {
  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const data = await apiRequest<GetCurrentEmployeeResponse>('/employees/me', {
      method: 'GET',
      token: auth.idToken
    })

    return {
      success: true,
      data: {
        ...data,
        roles: normalizeRoles(data.roles)
      }
    }
  } catch (error) {
    console.error('Get current employee error:', error)
    return {
      success: false,
      error: getEmployeeErrorMessage(error)
    }
  }
}

export async function updateCurrentEmployeeClient(
  input: UpdateEmployeeProfileInput
): Promise<ActionResponse<GetCurrentEmployeeResponse>> {
  const validated = updateEmployeeProfileSchema.safeParse(input)

  if (!validated.success) {
    const firstIssue = validated.error.issues[0]
    return {
      success: false,
      error: firstIssue?.message || 'Los datos ingresados no son válidos'
    }
  }

  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const data = await apiRequest<GetCurrentEmployeeResponse>('/employees', {
      method: 'PATCH',
      token: auth.idToken,
      body: validated.data
    })

    return { success: true, data }
  } catch (error) {
    console.error('Update current employee error:', error)
    return {
      success: false,
      error:
        error instanceof ApiError
          ? error.message
          : 'Error al actualizar el perfil'
    }
  }
}

export async function updateEmployeeStatusClient({
  employeeId,
  shouldActivate
}: UpdateEmployeeStatusInput): Promise<ActionResponse> {
  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const endpoint = shouldActivate
    ? `/admin/employees/${employeeId}/reactivate`
    : `/admin/employees/${employeeId}`
  const method = shouldActivate ? 'POST' : 'DELETE'

  try {
    await apiRequest(endpoint, {
      method,
      token: auth.idToken
    })

    return { success: true }
  } catch (error) {
    console.error('Update employee status error:', error)
    return {
      success: false,
      error: getEmployeeStatusErrorMessage(error)
    }
  }
}
