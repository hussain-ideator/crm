'use client'

import { useRouter } from 'next/navigation'

import { LeadForm } from '@/features/leads/components/LeadForm'
import { useCreateLead } from '@/features/leads/hooks/useCreateLead'
import type { LeadFormValues } from '@/features/leads/schemas/lead'

export default function NewLeadPage() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateLead()

  async function handleSubmit(values: LeadFormValues) {
    const lead = await mutateAsync(values)
    router.push(`/leads/${lead.id}`)
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        New Lead
      </h1>
      <LeadForm
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel="Create Lead"
        onCancel={() => router.push('/leads')}
      />
    </main>
  )
}
