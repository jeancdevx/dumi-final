'use client'

import { ApiError, apiRequest } from '@/lib/api/client'

import { getFreshClientIdToken } from '@/modules/auth/lib/session-client'
import type { ActionResponse } from '@/modules/auth/types'

import { CLOTHES_ERRORS } from '../constants'
import type {
  AddVariantInput,
  DeleteImageInput,
  UpdateClothesInput,
  UpdateVariantInput
} from '../schemas'
import {
  addVariantSchema,
  deleteImageSchema,
  updateClothesSchema,
  updateVariantSchema
} from '../schemas'
import type {
  Clothes,
  CreateClothesImageInput,
  CreateClothesResponse,
  CreateClothesVariantInput,
  PreSignedPut,
  SearchClothesParams
} from '../types'

interface CreateClothesData {
  name: string
  description: string
  price: number
  variants: CreateClothesVariantInput[]
  images: CreateClothesImageInput[]
}

interface QuickCreateClothesData {
  name: string
  price: number
  images: CreateClothesImageInput[]
}

interface AddImagesResponse {
  imageUrls: string[]
  preSignedPuts: PreSignedPut[]
}

interface AddVariantResponse {
  id: string
  clothesId: string
  sizeId: string
  genderId: string
  additional: string
}

interface UpdateVariantResponse {
  id: string
  additional: string
}

async function getAuthenticatedTokenResponse() {
  const idToken = await getFreshClientIdToken()

  if (!idToken) {
    return { success: false, error: 'No session' } as const
  }

  return { success: true, idToken } as const
}

function getApiErrorMessage(error: unknown, fallback = CLOTHES_ERRORS.UNKNOWN) {
  if (!(error instanceof ApiError)) return fallback
  return error.message || fallback
}

function getClothesErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return CLOTHES_ERRORS.UNKNOWN

  if (error.status === 404) return 'Prenda no encontrada'
  if (error.status === 409) return CLOTHES_ERRORS.NAME_EXISTS

  return error.message || CLOTHES_ERRORS.UNKNOWN
}

function hasDuplicateVariants(variants: CreateClothesVariantInput[]) {
  const combinations = variants.map(
    variant => `${variant.size}-${variant.gender}`
  )
  return combinations.length !== new Set(combinations).size
}

export async function createClothesClient(
  data: CreateClothesData
): Promise<ActionResponse<CreateClothesResponse>> {
  if (hasDuplicateVariants(data.variants)) {
    return { success: false, error: CLOTHES_ERRORS.DUPLICATE_VARIANT }
  }

  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const clothes = await apiRequest<CreateClothesResponse>('/clothes', {
      method: 'POST',
      token: auth.idToken,
      body: data
    })

    return { success: true, data: clothes }
  } catch (error) {
    console.error('Create clothes error:', error)
    return { success: false, error: getClothesErrorMessage(error) }
  }
}

export async function quickCreateClothesClient(
  data: QuickCreateClothesData
): Promise<ActionResponse<CreateClothesResponse>> {
  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const clothes = await apiRequest<CreateClothesResponse>(
      '/clothes/quick-create',
      {
        method: 'POST',
        token: auth.idToken,
        body: data
      }
    )

    return { success: true, data: clothes }
  } catch (error) {
    console.error('Quick create clothes error:', error)
    return { success: false, error: getClothesErrorMessage(error) }
  }
}

export async function getClothesClient(): Promise<ActionResponse<Clothes[]>> {
  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const clothes = await apiRequest<Clothes[]>('/clothes', {
      method: 'GET',
      token: auth.idToken
    })

    return { success: true, data: clothes }
  } catch (error) {
    console.error('Get clothes error:', error)
    return { success: false, error: getClothesErrorMessage(error) }
  }
}

export async function getClothesByIdClient(
  id: string
): Promise<ActionResponse<Clothes>> {
  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const clothes = await apiRequest<Clothes>(`/clothes/${id}`, {
      method: 'GET',
      token: auth.idToken
    })

    return { success: true, data: clothes }
  } catch (error) {
    console.error('Get clothes by id error:', error)
    return { success: false, error: getClothesErrorMessage(error) }
  }
}

export async function getClothesWithVariantsClient(): Promise<
  ActionResponse<Clothes[]>
> {
  const listResult = await getClothesClient()

  if (!listResult.success) {
    return listResult
  }

  const clothesList = listResult.data ?? []
  const detailResults = await Promise.all(
    clothesList.map(async clothes => {
      const result = await getClothesByIdClient(clothes.id)
      return result.success && result.data ? result.data : clothes
    })
  )

  return { success: true, data: detailResults }
}

