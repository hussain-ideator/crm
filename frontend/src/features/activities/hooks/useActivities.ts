'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

import { fetchActivities } from '../api'
import type { ActivitiesQueryParams } from '../types'

export function useActivities(params: ActivitiesQueryParams = {}) {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => fetchActivities(params),
    staleTime: 30_000,
  })
}

export function useActivitiesSearchParams() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const params: ActivitiesQueryParams = {
    q: searchParams.get('q') ?? undefined,
    type: (searchParams.get('type') as ActivitiesQueryParams['type']) ?? undefined,
    assigned_to: searchParams.get('assigned_to') ? Number(searchParams.get('assigned_to')) : undefined,
    ordering: searchParams.get('ordering') ?? undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
    page_size: searchParams.get('page_size') ? Number(searchParams.get('page_size')) : undefined,
  }

  const setParams = useCallback(
    (updates: Partial<ActivitiesQueryParams>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === null || value === '') {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
      }
      // Reset page when filters change (except when page itself changes)
      if (!('page' in updates)) {
        next.delete('page')
      }
      router.replace(`?${next.toString()}`)
    },
    [searchParams, router],
  )

  const clearParams = useCallback(() => {
    router.replace('?')
  }, [router])

  return { params, setParams, clearParams }
}
