'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import { CLOTHES_ERRORS } from '../constants'
import type { UpdateVariantInput } from '../schemas'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface UpdateVariantResponse {
  id: string
  additional: string
}

export async function updateVariant(
  clothesId: string,
  variantId: string,
  data: UpdateVariantInput
): Promise<ActionResponse<UpdateVariantResponse>> {

  const cookieStore = await cookies()
  const idToken = cookieStore.get("telar.idToken")?.value
  if (!idToken) return { success: false, error: "No session" }
  try {
    const response = await fetch(
      `${API_URL}/clothes/${clothesId}/variants/${variantId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
        body: JSON.stringify(data)
      }
    )

    if (response.status === 404) {
      return {
        success: false,
        error: 'Variante no encontrada'
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: CLOTHES_ERRORS.UNKNOWN
      }
    }

    const variantData: UpdateVariantResponse = await response.json()

    revalidatePath('/admin/clothes')
    revalidatePath(`/admin/clothes/${clothesId}`)

    return {
      success: true,
      data: variantData
    }
  } catch (error) {
    console.error('Update variant error:', error)
    return {
      success: false,
      error: CLOTHES_ERRORS.UNKNOWN
    }
  }
}
