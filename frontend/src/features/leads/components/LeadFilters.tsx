'use client'

import { useLeadSources, useLeadsSearchParams } from '../hooks/useLeads'

const LEAD_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'converted', label: 'Converted' },
]

export function LeadFilters() {
  const { q, status, source, owner, setParam } = useLeadsSearchParams()
  const { data: sources } = useLeadSources()

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="search"
        placeholder="Search name, email, phone…"
        defaultValue={q ?? ''}
        onChange={(e) => setParam('q', e.target.value)}
        className="w-60 rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        aria-label="Search leads"
      />
      <select
        value={status ?? ''}
        onChange={(e) => setParam('status', e.target.value)}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        aria-label="Filter by status"
      >
        {LEAD_STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select
        value={source ?? ''}
        onChange={(e) => setParam('source', e.target.value)}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        aria-label="Filter by source"
      >
        <option value="">All sources</option>
        {sources?.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
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
