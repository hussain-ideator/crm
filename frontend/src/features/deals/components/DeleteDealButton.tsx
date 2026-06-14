'use client'

import { useDeleteDeal } from '../hooks/useDeleteDeal'

interface Props {
  id: number
  dealName: string
  onDeleted?: () => void
}

export function DeleteDealButton({ id, dealName, onDeleted }: Props) {
  const { mutate, isPending } = useDeleteDeal(id)

  function handleClick() {
    if (!confirm(`Delete deal "${dealName}"? This cannot be undone.`)) return
    mutate(undefined, {
      onSuccess: () => {
        onDeleted?.()
      },
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
    >
      {isPending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
