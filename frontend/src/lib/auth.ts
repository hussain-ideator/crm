/**
 * Module-level access token store.
 *
 * The access token lives only in this module variable — never in localStorage,
 * sessionStorage, or a cookie. It is cleared on page refresh (intentionally:
 * the refresh cookie survives and transparently reissues a new access token on
 * the first authenticated request after reload).
 */

let accessToken: string | null = null

export function setAccessToken(token: string): void {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

export function clearAccessToken(): void {
  accessToken = null
}

/**
 * Decodes the JWT `exp` claim without a library and returns true if the token
 * is missing or expires within the next 10 seconds.
 */
export function isTokenExpired(token: string | null = accessToken): boolean {
  if (!token) return true
  try {
    const segment = token.split('.')[1]
    if (!segment) return true
    const payload = JSON.parse(atob(segment))
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now() + 10_000
  } catch {
    return true
  }
}

// Singleton Promise used to collapse concurrent refresh calls into one.
let refreshPromise: Promise<string> | null = null

export function getRefreshPromise(): Promise<string> | null {
  return refreshPromise
}

export function setRefreshPromise(p: Promise<string> | null): void {
  refreshPromise = p
}

/**
 * Calls POST /api/auth/refresh (browser sends the httpOnly cookie automatically).
 * Updates the in-memory access token on success, throws on 401 / network error.
 *
 * Uses the singleton `refreshPromise` so that multiple concurrent callers
 * collapse into one in-flight request (RES-005).
 */
export async function refreshAccessToken(): Promise<string> {
  const existing = getRefreshPromise()
  if (existing) return existing

  const promise = (async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) {
        clearAccessToken()
        throw new Error('Session expired. Please log in again.')
      }
      const data = (await response.json()) as { access: string }
      setAccessToken(data.access)
      return data.access
    } finally {
      setRefreshPromise(null)
    }
  })()

  setRefreshPromise(promise)
  return promise
}

/**
 * Returns a valid access token, refreshing silently if the current one is
 * expired. Throws if the refresh itself fails (session expired).
 */
export async function getValidAccessToken(): Promise<string> {
  if (!isTokenExpired()) {
    return accessToken as string
  }
  return refreshAccessToken()
}
