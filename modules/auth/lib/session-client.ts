'use client'

import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand
} from '@aws-sdk/client-cognito-identity-provider'
import { decodeJwt } from 'jose'

import { AUTH_COOKIES, COGNITO, REDIRECT_PATHS } from '../constants'
import type { CognitoJWTPayload, Role, UserSession } from '../types'

const ID_TOKEN_STORAGE_KEY = 'telar.idToken'
const REFRESH_TOKEN_STORAGE_KEY = 'telar.refreshToken'
const TOKEN_EXPIRY_LEEWAY_SECONDS = 30

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO.REGION
})

let refreshSessionPromise: Promise<string | null> | null = null

function getCookieMaxAge(token: string) {
  try {
    const payload = decodeJwt<CognitoJWTPayload>(token)
    const now = Math.floor(Date.now() / 1000)

    if (payload.exp && payload.exp > now) {
      return payload.exp - now
    }
  } catch {
    return 60 * 60
  }

  return 60 * 60
}

function setBrowserCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`
}

function deleteBrowserCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`
}

export function saveClientSession(tokens: {
  idToken: string
  refreshToken?: string
}) {
  const maxAge = getCookieMaxAge(tokens.idToken)

  window.localStorage.setItem(ID_TOKEN_STORAGE_KEY, tokens.idToken)
  setBrowserCookie(AUTH_COOKIES.ID_TOKEN, tokens.idToken, maxAge)

  if (tokens.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken)
    setBrowserCookie(
      AUTH_COOKIES.REFRESH_TOKEN,
      tokens.refreshToken,
      60 * 60 * 24 * 30
    )
  }
}

export function clearClientSession() {
  window.localStorage.removeItem(ID_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  deleteBrowserCookie(AUTH_COOKIES.ID_TOKEN)
  deleteBrowserCookie(AUTH_COOKIES.REFRESH_TOKEN)
}

export function getClientIdToken() {
  return window.localStorage.getItem(ID_TOKEN_STORAGE_KEY)
}

export function getClientRefreshToken() {
  return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
}

function decodeClientIdToken() {
  const idToken = getClientIdToken()

  if (!idToken) return null

  try {
    return decodeJwt<CognitoJWTPayload>(idToken)
  } catch {
    clearClientSession()
    return null
  }
}

function isTokenExpired(payload: CognitoJWTPayload) {
  const now = Math.floor(Date.now() / 1000)
  return Boolean(
    payload.exp && payload.exp <= now + TOKEN_EXPIRY_LEEWAY_SECONDS
  )
}

export function normalizeRoles(rawRoles: string[] = []): Role[] {
  return rawRoles
    .map(role => role.toLowerCase())
    .filter(
      (role): role is Role =>
        role === 'owner' || role === 'admin' || role === 'seller'
    )
}

export function getClientSession(): UserSession | null {
  const payload = decodeClientIdToken()

  if (!payload) return null

  if (isTokenExpired(payload) && !getClientRefreshToken()) {
    clearClientSession()
    return null
  }

  return {
    userId: payload.sub,
    email: payload.email,
    name: payload.name,
    familyName: payload.family_name,
    roles: normalizeRoles(payload['cognito:groups']),
    tenantId: payload['custom:tenant_id'] ?? null
  }
}

export function getRedirectPathByRole(roles: Role[]): string {
  if (roles.includes('owner')) return REDIRECT_PATHS.owner
  if (roles.includes('admin')) return REDIRECT_PATHS.admin
  if (roles.includes('seller')) return REDIRECT_PATHS.seller

  return '/sign-in'
}

export function getRedirectPathFromToken(idToken: string) {
  const payload = decodeJwt<CognitoJWTPayload>(idToken)
  const roles = normalizeRoles(payload['cognito:groups'])

  if (!payload['custom:tenant_id']) {
    return '/tenant-setup'
  }

  return getRedirectPathByRole(roles)
}

async function refreshClientSessionInternal() {
  const refreshToken = getClientRefreshToken()

  if (!refreshToken) {
    clearClientSession()
    return null
  }

  try {
    const response = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
        ClientId: COGNITO.CLIENT_ID,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken
        }
      })
    )

    const idToken = response.AuthenticationResult?.IdToken

    if (!idToken) {
      clearClientSession()
      return null
    }

    saveClientSession({ idToken, refreshToken })
    return idToken
  } catch (error) {
    console.error('Refresh session error:', error)
    clearClientSession()
    return null
  }
}

export async function refreshClientSession() {
  if (!refreshSessionPromise) {
    refreshSessionPromise = refreshClientSessionInternal().finally(() => {
      refreshSessionPromise = null
    })
  }

  return refreshSessionPromise
}

export async function getFreshClientIdToken() {
  const idToken = getClientIdToken()
  const payload = decodeClientIdToken()

  if (idToken && payload && !isTokenExpired(payload)) {
    return idToken
  }

  return refreshClientSession()
}
