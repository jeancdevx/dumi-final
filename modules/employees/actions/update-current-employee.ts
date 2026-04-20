'use server'

import { revalidatePath } from 'next/cache'

import { fetchWithAuth } from '@/lib/fetch'
import type { ActionResponse } from '@/modules/auth/types'
import { updateEmployeeProfileSchema } from '../schemas'
import type { GetCurrentEmployeeResponse } from '../types'

export async function updateCurrentEmployee(
  _prevState: ActionResponse<GetCurrentEmployeeResponse>,
  formData: FormData
): Promise<ActionResponse<GetCurrentEmployeeResponse>> {
  const rawData = {
    names: formData.get('names'),
    lastNames: formData.get('lastNames')
  }

  const validatedFields = updateEmployeeProfileSchema.safeParse(rawData)

  if (!validatedFields.success) {
    const firstIssue = validatedFields.error.issues[0]

    return {
      success: false,
      error: firstIssue?.message || 'Los datos ingresados no son válidos'
    }
  }

  try {
    const updatedEmployee = await fetchWithAuth<GetCurrentEmployeeResponse>('/employees', {
      method: 'PATCH',
      body: JSON.stringify(validatedFields.data)
    })

    revalidatePath('/admin/profile')
    revalidatePath('/seller/profile')

    return {
      success: true,
      data: updatedEmployee
    }
  } catch (error: any) {
    console.error('Update current employee error:', error)

    return {
      success: false,
      error: error?.message || 'Error al actualizar el perfil'
    }
  }
}
