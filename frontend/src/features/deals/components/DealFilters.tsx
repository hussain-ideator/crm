'use client'

import { usePipelines } from '../hooks/usePipelines'
import { useDealsSearchParams } from '../hooks/useDeals'

export function DealFilters() {
  const { q, stage, pipeline, owner, company, setParam } = useDealsSearchParams()
  const { data: pipelines } = usePipelines()

  const selectedPipeline = pipelines?.find((p) => p.id === pipeline)
  const stageOptions = selectedPipeline?.stages ?? []

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="search"
        placeholder="Search name or company…"
        defaultValue={q ?? ''}
        onChange={(e) => setParam('q', e.target.value)}
        className="w-60 rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        aria-label="Search deals"
      />
      <select
        value={pipeline ?? ''}
        onChange={(e) => {
          setParam('pipeline', e.target.value)
          setParam('stage', null)
        }}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        aria-label="Filter by pipeline"
      >
        <option value="">All pipelines</option>
        {pipelines?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select
        value={stage ?? ''}
        onChange={(e) => setParam('stage', e.target.value)}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        aria-label="Filter by stage"
        disabled={stageOptions.length === 0}
      >
        <option value="">All stages</option>
        {stageOptions.map((s) => (
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
      <input
        type="number"
        placeholder="Company ID"
        defaultValue={company ?? ''}
        onChange={(e) => setParam('company', e.target.value)}
        className="w-28 rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        aria-label="Filter by company ID"
      />
    </div>
  )
}
