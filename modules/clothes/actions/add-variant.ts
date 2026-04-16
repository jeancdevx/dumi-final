'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import { CLOTHES_ERRORS } from '../constants'
import type { AddVariantInput } from '../schemas'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface AddVariantResponse {
  id: string
  clothesId: string
  sizeId: string
  genderId: string
  additional: string
}

export async function addVariant(
  clothesId: string,
  data: AddVariantInput
): Promise<ActionResponse<AddVariantResponse>> {

  const cookieStore = await cookies()
  const idToken = cookieStore.get("telar.idToken")?.value
  if (!idToken) return { success: false, error: "No session" }
  try {
    const response = await fetch(`${API_URL}/clothes/${clothesId}/variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify(data)
    })

    if (response.status === 404) {
      return {
        success: false,
        error: 'Prenda no encontrada'
      }
    }

    if (response.status === 409) {
      return {
        success: false,
        error: CLOTHES_ERRORS.DUPLICATE_VARIANT
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: CLOTHES_ERRORS.UNKNOWN
      }
    }

    const variantData: AddVariantResponse = await response.json()

    revalidatePath('/admin/clothes')
    revalidatePath(`/admin/clothes/${clothesId}`)

    return {
      success: true,
      data: variantData
    }
  } catch (error) {
    console.error('Add variant error:', error)
    return {
      success: false,
      error: CLOTHES_ERRORS.UNKNOWN
    }
  }
}
