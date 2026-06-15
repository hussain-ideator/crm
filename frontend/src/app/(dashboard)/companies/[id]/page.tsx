'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { useCompany } from '@/features/companies/hooks/useCompany'
import { DeleteCompanyButton } from '@/features/companies/components/DeleteCompanyButton'
import { ActivityFeed } from '@/features/activities/components/ActivityFeed'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-zinc-100 dark:border-zinc-700 last:border-0">
      <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="col-span-2 text-sm text-zinc-900 dark:text-zinc-100 break-words">
        {value ?? <span className="text-zinc-400">—</span>}
      </dd>
    </div>
  )
}

function CompanyDetail({ id }: { id: number }) {
  const router = useRouter()
  const { data: company, isPending, isError, error } = useCompany(id)

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
        <button
          onClick={() => router.push('/companies')}
          className="mt-3 text-sm text-red-600 underline dark:text-red-400"
        >
          Back to companies
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {company.name}
          </h1>
          {company.industry && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{company.industry}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/companies/${company.id}/edit`}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Edit
          </Link>
          <DeleteCompanyButton id={company.id} name={company.name} />
        </div>
      </div>

      <dl className="rounded-lg border border-zinc-200 bg-white px-6 dark:border-zinc-700 dark:bg-zinc-900">
        <DetailRow label="Name" value={company.name} />
        <DetailRow label="Industry" value={company.industry || null} />
        <DetailRow
          label="Website"
          value={
            company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline dark:text-blue-400"
              >
                {company.website}
              </a>
            ) : null
          }
        />
        <DetailRow label="Phone" value={company.phone || null} />
        <DetailRow label="Billing Address" value={company.billing_address || null} />
        <DetailRow label="Shipping Address" value={company.shipping_address || null} />
        <DetailRow
          label="Annual Revenue"
          value={company.annual_revenue ? `$${Number(company.annual_revenue).toLocaleString()}` : null}
        />
        <DetailRow
          label="Employees"
          value={company.employee_count !== null ? company.employee_count.toLocaleString() : null}
        />
        <DetailRow label="Owner" value={company.owner !== null ? `User #${company.owner}` : null} />
        <DetailRow label="Created By" value={company.created_by !== null ? `User #${company.created_by}` : null} />
        <DetailRow label="Created" value={new Date(company.created_at).toLocaleString()} />
        <DetailRow label="Updated" value={new Date(company.updated_at).toLocaleString()} />
      </dl>

      <ActivityFeed contentType="company" objectId={company.id} />

      <div>
        <Link href="/companies" className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
          ← Back to companies
        </Link>
      </div>
    </div>
  )
}

export default function CompanyDetailPage() {
  const params = useParams()
  const id = Number(params.id)

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <CompanyDetail id={id} />
      </Suspense>
    </main>
  )
}