export async function searchClothesClient(
  params: SearchClothesParams
): Promise<ActionResponse<Clothes[]>> {
  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const searchParams = new URLSearchParams()
  if (params.name) searchParams.set('name', params.name)
  if (params.description) searchParams.set('description', params.description)
  if (params.size) searchParams.set('size', params.size)
  if (params.gender) searchParams.set('gender', params.gender.toLowerCase())
  if (params.isDraft !== undefined)
    searchParams.set('isDraft', String(params.isDraft))

  const queryString = searchParams.toString()
  const endpoint = queryString ? `/clothes/search?${queryString}` : '/clothes'

  try {
    const clothes = await apiRequest<Clothes[]>(endpoint, {
      method: 'GET',
      token: auth.idToken
    })

    return { success: true, data: clothes }
  } catch (error) {
    console.error('Search clothes error:', error)
    return { success: false, error: getClothesErrorMessage(error) }
  }
}

export async function updateClothesClient(
  id: string,
  input: UpdateClothesInput
): Promise<ActionResponse<Clothes>> {
  const validated = updateClothesSchema.safeParse(input)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || CLOTHES_ERRORS.UNKNOWN
    }
  }

  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const clothes = await apiRequest<Clothes>(`/clothes/${id}`, {
      method: 'PATCH',
      token: auth.idToken,
      body: validated.data
    })

    return { success: true, data: clothes }
  } catch (error) {
    console.error('Update clothes error:', error)
    return { success: false, error: getClothesErrorMessage(error) }
  }
}

export async function addVariantClient(
  clothesId: string,
  input: AddVariantInput
): Promise<ActionResponse<AddVariantResponse>> {
  const validated = addVariantSchema.safeParse(input)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || CLOTHES_ERRORS.UNKNOWN
    }
  }

  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const variant = await apiRequest<AddVariantResponse>(
      `/clothes/${clothesId}/variants`,
      {
        method: 'POST',
        token: auth.idToken,
        body: validated.data
      }
    )

    return { success: true, data: variant }
  } catch (error) {
    console.error('Add variant error:', error)

    if (error instanceof ApiError && error.status === 409) {
      return { success: false, error: CLOTHES_ERRORS.DUPLICATE_VARIANT }
    }

    return { success: false, error: getClothesErrorMessage(error) }
  }
}

export async function updateVariantClient(
  clothesId: string,
  variantId: string,
  input: UpdateVariantInput
): Promise<ActionResponse<UpdateVariantResponse>> {
  const validated = updateVariantSchema.safeParse(input)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || CLOTHES_ERRORS.UNKNOWN
    }
  }

  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const variant = await apiRequest<UpdateVariantResponse>(
      `/clothes/${clothesId}/variants/${variantId}`,
      {
        method: 'PATCH',
        token: auth.idToken,
        body: validated.data
      }
    )

    return { success: true, data: variant }
  } catch (error) {
    console.error('Update variant error:', error)
    return { success: false, error: getApiErrorMessage(error) }
  }
}

export async function deleteVariantClient(
  clothesId: string,
  variantId: string
): Promise<ActionResponse<null>> {
  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    await apiRequest(`/clothes/${clothesId}/variants/${variantId}`, {
      method: 'DELETE',
      token: auth.idToken
    })

    return { success: true, data: null }
  } catch (error) {
    console.error('Delete variant error:', error)
    return { success: false, error: getApiErrorMessage(error) }
  }
}

export async function addImagesClient(
  clothesId: string,
  images: CreateClothesImageInput[]
): Promise<ActionResponse<AddImagesResponse>> {
  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const data = await apiRequest<AddImagesResponse>(
      `/clothes/${clothesId}/images`,
      {
        method: 'POST',
        token: auth.idToken,
        body: { images }
      }
    )

    return { success: true, data }
  } catch (error) {
    console.error('Add images error:', error)
    return { success: false, error: getClothesErrorMessage(error) }
  }
}

export async function deleteImageClient(
  clothesId: string,
  url: string
): Promise<ActionResponse<null>> {
  const validated = deleteImageSchema.safeParse({
    url
  } satisfies DeleteImageInput)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || CLOTHES_ERRORS.UNKNOWN
    }
  }

  const auth = await getAuthenticatedTokenResponse()

  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    await apiRequest(`/clothes/${clothesId}/images`, {
      method: 'DELETE',
      token: auth.idToken,
      body: validated.data
    })

    return { success: true, data: null }
  } catch (error) {
    console.error('Delete image error:', error)
    return { success: false, error: getApiErrorMessage(error) }
  }
}

export async function uploadPreSignedImages(
  preSignedPuts: PreSignedPut[],
  files: Array<File | undefined>
) {
  await Promise.all(
    preSignedPuts.map(async (preSignedPut, index) => {
      const file = files[index]
      if (!file) return

      const response = await fetch(preSignedPut.putUrl, {
        method: 'PUT',
        body: file,
        headers: preSignedPut.requiredHeaders
      })

      if (!response.ok) {
        throw new Error(`Failed to upload image ${index + 1}`)
      }
    })
  )
}
