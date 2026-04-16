'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import { CLOTHES_ERRORS } from '../constants'
import type { PreSignedPut } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface AddImagesInput {
  filename: string
  contentType: string
}

interface AddImagesResponse {
  imageUrls: string[]
  preSignedPuts: PreSignedPut[]
}

export async function addImages(
  clothesId: string,
  images: AddImagesInput[]
): Promise<ActionResponse<AddImagesResponse>> {

  console.log('[addImages] Starting add for:', { clothesId, images })
  console.log('[addImages] API URL:', `${API_URL}/clothes/${clothesId}/images`)

  const cookieStore = await cookies()
  const idToken = cookieStore.get("telar.idToken")?.value
  if (!idToken) return { success: false, error: "No session" }
  try {
    const response = await fetch(`${API_URL}/clothes/${clothesId}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({ images }),
      credentials: 'include'
    })

    console.log('[addImages] Response status:', response.status)

    if (response.status === 404) {
      return {
        success: false,
        error: 'Prenda no encontrada'
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[addImages] API error:', response.status, errorText)
      return {
        success: false,
        error: CLOTHES_ERRORS.UNKNOWN
      }
    }

    const data: AddImagesResponse = await response.json()
    console.log('[addImages] Success response:', data)

    revalidatePath('/admin/clothes')
    revalidatePath(`/admin/clothes/${clothesId}/edit`)

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Add images error:', error)
    return {
      success: false,
      error: CLOTHES_ERRORS.UNKNOWN
    }
  }
}
