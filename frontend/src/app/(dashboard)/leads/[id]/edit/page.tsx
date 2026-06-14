'use client'

import { Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { LeadForm } from '@/features/leads/components/LeadForm'
import { useLead } from '@/features/leads/hooks/useLead'
import { useUpdateLead } from '@/features/leads/hooks/useUpdateLead'
import type { LeadFormValues } from '@/features/leads/schemas/lead'

function LeadEditContent({ id }: { id: number }) {
  const router = useRouter()
  const { data: lead, isPending, isError } = useLead(id)
  const { mutateAsync, isPending: isSaving } = useUpdateLead(id)

  if (isPending) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
  }

  if (isError || !lead) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Failed to load lead.{' '}
        <button onClick={() => router.push('/leads')} className="underline">
          Back to leads
        </button>
      </p>
    )
  }

  if (lead.status === 'converted') {
    return (
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-6 text-sm text-purple-800 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
        This lead has been converted and is read-only.{' '}
        <button onClick={() => router.push(`/leads/${id}`)} className="underline">
          View detail
        </button>
      </div>
    )
  }

  async function handleSubmit(values: LeadFormValues) {
    await mutateAsync(values)
    router.push(`/leads/${id}`)
  }

  const defaultValues = {
    salutation: lead.salutation,
    first_name: lead.first_name,
    last_name: lead.last_name,
    title: lead.title,
    email: lead.email,
    phone: lead.phone,
    mobile: lead.mobile,
    company_name: lead.company_name,
    website: lead.website,
    industry: lead.industry,
    no_of_employees: lead.no_of_employees,
    source_id: lead.source_id,
    status: lead.status as 'new' | 'contacted' | 'qualified' | 'unqualified',
    owner_id: lead.owner_id,
  }

  return (
    <LeadForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={isSaving}
      submitLabel="Save Changes"
      onCancel={() => router.push(`/leads/${id}`)}
    />
  )
}

export default function LeadEditPage() {
  const params = useParams()
  const id = Number(params.id)

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Edit Lead
      </h1>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <LeadEditContent id={id} />
      </Suspense>
    </main>
  )
}
