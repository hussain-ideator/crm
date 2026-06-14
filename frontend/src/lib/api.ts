/**
 * Minimal fetch wrapper for the CRM backend.
 *
 * - Reads the base URL from NEXT_PUBLIC_API_BASE_URL.
 * - Optionally attaches a bearer token via a caller-supplied getter (auth
 *   wiring lands in a later session — nothing here reads cookies or storage).
 * - Returns parsed JSON; throws ApiError on any non-2xx response.
 *
 * Per the standards: this is the ONLY place raw fetch lives. Components and
 * hooks go through TanStack Query, which calls into this module.
 */

import { getValidAccessToken, clearAccessToken } from '@/lib/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api'

/** Returns a bearer token (or null) for the current request, sync or async. */
export type TokenGetter = () => string | null | Promise<string | null>

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  /** Plain object serialized to JSON, or a pre-built BodyInit. */
  body?: unknown
  /** Resolves the auth token to send as `Authorization: Bearer <token>`. */
  getToken?: TokenGetter
}

/**
 * Performs an API request against NEXT_PUBLIC_API_BASE_URL and returns the
 * parsed JSON body. Throws ApiError for non-2xx responses.
 */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, getToken, headers, ...init } = options

  const requestHeaders = new Headers(headers)
  const isJsonBody = body !== undefined && !(body instanceof FormData)
  if (isJsonBody) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (getToken) {
    const token = await getToken()
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: requestHeaders,
    body: isJsonBody ? JSON.stringify(body) : (body as BodyInit | undefined),
  })

  const text = await response.text()
  const data: unknown = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new ApiError(response.status, `Request to ${path} failed (${response.status})`, data)
  }

  return data as T
}

/**
 * Authenticated fetch — ensures a valid access token is in memory (refreshing
 * silently if expired), injects the Bearer header, and retries once on 401
 * (handles the race where a token expires between the check and the request).
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const doRequest = async (token: string | null) => {
    const headers = new Headers(init.headers)
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return fetch(`${API_BASE_URL}${path}`, { ...init, headers, credentials: 'include' })
  }

  let token: string | null
  try {
    token = await getValidAccessToken()
  } catch {
    // Refresh failed — proceed without token; caller will handle 401.
    token = null
  }

  const response = await doRequest(token)

  if (response.status === 401 && token !== null) {
    // Token may have expired between the check and the server response; retry once.
    try {
      const { refreshAccessToken } = await import('@/lib/auth')
      const fresh = await refreshAccessToken()
      return doRequest(fresh)
    } catch {
      clearAccessToken()
      return response
    }
  }

  return response
}
