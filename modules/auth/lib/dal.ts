import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { decodeJwt } from 'jose'

import { AUTH_COOKIES, REDIRECT_PATHS } from '../constants'
import type { CognitoJWTPayload, Role, UserSession } from '../types'

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const idToken = cookieStore.get(AUTH_COOKIES.ID_TOKEN)?.value

  if (!idToken) {
    return null
  }

  try {
    const payload = decodeJwt<CognitoJWTPayload>(idToken)

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return null
    }

    const roles: Role[] = payload['cognito:groups'] ?? []
    const tenantId = payload['custom:tenant_id'] ?? null

    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      familyName: payload.family_name,
      roles,
      tenantId
    }
  } catch {
    return null
  }
}

export async function verifySession(): Promise<UserSession> {
  const session = await getSession()

  if (!session) {
    redirect('/sign-in')
  }

  return session
}

export async function requireRole(allowedRoles: Role[]): Promise<UserSession> {
  const session = await getSession()

  if (!session) {
    redirect('/sign-in')
  }

  const hasRole = session.roles.some(role => allowedRoles.includes(role))

  if (!hasRole) {
    redirect('/unauthorized')
  }

  // Si no tiene tenant configurado, redirigir al setup
  if (!session.tenantId) {
    redirect('/tenant-setup')
  }

  return session
}

export function getRedirectPathByRole(roles: Role[]): string {
  if (roles.includes('owner')) {
    return REDIRECT_PATHS.owner
  }

  if (roles.includes('seller')) {
    return REDIRECT_PATHS.seller
  }

  return '/sign-in'
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIES.ID_TOKEN)
  cookieStore.delete(AUTH_COOKIES.REFRESH_TOKEN)
}
