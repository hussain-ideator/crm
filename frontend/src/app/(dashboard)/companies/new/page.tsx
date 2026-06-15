'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { CompanyForm } from '@/features/companies/components/CompanyForm'
import { useCreateCompany } from '@/features/companies/hooks/useCreateCompany'
import type { CompanyFormValues } from '@/features/companies/schemas/company'

export default function NewCompanyPage() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateCompany()
  const [apiError, setApiError] = useState<string | null>(null)

  async function handleSubmit(values: CompanyFormValues) {
    setApiError(null)
    try {
      const company = await mutateAsync(values)
      router.push(`/companies/${company.id}`)
    } catch (err) {
      const body = (err as { body?: Record<string, string[]> }).body
      if (body && typeof body === 'object') {
        const messages = Object.entries(body)
          .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
          .join('\n')
        setApiError(messages)
      } else {
        setApiError('Failed to create company. Please try again.')
      }
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        New Company
      </h1>
      {apiError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Could not create company:
          </p>
          <pre className="mt-1 whitespace-pre-wrap text-sm text-red-600 dark:text-red-300">
            {apiError}
          </pre>
        </div>
      )}
      <CompanyForm
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel="Create Company"
        onCancel={() => router.push('/companies')}
      />
    </main>
  )
}
