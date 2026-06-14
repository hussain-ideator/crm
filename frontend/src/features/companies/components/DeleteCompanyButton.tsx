'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useDeleteCompany } from '../hooks/useDeleteCompany'

interface Props {
  id: number
  name: string
}

export function DeleteCompanyButton({ id, name }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const { mutate, isPending } = useDeleteCompany()

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        Delete
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-4 py-2 dark:border-red-700 dark:bg-red-900/20">
      <span className="text-sm text-red-700 dark:text-red-400">
        Delete &ldquo;{name}&rdquo;?
      </span>
      <button
        onClick={() =>
          mutate(id, {
            onSuccess: () => router.push('/companies'),
          })
        }
        disabled={isPending}
        className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {isPending ? 'Deleting…' : 'Confirm'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        disabled={isPending}
        className="rounded border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 dark:border-red-700 dark:text-red-400"
      >
        Cancel
      </button>
    </div>
  )
}
