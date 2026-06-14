'use client'

import { useQuery } from '@tanstack/react-query'

import { getContact } from '../api'

export function useContact(id: number | undefined) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => getContact(id as number),
    enabled: id !== undefined,
    retry: (failureCount, error) => {
      if ((error as { status?: number }).status === 404) return false
      return failureCount < 3
    },
  })
}
