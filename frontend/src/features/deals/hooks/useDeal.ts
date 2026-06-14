'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchDeal } from '../api'
import type { Deal } from '../types'

export function useDeal(id: number) {
  return useQuery<Deal>({
    queryKey: ['deal', id],
    queryFn: () => fetchDeal(id),
  })
}
