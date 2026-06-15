'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { LeadForm } from '@/features/leads/components/LeadForm'
import { useCreateLead } from '@/features/leads/hooks/useCreateLead'
import type { LeadFormValues } from '@/features/leads/schemas/lead'

export default function NewLeadPage() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateLead()
  const [apiError, setApiError] = useState<string | null>(null)

  async function handleSubmit(values: LeadFormValues) {
    setApiError(null)
    try {
      const lead = await mutateAsync(values)
      router.push(`/leads/${lead.id}`)
    } catch (err) {
      const body = (err as { body?: Record<string, string[]> }).body
      if (body && typeof body === 'object') {
        const messages = Object.entries(body)
          .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
          .join('\n')
        setApiError(messages)
      } else {
        setApiError('Failed to create lead. Please try again.')
      }
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        New Lead
      </h1>
      {apiError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Could not create lead:
          </p>
          <pre className="mt-1 whitespace-pre-wrap text-sm text-red-600 dark:text-red-300">
            {apiError}
          </pre>
        </div>
      )}
      <LeadForm
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel="Create Lead"
        onCancel={() => router.push('/leads')}
      />
    </main>
  )
}
