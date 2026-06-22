import { refreshClientSession } from '@/modules/auth/lib/session-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const DEFAULT_TIMEOUT_MS = 15000

interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown
  headers?: Record<string, string>
  token?: string | null
  timeoutMs?: number
  retryOnUnauthorized?: boolean
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function parseResponseBody(response: Response) {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function getErrorMessage(body: unknown, fallback: string) {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message?: unknown }).message

    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
  }

  return fallback
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  if (!API_URL) {
    throw new ApiError(0, 'NEXT_PUBLIC_API_URL no está configurada', null)
  }

  const retryOnUnauthorized = options.retryOnUnauthorized ?? true

  const controller = new AbortController()
  const timeout = window.setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  )

  try {
    const response = await fetchWithOptions(
      endpoint,
      options,
      controller.signal
    )
    const body = await parseResponseBody(response)

    if (response.status === 401 && retryOnUnauthorized && options.token) {
      const refreshedToken = await refreshClientSession()

      if (refreshedToken) {
        const retryResponse = await fetchWithOptions(
          endpoint,
          {
            ...options,
            token: refreshedToken,
            retryOnUnauthorized: false
          },
          controller.signal
        )
        const retryBody = await parseResponseBody(retryResponse)

        if (!retryResponse.ok) {
          throw new ApiError(
            retryResponse.status,
            getErrorMessage(
              retryBody,
              `Request failed with status ${retryResponse.status}`
            ),
            retryBody
          )
        }

        return retryBody as T
      }
    }

    if (!response.ok) {
      throw new ApiError(
        response.status,
        getErrorMessage(body, `Request failed with status ${response.status}`),
        body
      )
    }

    return body as T
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(408, 'La solicitud tardó demasiado en responder', null)
    }

    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

function buildHeaders(options: ApiRequestOptions) {
  const headers: Record<string, string> = {
    ...options.headers
  }

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json'
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  return headers
}

function buildRequestBody(options: ApiRequestOptions) {
  if (options.body instanceof FormData || typeof options.body === 'string') {
    return options.body
  }

  if (options.body !== undefined) {
    return JSON.stringify(options.body)
  }

  return undefined
}

function fetchWithOptions(
  endpoint: string,
  options: ApiRequestOptions,
  signal: AbortSignal
) {
  const fetchOptions: RequestInit = {
    method: options.method,
    mode: options.mode,
    credentials: options.credentials,
    cache: options.cache ?? 'no-store',
    redirect: options.redirect,
    referrer: options.referrer,
    referrerPolicy: options.referrerPolicy,
    integrity: options.integrity,
    keepalive: options.keepalive,
    priority: options.priority,
    next: options.next
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    signal,
    headers: buildHeaders(options),
    body: buildRequestBody(options)
  })
}
