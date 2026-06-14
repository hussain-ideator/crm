'use client'

import { useContactsSearchParams } from '../hooks/useContactsSearchParams'

export function ContactFilters() {
  const { q, company, owner, setParam } = useContactsSearchParams()

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="search"
        placeholder="Search name, email, phone…"
        defaultValue={q ?? ''}
        onChange={(e) => setParam('q', e.target.value)}
        className="w-60 rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        aria-label="Search contacts"
      />
      <input
        type="number"
        placeholder="Company ID"
        defaultValue={company ?? ''}
        onChange={(e) => setParam('company', e.target.value)}
        className="w-32 rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        aria-label="Filter by company"
      />
      <input
        type="number"
        placeholder="Owner ID"
        defaultValue={owner ?? ''}
        onChange={(e) => setParam('owner', e.target.value)}
        className="w-28 rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        aria-label="Filter by owner ID"
      />
    </div>
  )
}
