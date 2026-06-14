'use client'

import { Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { useCompany } from '@/features/companies/hooks/useCompany'
import { useUpdateCompany } from '@/features/companies/hooks/useUpdateCompany'
import { CompanyForm } from '@/features/companies/components/CompanyForm'
import type { CompanyFormValues } from '@/features/companies/schemas/company'

function EditCompanyForm({ id }: { id: number }) {
  const router = useRouter()
  const { data: company, isPending, isError, error } = useCompany(id)
  const { mutateAsync, isPending: isSubmitting } = useUpdateCompany(id)

  if (isPending) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
  }

  if (isError) {
    const status = (error as { status?: number }).status
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <p className="font-medium text-red-700 dark:text-red-400">
          {status === 404 ? 'Company not found.' : 'Failed to load company.'}
        </p>
      </div>
    )
  }

  async function handleSubmit(values: CompanyFormValues) {
    await mutateAsync(values)
    router.push(`/companies/${id}`)
  }

  return (
    <CompanyForm
      defaultValues={{
        name: company.name,
        industry: company.industry ?? '',
        website: company.website ?? '',
        phone: company.phone ?? '',
        billing_address: company.billing_address ?? '',
        shipping_address: company.shipping_address ?? '',
        annual_revenue: company.annual_revenue ?? null,
        employee_count: company.employee_count ?? null,
        owner: company.owner ?? null,
      }}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Save Changes"
      onCancel={() => router.push(`/companies/${id}`)}
    />
  )
}

export default function EditCompanyPage() {
  const params = useParams()
  const id = Number(params.id)

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Edit Company
        </h1>
      </div>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <EditCompanyForm id={id} />
      </Suspense>
    </main>
  )
}
