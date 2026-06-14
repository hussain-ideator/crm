'use client'

import { useRouter } from 'next/navigation'

import { CompanyForm } from '@/features/companies/components/CompanyForm'
import { useCreateCompany } from '@/features/companies/hooks/useCreateCompany'
import type { CompanyFormValues } from '@/features/companies/schemas/company'

export default function NewCompanyPage() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateCompany()

  async function handleSubmit(values: CompanyFormValues) {
    const company = await mutateAsync(values)
    router.push(`/companies/${company.id}`)
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        New Company
      </h1>
      <CompanyForm
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel="Create Company"
        onCancel={() => router.push('/companies')}
      />
    </main>
  )
}
