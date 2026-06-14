'use client'

import { Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { DealForm } from '@/features/deals/components/DealForm'
import { useDeal } from '@/features/deals/hooks/useDeal'
import { useUpdateDeal } from '@/features/deals/hooks/useUpdateDeal'
import type { DealFormValues } from '@/features/deals/schemas/deal'

function DealEditContent({ id }: { id: number }) {
  const router = useRouter()
  const { data: deal, isPending, isError } = useDeal(id)
  const { mutateAsync, isPending: isSubmitting } = useUpdateDeal(id)

  async function handleSubmit(values: DealFormValues) {
    await mutateAsync(values)
    router.push(`/deals/${id}`)
  }

  if (isPending) {
    return <p className="text-sm text-zinc-500">Loading…</p>
  }

  if (isError || !deal) {
    return <p className="text-sm text-red-600">Deal not found.</p>
  }

  return (
    <DealForm
      mode="edit"
      defaultValues={{
        name: deal.name,
        amount: deal.amount != null ? Number(deal.amount) : null,
        currency: deal.currency,
        close_date: deal.close_date ?? null,
        pipeline_id: deal.pipeline?.id ?? null,
        stage_id: deal.stage?.id ?? null,
        company_id: deal.company?.id ?? null,
        primary_contact_id: deal.primary_contact?.id ?? null,
        owner_id: deal.owner?.id ?? null,
        probability: deal.probability ?? null,
      }}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Save Changes"
      onCancel={() => router.push(`/deals/${id}`)}
    />
  )
}

export default function DealEditPage() {
  const params = useParams()
  const id = Number(params.id)

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Edit Deal
      </h1>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <DealEditContent id={id} />
      </Suspense>
    </main>
  )
}
