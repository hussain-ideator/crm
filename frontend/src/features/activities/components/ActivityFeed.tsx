'use client'

import Link from 'next/link'

import { useActivityFeed } from '../hooks/useActivityFeed'
import type { ContentTypeLabel } from '../types'
import { CompleteButton } from './CompleteButton'

interface Props {
  contentType: ContentTypeLabel
  objectId: number
}

export function ActivityFeed({ contentType, objectId }: Props) {
  const { data, isLoading } = useActivityFeed(contentType, objectId)

  const TYPE_BADGE: Record<string, string> = {
    task: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    call: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    meeting: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  }

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Activities</h2>
        <Link
          href={`/activities/new?content_type=${contentType}&object_id=${objectId}`}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          Log Activity
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Loading…</p>
        </div>
      ) : !data || data.count === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No activities yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-700 dark:border-zinc-700 dark:bg-zinc-900">
          {data.results.map((activity) => (
            <li key={activity.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    TYPE_BADGE[activity.type] ?? 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                </span>
                <Link
                  href={`/activities/${activity.id}`}
                  className="truncate text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-100"
                >
                  {activity.subject}
                </Link>
                {activity.due_at && (
                  <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                    Due {new Date(activity.due_at).toLocaleDateString()}
                  </span>
                )}
                {activity.completed_at && (
                  <span className="shrink-0 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/40 dark:text-green-300">
                    Completed
                  </span>
                )}
              </div>
              <div className="shrink-0">
                <CompleteButton activity={activity} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
