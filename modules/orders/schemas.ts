import { addDays, startOfDay } from 'date-fns'
import { z } from 'zod'

import { DELIVERY_DATE_MAX_DAYS, DELIVERY_DATE_MIN_DAYS } from './constants'

// Obtiene el "hoy" en la zona horaria de Lima
function getTodayInLima(): Date {
  const limaStr = new Date().toLocaleString('en-US', {
    timeZone: 'America/Lima'
  })
  return startOfDay(new Date(limaStr))
}

// Schema para dirección
export const addressSchemaRefined = z.object({
  department: z.string().min(1, 'El departamento es requerido'),
  city: z.string().min(1, 'La ciudad o provincia es requerida'),
  district: z.string().min(1, 'El distrito es requerido'),
  street: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección es muy larga')
})

// Schema para crear orden
export const createOrderSchema = z.object({
  quoteId: z.string().uuid('ID de cotización inválido'),
  deliveryDate: z
    .date({
      message: 'La fecha de entrega es requerida'
    })
    .refine(date => {
      const today = getTodayInLima()
      const minDate = addDays(today, DELIVERY_DATE_MIN_DAYS)
      return date >= minDate
    }, `La fecha de entrega debe ser al menos ${DELIVERY_DATE_MIN_DAYS} días después de hoy`)
    .refine(date => {
      const today = getTodayInLima()
      const maxDate = addDays(today, DELIVERY_DATE_MAX_DAYS)
      return date <= maxDate
    }, `La fecha de entrega no puede ser más de ${DELIVERY_DATE_MAX_DAYS} días después de hoy`),
  address: addressSchemaRefined
})

// Tipo inferido del schema
export type CreateOrderFormValues = z.infer<typeof createOrderSchema>

// Valores por defecto
export const createOrderDefaultValues: Partial<CreateOrderFormValues> = {
  deliveryDate: undefined,
  address: {
    department: '',
    city: '',
    district: '',
    street: ''
  }
}

// Schema para cancelar orden
export const cancelOrderSchema = z.object({
  reason: z
    .string()
    .min(10, 'El motivo debe tener al menos 10 caracteres')
    .max(500, 'El motivo no puede exceder 500 caracteres')
})

// Tipo inferido del schema de cancelación
export type CancelOrderFormValues = z.infer<typeof cancelOrderSchema>

// Valores por defecto para cancelar orden
export const cancelOrderDefaultValues: CancelOrderFormValues = {
  reason: ''
}
