'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import { CLOTHES_ERRORS } from '../constants'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function deleteImage(
  clothesId: string,
  url: string
): Promise<ActionResponse<null>> {

  console.log('[deleteImage] Starting delete for:', { clothesId, url })
  console.log(
    '[deleteImage] API URL:',
    `${API_URL}/clothes/${clothesId}/images`
  )

  const cookieStore = await cookies()
  const idToken = cookieStore.get("telar.idToken")?.value
  if (!idToken) return { success: false, error: "No session" }
  try {
    const response = await fetch(`${API_URL}/clothes/${clothesId}/images`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({ url }),
      credentials: 'include'
    })

    console.log('[deleteImage] Response status:', response.status)

    if (response.status === 404) {
      return {
        success: false,
        error: 'Imagen no encontrada'
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[deleteImage] API error:', response.status, errorText)
      return {
        success: false,
        error: CLOTHES_ERRORS.UNKNOWN
      }
    }

    const data = await response.json()
    console.log('[deleteImage] Success response:', data)

    revalidatePath('/admin/clothes')
    revalidatePath(`/admin/clothes/${clothesId}/edit`)

    return {
      success: true,
      data: null
    }
  } catch (error) {
    console.error('Delete image error:', error)
    return {
      success: false,
      error: CLOTHES_ERRORS.UNKNOWN
    }
  }
}
