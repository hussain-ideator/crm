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
