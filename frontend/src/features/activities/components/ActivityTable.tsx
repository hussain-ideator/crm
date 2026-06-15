'use client'

import Link from 'next/link'

import type { Activity } from '../types'

const TYPE_BADGE: Record<string, string> = {
  task: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  call: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  meeting: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
}

interface Props {
  activities: Activity[]
  onSort?: (field: string) => void
  ordering?: string
}

export function ActivityTable({ activities, onSort, ordering }: Props) {
  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No activities found.</p>
      </div>
    )
  }

  function SortHeader({ label, field }: { label: string; field: string }) {
    const isActive = ordering === field || ordering === `-${field}`
    const isDesc = ordering === `-${field}`
    return (
      <th
        className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        onClick={() => onSort?.(isDesc ? field : `-${field}`)}
      >
        {label} {isActive && (isDesc ? '↓' : '↑')}
      </th>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-800">
          <tr>
            <SortHeader label="Type" field="type" />
            <SortHeader label="Subject" field="subject" />
            <SortHeader label="Due Date" field="due_at" />
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Done
            </th>
            <SortHeader label="Assigned To" field="assigned_to" />
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Linked Record
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
          {activities.map((activity) => (
            <tr key={activity.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    TYPE_BADGE[activity.type] ?? 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3 font-medium">
                <Link href={`/activities/${activity.id}`} className="text-zinc-900 hover:underline dark:text-zinc-100">
                  {activity.subject}
                </Link>
              </td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                {activity.due_at ? new Date(activity.due_at).toLocaleDateString() : '—'}
              </td>
              <td className="px-4 py-3">
                {activity.completed_at ? (
                  <span className="text-green-600 dark:text-green-400">✓</span>
                ) : (
                  <span className="text-zinc-300 dark:text-zinc-600">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                {activity.assigned_to?.full_name ?? '—'}
              </td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                {activity.content_type && activity.object_id != null
                  ? `${activity.content_type.charAt(0).toUpperCase() + activity.content_type.slice(1)} #${activity.object_id}`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
