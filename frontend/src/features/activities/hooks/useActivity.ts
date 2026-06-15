'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchActivity } from '../api'

export function useActivity(id: number) {
  return useQuery({
    queryKey: ['activity', id],
    queryFn: () => fetchActivity(id),
    enabled: !!id,
    staleTime: 30_000,
  })
}
