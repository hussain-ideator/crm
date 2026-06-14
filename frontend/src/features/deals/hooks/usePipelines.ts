'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchPipelines } from '../api'
import type { Pipeline } from '../types'

export function usePipelines() {
  return useQuery<Pipeline[]>({
    queryKey: ['pipelines'],
    queryFn: () => fetchPipelines(),
    staleTime: 300_000,
  })
}
