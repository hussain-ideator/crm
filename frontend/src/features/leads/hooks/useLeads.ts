'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { fetchLeads, fetchLeadSources } from '../api'
import type { LeadListParams, LeadSource } from '../types'

export function useLeadsSearchParams(): LeadListParams & {
  setParam: (key: string, value: string | null) => void
} {
  const router = useRouter()
  const searchParams = useSearchParams()

  const q = searchParams.get('q') ?? undefined
  const statusVal = searchParams.get('status') ?? undefined
  const sourceRaw = searchParams.get('source')
  const source = sourceRaw ? Number(sourceRaw) : undefined
  const ownerRaw = searchParams.get('owner')
  const owner = ownerRaw ? Number(ownerRaw) : undefined
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

  return { q, status: statusVal, source, owner, ordering, page, page_size, setParam }
}

export function useLeads(params: LeadListParams = {}) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => fetchLeads(params),
  })
}

export function useLeadSources() {
  return useQuery<LeadSource[]>({
    queryKey: ['lead-sources'],
    queryFn: () => fetchLeadSources(),
    staleTime: 5 * 60 * 1000,
  })
}
