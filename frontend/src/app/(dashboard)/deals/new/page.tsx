'use client'

import { useRouter } from 'next/navigation'

import { DealForm } from '@/features/deals/components/DealForm'
import { useCreateDeal } from '@/features/deals/hooks/useCreateDeal'
import type { DealFormValues } from '@/features/deals/schemas/deal'

export default function NewDealPage() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateDeal()

  async function handleSubmit(values: DealFormValues) {
    const deal = await mutateAsync(values)
    router.push(`/deals/${deal.id}`)
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        New Deal
      </h1>
      <DealForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel="Create Deal"
        onCancel={() => router.push('/deals')}
      />
    </main>
  )
}
