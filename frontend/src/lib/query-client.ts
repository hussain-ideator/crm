import { QueryClient } from '@tanstack/react-query'

const isDev = process.env.NODE_ENV !== 'production'

/**
 * Builds a QueryClient with the project's default behaviour. Each browser
 * session/SSR pass should own one instance (see providers/query-provider).
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Avoid noisy refetches while developing; production keeps the default.
        refetchOnWindowFocus: !isDev,
      },
    },
  })
}

/** Process-wide singleton for the browser. */
let browserQueryClient: QueryClient | undefined

/**
 * Returns a QueryClient: a fresh one per request on the server, a reused
 * singleton in the browser so client navigations keep their cache.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}
