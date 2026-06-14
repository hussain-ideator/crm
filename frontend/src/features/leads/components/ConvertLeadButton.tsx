'use client'

import { useConvertLead } from '../hooks/useConvertLead'

interface Props {
  id: number
  onConverted?: (dealId: number) => void
}

export function ConvertLeadButton({ id, onConverted }: Props) {
  const { mutate, isPending, isSuccess } = useConvertLead(id)

  function handleClick() {
    if (!confirm('Convert this lead to a Deal? This action cannot be undone.')) return
    mutate(undefined, {
      onSuccess: (lead) => {
        const dealId = lead.converted_deal_fk?.id
        if (dealId && onConverted) {
          onConverted(dealId)
        }
      },
    })
  }

  if (isSuccess) {
    return (
      <button
        disabled
        className="rounded-md bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 opacity-60 dark:bg-purple-900/40 dark:text-purple-300"
      >
        Converted
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-600"
    >
      {isPending ? 'Converting…' : 'Convert to Deal'}
    </button>
  )
}
