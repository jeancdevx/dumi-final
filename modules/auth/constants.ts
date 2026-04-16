import type { Role } from './types'

export const ROLES = {
  OWNER: 'owner',
  SELLER: 'seller'
} as const satisfies Record<string, Role>

export const REDIRECT_PATHS: Record<Role, string> = {
  owner: '/admin',
  seller: '/seller'
}

export const AUTH_COOKIES = {
  ID_TOKEN: 'telar.idToken',
  REFRESH_TOKEN: 'telar.refreshToken'
} as const

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos',
  EMAIL_NOT_CONFIRMED: 'Debes confirmar tu correo antes de iniciar sesión',
  SESSION_EXPIRED: 'Tu sesión ha expirado, por favor inicia sesión nuevamente',
  UNAUTHORIZED: 'No tienes permisos para acceder a esta página',
  UNKNOWN: 'Ocurrió un error inesperado, intenta nuevamente'
} as const

export const COGNITO = {
  REGION: process.env.NEXT_PUBLIC_AWS_COGNITO_REGION ?? 'us-east-1',
  CLIENT_ID: process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID ?? ''
} as const
