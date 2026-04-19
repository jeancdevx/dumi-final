import 'server-only'

import { cookies } from 'next/headers'

import { AUTH_COOKIES } from '@/modules/auth/constants'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface FetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>
}

export async function fetchWithAuth<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const cookieStore = await cookies()
  const idToken = cookieStore.get(AUTH_COOKIES.ID_TOKEN)?.value

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new FetchError(response.status, error.message || 'Request failed')
  }

  return response.json()
}

export class FetchError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'FetchError'
  }
}
