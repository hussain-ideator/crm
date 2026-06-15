'use client'

import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { DeleteDealButton } from '@/features/deals/components/DeleteDealButton'
import { useDeal } from '@/features/deals/hooks/useDeal'
import { ActivityFeed } from '@/features/activities/components/ActivityFeed'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 border-b border-zinc-100 py-3 last:border-0 dark:border-zinc-700">
      <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="col-span-2 break-words text-sm text-zinc-900 dark:text-zinc-100">
        {value ?? <span className="text-zinc-400">—</span>}
      </dd>
    </div>
  )
}

function DealDetail({ id }: { id: number }) {
  const router = useRouter()
  const { data: deal, isPending, isError, error } = useDeal(id)

  const errorStatus = isError ? (error as { status?: number }).status : undefined

  useEffect(() => {
    if (errorStatus === 404) {
      router.push('/deals')
    }
  }, [errorStatus, router])

  if (isPending) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
  }

  if (isError) {
    if (errorStatus === 404) return null
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <p className="font-medium text-red-700 dark:text-red-400">Failed to load deal.</p>
        <button
          onClick={() => router.push('/deals')}
          className="mt-3 text-sm text-red-600 underline dark:text-red-400"
        >
          Back to deals
        </button>
      </div>
    )
  }

  const wonBadge = deal.is_won ? (
    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
      Won
    </span>
  ) : deal.is_lost ? (
    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-300">
      Lost
    </span>
  ) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {deal.name}
          </h1>
          {wonBadge && <div className="mt-2">{wonBadge}</div>}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href={`/deals/${deal.id}/edit`}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Edit
          </Link>
          <DeleteDealButton
            id={deal.id}
            dealName={deal.name}
            onDeleted={() => router.push('/deals')}
          />
        </div>
      </div>

      <dl className="rounded-lg border border-zinc-200 bg-white px-6 dark:border-zinc-700 dark:bg-zinc-900">
        <DetailRow label="Name" value={deal.name} />
        <DetailRow
          label="Amount"
          value={deal.amount != null ? `${deal.currency} ${Number(deal.amount).toLocaleString()}` : null}
        />
        <DetailRow label="Currency" value={deal.currency} />
        <DetailRow
          label="Close Date"
          value={deal.close_date ? new Date(deal.close_date).toLocaleDateString() : null}
        />
        <DetailRow label="Pipeline" value={deal.pipeline?.name ?? null} />
        <DetailRow label="Stage" value={deal.stage?.name ?? null} />
        <DetailRow
          label="Probability"
          value={deal.probability != null ? `${deal.probability}%` : null}
        />
        <DetailRow label="Company" value={deal.company?.name ?? null} />
        <DetailRow
          label="Primary Contact"
          value={
            deal.primary_contact
              ? `${deal.primary_contact.first_name} ${deal.primary_contact.last_name}`.trim()
              : null
          }
        />
        <DetailRow label="Owner" value={deal.owner?.full_name ?? null} />
        <DetailRow label="Won" value={deal.is_won ? 'Yes' : 'No'} />
        <DetailRow label="Lost" value={deal.is_lost ? 'Yes' : 'No'} />
        <DetailRow label="Created" value={new Date(deal.created_at).toLocaleString()} />
        <DetailRow label="Updated" value={new Date(deal.updated_at).toLocaleString()} />
      </dl>

      <ActivityFeed contentType="deal" objectId={deal.id} />

      <div>
        <Link
          href="/deals"
          className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back to deals
        </Link>
      </div>
    </div>
  )
}

export default function DealDetailPage() {
  const params = useParams()
  const id = Number(params.id)

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <DealDetail id={id} />
      </Suspense>
    </main>
  )
}
