'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { CompanyFilters } from '@/features/companies/components/CompanyFilters'
import { CompanyTable } from '@/features/companies/components/CompanyTable'
import { useCompanies } from '@/features/companies/hooks/useCompanies'

function CompaniesContent() {
  const searchParams = useSearchParams()

  const q = searchParams.get('q') ?? undefined
  const industry = searchParams.get('industry') ?? undefined
  const ownerRaw = searchParams.get('owner')
  const owner = ownerRaw ? Number(ownerRaw) : undefined
  const ordering = searchParams.get('ordering') ?? undefined
  const pageRaw = searchParams.get('page')
  const page = pageRaw ? Math.max(1, Number(pageRaw)) : 1
  const pageSizeRaw = searchParams.get('page_size')
  const page_size = pageSizeRaw ? Math.min(100, Math.max(1, Number(pageSizeRaw))) : 25

  const { data, isPending, isError } = useCompanies({
    q,
    industry,
    owner,
    ordering,
    page,
    page_size,
  })

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Companies
        </h1>
        <Link
          href="/companies/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New Company
        </Link>
      </div>

      <CompanyFilters />

      {isPending && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
      )}

      {isError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load companies. Please try again.
        </p>
      )}

      {data && (
        <CompanyTable data={data} page={page} pageSize={page_size} />
      )}
    </main>
  )
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-zinc-500">Loading…</p>}>
      <CompaniesContent />
    </Suspense>
  )
}
