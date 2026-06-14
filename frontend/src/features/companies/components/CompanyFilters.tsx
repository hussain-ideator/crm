'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function CompanyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Reset to page 1 whenever a filter changes
      params.delete('page')
      router.replace(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="search"
        placeholder="Search name, website, phone…"
        defaultValue={searchParams.get('q') ?? ''}
        onChange={(e) => update('q', e.target.value)}
        className="w-60 rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        aria-label="Search companies"
      />
      <input
        type="text"
        placeholder="Industry"
        defaultValue={searchParams.get('industry') ?? ''}
        onChange={(e) => update('industry', e.target.value)}
        className="w-40 rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        aria-label="Filter by industry"
      />
      <input
        type="number"
        placeholder="Owner ID"
        defaultValue={searchParams.get('owner') ?? ''}
        onChange={(e) => update('owner', e.target.value)}
        className="w-28 rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        aria-label="Filter by owner ID"
      />
    </div>
  )
}
