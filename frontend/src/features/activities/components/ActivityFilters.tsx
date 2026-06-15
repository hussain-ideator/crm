'use client'

import { useActivitiesSearchParams } from '../hooks/useActivities'

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'task', label: 'Task' },
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
]

const inputCls =
  'rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50'

export function ActivityFilters() {
  const { params, setParams, clearParams } = useActivitiesSearchParams()

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Search</label>
        <input
          type="text"
          className={inputCls}
          placeholder="Search subject or description…"
          value={params.q ?? ''}
          onChange={(e) => setParams({ q: e.target.value || undefined })}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Type</label>
        <select
          className={inputCls}
          value={params.type ?? ''}
          onChange={(e) => setParams({ type: (e.target.value as typeof params.type) || undefined })}
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={clearParams}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
      >
        Clear Filters
      </button>
    </div>
  )
}
