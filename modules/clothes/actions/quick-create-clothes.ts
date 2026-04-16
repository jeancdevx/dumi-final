'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import { CLOTHES_ERRORS } from '../constants'
import type { CreateClothesResponse } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface QuickCreateClothesData {
  name: string
  price: number
  images: {
    filename: string
    contentType: string
  }[]
}

export async function quickCreateClothes(
  data: QuickCreateClothesData
): Promise<ActionResponse<CreateClothesResponse>> {

  const cookieStore = await cookies()
  const idToken = cookieStore.get("telar.idToken")?.value
  if (!idToken) return { success: false, error: "No session" }
  try {
    const response = await fetch(`${API_URL}/clothes/quick-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        name: data.name,
        price: data.price,
        images: data.images
      })
    })

    if (response.status === 409) {
      return {
        success: false,
        error: CLOTHES_ERRORS.NAME_EXISTS
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        'Quick create clothes API error:',
        response.status,
        errorText
      )
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
    console.error('Quick create clothes error:', error)
    return {
      success: false,
      error: CLOTHES_ERRORS.UNKNOWN
    }
  }
}
