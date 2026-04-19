'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import { EMPLOYEE_ERRORS } from '../constants'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface UpdateEmployeeStatusInput {
  employeeId: string
  shouldActivate: boolean
}

export async function updateEmployeeStatus({
  employeeId,
  shouldActivate
}: UpdateEmployeeStatusInput): Promise<ActionResponse> {
  const cookieStore = await cookies()
  const idToken = cookieStore.get('telar.idToken')?.value

  if (!idToken) {
    return { success: false, error: 'No session' }
  }

  const endpoint = shouldActivate
    ? `${API_URL}/admin/employees/${employeeId}/reactivate`
    : `${API_URL}/admin/employees/${employeeId}`

  const method = shouldActivate ? 'POST' : 'DELETE'

  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    })

    if (response.status === 404) {
      return {
        success: false,
        error: EMPLOYEE_ERRORS.NOT_FOUND
      }
    }

    if (response.status === 403) {
      const body = await response.json().catch(() => ({}))
      const backendMessage: string = body?.message ?? ''

      // Deactivation errors
      if (backendMessage.toLowerCase().includes('your own account')) {
        return { success: false, error: EMPLOYEE_ERRORS.CANNOT_DISABLE_SELF }
      }
      if (backendMessage.toLowerCase().includes('owner')) {
        return { success: false, error: EMPLOYEE_ERRORS.CANNOT_DISABLE_OWNER }
      }
      if (backendMessage.toLowerCase().includes('disable another administrator')) {
        return { success: false, error: EMPLOYEE_ERRORS.CANNOT_DISABLE_ADMIN }
      }

      // Reactivation errors
      if (backendMessage.toLowerCase().includes('modify your own profile')) {
        return { success: false, error: EMPLOYEE_ERRORS.CANNOT_REACTIVATE_SELF }
      }
      if (backendMessage.toLowerCase().includes('reactivate another administrator')) {
        return { success: false, error: EMPLOYEE_ERRORS.CANNOT_REACTIVATE_ADMIN }
      }

      return { success: false, error: backendMessage || EMPLOYEE_ERRORS.UNKNOWN }
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return {
        success: false,
        error: body?.message || EMPLOYEE_ERRORS.UNKNOWN
      }
    }

    revalidatePath('/admin/employees')

    return {
      success: true
    }
  } catch (error) {
    console.error('Update employee status error:', error)
    return {
      success: false,
      error: EMPLOYEE_ERRORS.UNKNOWN
    }
  }
}
