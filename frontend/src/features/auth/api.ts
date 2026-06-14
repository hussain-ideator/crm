import { authFetch } from '@/lib/api'
import { clearAccessToken } from '@/lib/auth'
import type { AccessTokenResponse, AuthError, LoginRequest } from './types'

export async function login(email: string, password: string): Promise<AccessTokenResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password } satisfies LoginRequest),
  })

  if (!response.ok) {
    const err: AuthError = await response.json().catch(() => ({ detail: 'Login failed' }))
    throw new Error(err.detail)
  }

  return response.json() as Promise<AccessTokenResponse>
}

/**
 * Sends the Bearer access token to the server so the refresh cookie is revoked
 * server-side (FR-011), then clears the in-memory access token regardless of
 * the server response, and redirects to /login.
 */
export async function logout(): Promise<void> {
  try {
    await authFetch('/auth/logout', { method: 'POST' })
  } finally {
    clearAccessToken()
    window.location.href = '/login'
  }
}
