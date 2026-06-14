'use client'

import { type ReactNode, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getQueryClient } from '@/lib/query-client'

/**
 * App-wide TanStack Query provider. Holds the client in state so it survives
 * re-renders, and mounts Devtools (the bundle is dev-only by default).
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(getQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
