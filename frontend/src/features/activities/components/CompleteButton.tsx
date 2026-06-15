'use client'

import { useCompleteActivity, useIncompleteActivity } from '../hooks/useCompleteActivity'
import type { Activity } from '../types'

interface Props {
  activity: Activity
}

export function CompleteButton({ activity }: Props) {
  const { mutate: complete, isPending: completing } = useCompleteActivity()
  const { mutate: incomplete, isPending: incompleting } = useIncompleteActivity()
  const isPending = completing || incompleting

  if (activity.completed_at === null) {
    return (
      <button
        onClick={() => complete(activity.id)}
        disabled={isPending}
        className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {isPending ? '…' : 'Mark as Complete'}
      </button>
    )
  }

  return (
    <button
      onClick={() => incomplete(activity.id)}
      disabled={isPending}
      className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
    >
      {isPending ? '…' : 'Unmark'}
    </button>
  )
}
