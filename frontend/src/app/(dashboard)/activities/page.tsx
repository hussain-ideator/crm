'use client'

import { Suspense } from 'react'
import Link from 'next/link'

import { ActivityFilters } from '@/features/activities/components/ActivityFilters'
import { ActivityTable } from '@/features/activities/components/ActivityTable'
import { useActivities, useActivitiesSearchParams } from '@/features/activities/hooks/useActivities'

function ActivitiesListContent() {
  const { params, setParams } = useActivitiesSearchParams()
  const { data, isPending } = useActivities(params)

  const page = params.page ?? 1
  const totalPages = data ? Math.ceil(data.count / (params.page_size ?? 25)) : 1

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Activities</h1>
        <Link
          href="/activities/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Log Activity
        </Link>
      </div>

      <div className="mb-4">
        <ActivityFilters />
      </div>

      {isPending ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        </div>
      ) : (
        <>
          <ActivityTable
            activities={data?.results ?? []}
            ordering={params.ordering}
            onSort={(field) => setParams({ ordering: field })}
          />

          {data && data.count > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
              <span>
                {data.count} total · Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={!data.previous}
                  onClick={() => setParams({ page: page - 1 })}
                  className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-40 dark:border-zinc-600"
                >
                  Previous
                </button>
                <button
                  disabled={!data.next}
                  onClick={() => setParams({ page: page + 1 })}
                  className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-40 dark:border-zinc-600"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function ActivitiesPage() {
  return (
    <Suspense>
      <ActivitiesListContent />
    </Suspense>
  )
}
