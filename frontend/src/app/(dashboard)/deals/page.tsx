'use client'

import { Suspense } from 'react'
import Link from 'next/link'

import { DealFilters } from '@/features/deals/components/DealFilters'
import { DealTable } from '@/features/deals/components/DealTable'
import { useDeals, useDealsSearchParams } from '@/features/deals/hooks/useDeals'

function DealsContent() {
  const { q, stage, pipeline, owner, company, ordering, page, page_size } = useDealsSearchParams()

  const { data, isPending, isError } = useDeals({
    q,
    stage,
    pipeline,
    owner,
    company,
    ordering,
    page,
    page_size,
  })

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Deals
        </h1>
        <Link
          href="/deals/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New Deal
        </Link>
      </div>

      <DealFilters />

      {isPending && (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                {['Name', 'Amount', 'Stage', 'Probability', 'Close Date', 'Owner', 'Company'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-zinc-100 dark:border-zinc-700">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load deals. Please try again.
        </p>
      )}

      {!isPending && data && data.count === 0 && (
        <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No deals found.
        </p>
      )}

      {data && data.count > 0 && (
        <DealTable data={data} page={page ?? 1} pageSize={page_size ?? 25} />
      )}
    </main>
  )
}

export default function DealsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-zinc-500">Loading…</p>}>
      <DealsContent />
    </Suspense>
  )
}
