'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useDeleteContact } from '../hooks/useDeleteContact'

interface Props {
  id: number
  contactName: string
}

export function DeleteContactButton({ id, contactName }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = useDeleteContact()

  async function handleConfirm() {
    await mutateAsync(id)
    router.push('/contacts')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        Delete
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Delete contact?
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-zinc-700 dark:text-zinc-200">{contactName}</span>{' '}
              will be removed from all views. This action can be reversed by an administrator.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
              >
                {isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
