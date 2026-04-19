'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import { CLOTHES_ERRORS } from '../constants'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function deleteVariant(
  clothesId: string,
  variantId: string
): Promise<ActionResponse<null>> {

  const cookieStore = await cookies()
  const idToken = cookieStore.get("telar.idToken")?.value
  if (!idToken) return { success: false, error: "No session" }
  try {
    const response = await fetch(
      `${API_URL}/clothes/${clothesId}/variants/${variantId}`,
      {
        method: 'DELETE',
        headers: {
        Authorization: `Bearer ${idToken}`
      }
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

    revalidatePath('/admin/clothes')
    revalidatePath(`/admin/clothes/${clothesId}`)

    return {
      success: true,
      data: null
    }
  } catch (error) {
    console.error('Delete variant error:', error)
    return {
      success: false,
      error: CLOTHES_ERRORS.UNKNOWN
    }
  }
}
