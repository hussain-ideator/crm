'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import type { ContactListParams } from '../types'

export function useContactsSearchParams(): ContactListParams & {
  setParam: (key: string, value: string | null) => void
} {
  const router = useRouter()
  const searchParams = useSearchParams()

  const q = searchParams.get('q') ?? undefined
  const companyRaw = searchParams.get('company')
  const company = companyRaw ? Number(companyRaw) : undefined
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

  return { q, company, owner, ordering, page, page_size, setParam }
}
