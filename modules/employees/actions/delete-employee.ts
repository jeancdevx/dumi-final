'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import { EMPLOYEE_ERRORS } from '../constants'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function deleteEmployee(
  employeeId: string
): Promise<ActionResponse> {

  const cookieStore = await cookies()
  const idToken = cookieStore.get("telar.idToken")?.value
  if (!idToken) return { success: false, error: "No session" }
  try {
    const response = await fetch(`${API_URL}/admin/employees/${employeeId}`, {
      method: 'DELETE',
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
      return {
        success: false,
        error: EMPLOYEE_ERRORS.UNKNOWN
      }
    }

    revalidatePath('/admin/employees')

    return {
      success: true
    }
  } catch (error) {
    console.error('Delete employee error:', error)
    return {
      success: false,
      error: EMPLOYEE_ERRORS.UNKNOWN
    }
  }
}
