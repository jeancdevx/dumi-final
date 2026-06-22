import { z } from 'zod'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es obligatorio')
    .regex(emailRegex, 'Ingresa un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es obligatoria')
})

export const signUpSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(40, 'El nombre no puede exceder 40 caracteres')
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      'El nombre solo puede incluir letras y espacios'
    ),
  lastName: z
    .string()
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(40, 'El apellido no puede exceder 40 caracteres')
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      'El apellido solo puede incluir letras y espacios'
    ),
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es obligatorio')
    .regex(emailRegex, 'Ingresa un correo electrónico válido'),
  password: z
    .string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .max(64, 'La contraseña no puede exceder 64 caracteres')
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
      'La contraseña debe incluir mayúsculas, minúsculas, números y símbolos'
    ),
  acceptedTerms: z.boolean().refine(val => val, {
    message: 'Debes aceptar los términos y la política de privacidad'
  })
})

export const otpVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es obligatorio')
    .regex(emailRegex, 'Ingresa un correo electrónico válido'),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos')
})

export const tenantSetupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre de la empresa es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  ruc: z
    .string()
    .optional()
    .refine(val => !val || /^(10|20)\d{9}$/.test(val), {
      message: 'El RUC debe comenzar con 10 o 20 y tener exactamente 11 dígitos'
    }),
  address: z
    .string()
    .trim()
    .max(256, 'La dirección no puede exceder 256 caracteres')
    .optional()
})
export const forceChangePasswordSchema = z.object({
  password: z
    .string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .max(64, 'La contraseña no puede exceder 64 caracteres')
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
      'La contraseña debe incluir mayúsculas, minúsculas, números y símbolos'
    )
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es obligatorio')
    .regex(emailRegex, 'Ingresa un correo electrónico válido')
})

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es obligatorio')
    .regex(emailRegex, 'Ingresa un correo electrónico válido'),
  code: z
    .string()
    .trim()
    .regex(/^\d+$/, 'El código debe contener solo dígitos')
    .min(1, 'El código es obligatorio'),
  password: z
    .string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .max(64, 'La contraseña no puede exceder 64 caracteres')
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
      'La contraseña debe incluir mayúsculas, minúsculas, números y símbolos'
    )
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type OtpVerificationInput = z.infer<typeof otpVerificationSchema>
export type TenantSetupInput = z.infer<typeof tenantSetupSchema>
export type ForceChangePasswordInput = z.infer<typeof forceChangePasswordSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
