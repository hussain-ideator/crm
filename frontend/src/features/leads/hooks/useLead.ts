'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchLead } from '../api'

export function useLead(id: number) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLead(id),
    enabled: !!id,
  })
}
