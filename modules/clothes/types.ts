export type Gender = 'HOMBRE' | 'MUJER' | 'UNISEX'

export type Size =
  | '2'
  | '4'
  | '6'
  | '8'
  | '10'
  | '12'
  | '14'
  | 'XS'
  | 'S'
  | 'M'
  | 'L'
  | 'XL'
  | 'XXL'

export interface ClothesVariant {
  id: string
  additional: string
  size: {
    size: Size
  }
  gender: {
    gender: Gender
  }
}

export interface ClothesImage {
  url: string
}

export interface Clothes {
  id: string
  name: string
  description: string | null
  price: string
  isDraft: boolean
  createdAt: string
  updatedAt: string
  clothes_variant: ClothesVariant[]
  clothe_image: ClothesImage[]
}

export interface CreateClothesVariantInput {
  gender: Gender
  size: string
  additional: number
}

export interface CreateClothesImageInput {
  filename: string
  contentType: string
}

export interface PreSignedPut {
  key: string
  putUrl: string
  expiresAt: string
  requiredHeaders: {
    'Content-Type': string
  }
}

export interface CreateClothesVariantResponse {
  id: string
  clothesId: string
  sizeId: string
  genderId: string
  additional: string
}

export interface CreateClothesResponse {
  id: string
  name: string
  description: string
  price: number
  isDraft: boolean
  createdAt: string
  updatedAt: string
  variants: CreateClothesVariantResponse[]
  preSignedPuts: PreSignedPut[]
}

export interface SearchClothesParams {
  name?: string
  description?: string
  size?: string
  gender?: string
  isDraft?: boolean
}
