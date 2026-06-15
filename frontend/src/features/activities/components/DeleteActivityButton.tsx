'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useDeleteActivity } from '../hooks/useDeleteActivity'
import type { Activity } from '../types'

interface Props {
  activity: Activity
}

export function DeleteActivityButton({ activity }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const { mutate: deleteAct, isPending } = useDeleteActivity()

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        Delete
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">Are you sure?</span>
      <button
        onClick={() =>
          deleteAct(activity, {
            onSuccess: () => router.push('/activities'),
          })
        }
        disabled={isPending}
        className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {isPending ? 'Deleting…' : 'Yes, delete'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="text-sm text-zinc-500 underline dark:text-zinc-400"
      >
        Cancel
      </button>
    </div>
  )
}
