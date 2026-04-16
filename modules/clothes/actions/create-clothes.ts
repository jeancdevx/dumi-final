'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import { CLOTHES_ERRORS } from '../constants'
import type {
  CreateClothesImageInput,
  CreateClothesResponse,
  CreateClothesVariantInput
} from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface CreateClothesData {
  name: string
  description: string
  price: number
  variants: CreateClothesVariantInput[]
  images: CreateClothesImageInput[]
}

export async function createClothes(
  data: CreateClothesData
): Promise<ActionResponse<CreateClothesResponse>> {

  const { name, description, price, variants, images } = data

  // Check for duplicate variants
  const combinations = variants.map(v => `${v.size}-${v.gender}`)
  const uniqueCombinations = new Set(combinations)
  if (combinations.length !== uniqueCombinations.size) {
    return {
      success: false,
      error: CLOTHES_ERRORS.DUPLICATE_VARIANT
    }
  }

  const cookieStore = await cookies()
  const idToken = cookieStore.get("telar.idToken")?.value
  if (!idToken) return { success: false, error: "No session" }
  try {
    // Create the clothes item
    const response = await fetch(`${API_URL}/clothes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        name,
        description,
        price,
        variants,
        images
      })
    })

    if (response.status === 409) {
      return {
        success: false,
        error: CLOTHES_ERRORS.NAME_EXISTS
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: CLOTHES_ERRORS.UNKNOWN
      }
    }

    const clothesData: CreateClothesResponse = await response.json()

    revalidatePath('/admin/clothes')

    return {
      success: true,
      data: clothesData
    }
  } catch (error) {
    console.error('Create clothes error:', error)
    return {
      success: false,
      error: CLOTHES_ERRORS.UNKNOWN
    }
  }
}
