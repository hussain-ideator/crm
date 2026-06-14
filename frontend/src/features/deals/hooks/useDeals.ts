'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { fetchDeals } from '../api'
import type { DealListParams } from '../types'

export function useDealsSearchParams(): DealListParams & {
  setParam: (key: string, value: string | null) => void
} {
  const router = useRouter()
  const searchParams = useSearchParams()

  const q = searchParams.get('q') ?? undefined
  const stageRaw = searchParams.get('stage')
  const stage = stageRaw ? Number(stageRaw) : undefined
  const pipelineRaw = searchParams.get('pipeline')
  const pipeline = pipelineRaw ? Number(pipelineRaw) : undefined
  const ownerRaw = searchParams.get('owner')
  const owner = ownerRaw ? Number(ownerRaw) : undefined
  const companyRaw = searchParams.get('company')
  const company = companyRaw ? Number(companyRaw) : undefined
  const ordering = searchParams.get('ordering') ?? undefined
  const pageRaw = searchParams.get('page')
  const page = pageRaw ? Math.max(1, Number(pageRaw)) : 1
  const pageSizeRaw = searchParams.get('page_size')
  const page_size = pageSizeRaw ? Math.min(100, Math.max(1, Number(pageSizeRaw))) : 25

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      if (key !== 'page') params.delete('page')
      router.replace(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  return { q, stage, pipeline, owner, company, ordering, page, page_size, setParam }
}

export function useDeals(params: DealListParams = {}) {
  return useQuery({
    queryKey: ['deals', params],
    queryFn: () => fetchDeals(params),
    staleTime: 30_000,
  })
}
