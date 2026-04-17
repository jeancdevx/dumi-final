import { z } from 'zod'

export const createEmployeeSchema = z.object({
  names: z.string().min(2, 'Los nombres deben tener al menos 2 caracteres'),
  lastNames: z
    .string()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres'),
  email: z.email('El correo electrónico no tiene un formato válido'),
  role: z.enum(['seller', 'admin'])
})

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>
