'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { AUTH_COOKIES, ECOMMERCE_ROUTES } from '../constants'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function logoutCustomer(): Promise<void> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(AUTH_COOKIES.ACCESS_TOKEN)?.value
  const antiCsrf = cookieStore.get(AUTH_COOKIES.ANTI_CSRF)?.value

  // Solo eliminamos las cookies locales,
  // el backend no tiene un endpoint de signout y Cognito maneja JWTs sin estado.

  // Eliminar cookies locales
  cookieStore.delete(AUTH_COOKIES.ACCESS_TOKEN)
  cookieStore.delete(AUTH_COOKIES.REFRESH_TOKEN)
  cookieStore.delete(AUTH_COOKIES.ANTI_CSRF)
  cookieStore.delete(AUTH_COOKIES.FRONT_TOKEN)

  redirect(ECOMMERCE_ROUTES.SIGN_IN)
}
