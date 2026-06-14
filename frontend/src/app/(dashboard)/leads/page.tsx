'use client'

import { Suspense } from 'react'
import Link from 'next/link'

import { LeadFilters } from '@/features/leads/components/LeadFilters'
import { LeadTable } from '@/features/leads/components/LeadTable'
import { useLeads, useLeadsSearchParams } from '@/features/leads/hooks/useLeads'

function LeadsContent() {
  const { q, status, source, owner, ordering, page, page_size } = useLeadsSearchParams()

  const { data, isPending, isError } = useLeads({
    q,
    status,
    source,
    owner,
    ordering,
    page,
    page_size,
  })

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Leads
        </h1>
        <Link
          href="/leads/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New Lead
        </Link>
      </div>

      <LeadFilters />

      {isPending && (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                {['Name', 'Company', 'Email', 'Phone', 'Status', 'Source', 'Owner', 'Created'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-zinc-100 dark:border-zinc-700">
                  {Array.from({ length: 8 }).map((__, j) => (
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
          Failed to load leads. Please try again.
        </p>
      )}

      {!isPending && data && data.results.length === 0 && (
        <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No leads found.
        </p>
      )}

      {data && data.results.length > 0 && (
        <LeadTable data={data} page={page ?? 1} pageSize={page_size ?? 25} />
      )}
    </main>
  )
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-zinc-500">Loading…</p>}>
      <LeadsContent />
    </Suspense>
  )
}
