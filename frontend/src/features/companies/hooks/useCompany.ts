'use client'

import { useQuery } from '@tanstack/react-query'

import { getCompany } from '../api'

export function useCompany(id: number | undefined) {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => getCompany(id as number),
    enabled: id !== undefined,
  })
}
