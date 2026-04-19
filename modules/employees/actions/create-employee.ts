'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import { EMPLOYEE_ERRORS } from '../constants'
import { createEmployeeSchema } from '../schemas'
import type { CreateEmployeeResponse } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function createEmployee(
  _prevState: ActionResponse<CreateEmployeeResponse>,
  formData: FormData
): Promise<ActionResponse<CreateEmployeeResponse>> {
  const rawData = {
    names: formData.get('names'),
    lastNames: formData.get('lastNames'),
    email: formData.get('email'),
    role: formData.get('role')
  }

  const validatedFields = createEmployeeSchema.safeParse(rawData)

  if (!validatedFields.success) {
    const firstIssue = validatedFields.error.issues[0]
    return {
      success: false,
      error: firstIssue?.message || EMPLOYEE_ERRORS.UNKNOWN
    }
  }

  const cookieStore = await cookies()
  const idToken = cookieStore.get('telar.idToken')?.value
  if (!idToken) return { success: false, error: 'No session' }

  const payload = validatedFields.data

  try {
    const response = await fetch(`${API_URL}/admin/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify(payload)
    })

    if (response.status === 409) {
      return {
        success: false,
        error: EMPLOYEE_ERRORS.EMAIL_ALREADY_EXISTS
      }
    }

    if (response.status === 400) {
      const errorBody = await response.json().catch(() => ({}))
      const message = Array.isArray(errorBody?.message)
        ? errorBody.message[0]
        : errorBody?.message

      return {
        success: false,
        error: message || EMPLOYEE_ERRORS.UNKNOWN
      }
    }

    if (response.status === 403) {
      const errorBody = await response.json().catch(() => ({}))
      const message = Array.isArray(errorBody?.message)
        ? errorBody.message[0]
        : errorBody?.message

      return {
        success: false,
        error: message || 'Only an owner can create an admin employee.'
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: EMPLOYEE_ERRORS.UNKNOWN
      }
    }

    const data: CreateEmployeeResponse = await response.json()

    revalidatePath('/admin/employees')

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Create employee error:', error)
    return {
      success: false,
      error: EMPLOYEE_ERRORS.UNKNOWN
    }
  }
}
