'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { CompleteButton } from '@/features/activities/components/CompleteButton'
import { DeleteActivityButton } from '@/features/activities/components/DeleteActivityButton'
import { useActivity } from '@/features/activities/hooks/useActivity'
import type { ContentTypeLabel } from '@/features/activities/types'

const TYPE_BADGE: Record<string, string> = {
  task: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  call: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  meeting: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
}

const ENTITY_ROUTES: Record<ContentTypeLabel, string> = {
  lead: '/leads',
  contact: '/contacts',
  company: '/companies',
  deal: '/deals',
}

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

function ActivityDetailContent({ id }: { id: number }) {
  const router = useRouter()
  const { data: activity, isPending, isError, error } = useActivity(id)

  const errorStatus = isError ? (error as { status?: number }).status : undefined

  useEffect(() => {
    if (errorStatus === 404) router.push('/activities')
  }, [errorStatus, router])

  if (isPending) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
  if (isError) {
    if (errorStatus === 404) return null
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <p className="font-medium text-red-700 dark:text-red-400">Failed to load activity.</p>
        <button onClick={() => router.push('/activities')} className="mt-3 text-sm text-red-600 underline">
          Back to activities
        </button>
      </div>
    )
  }

  const completionBadge = activity.completed_at ? (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
      Completed {new Date(activity.completed_at).toLocaleString()}
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      Not Completed
    </span>
  )

  const linkedRecord = activity.content_type && activity.object_id != null ? (
    <Link
      href={`${ENTITY_ROUTES[activity.content_type]}/${activity.object_id}`}
      className="text-blue-600 underline dark:text-blue-400"
    >
      {activity.content_type.charAt(0).toUpperCase() + activity.content_type.slice(1)} #{activity.object_id}
    </Link>
  ) : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/activities" className="text-sm text-zinc-500 underline dark:text-zinc-400">
            ← Activities
          </Link>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              TYPE_BADGE[activity.type] ?? 'bg-zinc-100 text-zinc-600'
            }`}
          >
            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CompleteButton activity={activity} />
          <Link
            href={`/activities/${id}/edit`}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Edit
          </Link>
          <DeleteActivityButton activity={activity} />
        </div>
      </div>

      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{activity.subject}</h1>

      <dl className="rounded-lg border border-zinc-200 bg-white px-6 dark:border-zinc-700 dark:bg-zinc-900">
        <DetailRow label="Status" value={completionBadge} />
        <DetailRow
          label="Description"
          value={activity.description || <span className="text-zinc-400">No description</span>}
        />
        <DetailRow
          label="Due Date"
          value={activity.due_at ? new Date(activity.due_at).toLocaleString() : null}
        />
        <DetailRow
          label="Assigned To"
          value={activity.assigned_to?.full_name ?? null}
        />
        <DetailRow label="Linked Record" value={linkedRecord} />
        <DetailRow
          label="Created By"
          value={activity.created_by?.full_name ?? null}
        />
        <DetailRow label="Created At" value={new Date(activity.created_at).toLocaleString()} />
        <DetailRow label="Updated At" value={new Date(activity.updated_at).toLocaleString()} />
      </dl>
    </div>
  )
}

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>()
  return <ActivityDetailContent id={Number(id)} />
}
