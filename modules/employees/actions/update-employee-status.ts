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
