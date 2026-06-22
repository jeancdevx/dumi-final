import { z } from 'zod'

import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE } from './constants'

export const variantSchema = z.object({
  gender: z.enum(['HOMBRE', 'MUJER', 'UNISEX']),
  size: z.string().min(1, 'Selecciona una talla'),
  additional: z.number().min(0, 'El precio adicional debe ser 0 o mayor')
})

export const imageFileSchema = z.object({
  file: z
    .instanceof(File, { message: 'Debe ser un archivo' })
    .refine(
      file => file.size <= MAX_IMAGE_SIZE,
      'La imagen no debe superar 5MB'
    )
    .refine(
      file => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Solo se permiten imágenes PNG, JPG o WebP'
    ),
  preview: z.string()
})

export const createClothesSchema = z
  .object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    description: z
      .string()
      .min(2, 'La descripción debe tener al menos 2 caracteres'),
    price: z
      .number()
      .positive('El precio debe ser mayor a 0')
      .min(0.01, 'El precio mínimo es 0.01'),
    variants: z
      .array(variantSchema)
      .min(1, 'Debe agregar al menos una variante'),
    images: z.array(imageFileSchema).min(1, 'Debe agregar al menos una imagen')
  })
  .refine(
    data => {
      const combinations = data.variants.map(v => `${v.size}-${v.gender}`)
      const uniqueCombinations = new Set(combinations)
      return combinations.length === uniqueCombinations.size
    },
    {
      message: 'No puede haber variantes duplicadas (misma talla y género)',
      path: ['variants']
    }
  )

export type VariantInput = z.infer<typeof variantSchema>
export type ImageFileInput = z.infer<typeof imageFileSchema>
export type CreateClothesInput = z.infer<typeof createClothesSchema>

// Schema para creación rápida (borrador)
export const quickCreateClothesSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  price: z
    .number()
    .positive('El precio debe ser mayor a 0')
    .min(0.01, 'El precio mínimo es 0.01'),
  images: z.array(imageFileSchema).min(1, 'Debe agregar al menos una imagen')
})

export type QuickCreateClothesInput = z.infer<typeof quickCreateClothesSchema>

// Schemas para edición
export const updateClothesSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .optional(),
  description: z
    .string()
    .min(2, 'La descripción debe tener al menos 2 caracteres')
    .optional(),
  price: z.number().positive('El precio debe ser mayor a 0').optional(),
  isDraft: z.boolean().optional()
})

export const updateVariantSchema = z.object({
  additional: z.number().min(0, 'El precio adicional debe ser 0 o mayor')
})

export const addVariantSchema = z.object({
  gender: z.enum(['HOMBRE', 'MUJER', 'UNISEX']),
  size: z.string().min(1, 'Selecciona una talla'),
  additional: z.number().min(0, 'El precio adicional debe ser 0 o mayor')
})

export const deleteImageSchema = z.object({
  url: z.string().url('URL de imagen inválida')
})

export type UpdateClothesInput = z.infer<typeof updateClothesSchema>
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>
export type AddVariantInput = z.infer<typeof addVariantSchema>
export type DeleteImageInput = z.infer<typeof deleteImageSchema>
