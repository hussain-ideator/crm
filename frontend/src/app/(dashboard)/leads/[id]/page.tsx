'use client'

import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ConvertLeadButton } from '@/features/leads/components/ConvertLeadButton'
import { DeleteLeadButton } from '@/features/leads/components/DeleteLeadButton'
import { useLead } from '@/features/leads/hooks/useLead'
import { ActivityFeed } from '@/features/activities/components/ActivityFeed'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 border-b border-zinc-100 py-3 last:border-0 dark:border-zinc-700">
      <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="col-span-2 break-words text-sm text-zinc-900 dark:text-zinc-100">
        {value ?? <span className="text-zinc-400">—</span>}
      </dd>
    </div>
  )
}

const STATUS_BADGE: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  qualified: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  unqualified: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
}

function LeadDetail({ id }: { id: number }) {
  const router = useRouter()
  const { data: lead, isPending, isError, error } = useLead(id)

  const errorStatus = isError ? (error as { status?: number }).status : undefined

  useEffect(() => {
    if (errorStatus === 404) {
      router.push('/leads')
    }
  }, [errorStatus, router])

  if (isPending) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
  }

  if (isError) {
    if (errorStatus === 404) return null
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <p className="font-medium text-red-700 dark:text-red-400">Failed to load lead.</p>
        <button
          onClick={() => router.push('/leads')}
          className="mt-3 text-sm text-red-600 underline dark:text-red-400"
        >
          Back to leads
        </button>
      </div>
    )
  }

  const isConverted = lead.status === 'converted'
  const fullName = `${lead.salutation ? lead.salutation + ' ' : ''}${lead.first_name} ${lead.last_name}`.trim()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {fullName}
          </h1>
          {lead.title && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{lead.title}</p>
          )}
          <span
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[lead.status] ?? ''}`}
          >
            {lead.status}
          </span>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {!isConverted && (
            <>
              <Link
                href={`/leads/${lead.id}/edit`}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Edit
              </Link>
              <ConvertLeadButton
                id={lead.id}
                onConverted={(dealId) => router.push(`/deals/${dealId}`)}
              />
              <DeleteLeadButton
                id={lead.id}
                leadName={fullName}
                onDeleted={() => router.push('/leads')}
              />
            </>
          )}
          {isConverted && lead.converted_deal_fk && (
            <Link
              href={`/deals/${lead.converted_deal_fk.id}`}
              className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 dark:bg-purple-500"
            >
              View Deal →
            </Link>
          )}
        </div>
      </div>

      {isConverted && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 px-5 py-4 text-sm text-purple-800 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
          This lead has been converted and is read-only.
          {lead.converted_deal_fk && (
            <>
              {' '}
              <Link
                href={`/deals/${lead.converted_deal_fk.id}`}
                className="underline"
              >
                View associated deal: {lead.converted_deal_fk.name}
              </Link>
            </>
          )}
        </div>
      )}

      <dl className="rounded-lg border border-zinc-200 bg-white px-6 dark:border-zinc-700 dark:bg-zinc-900">
        <DetailRow label="Salutation" value={lead.salutation || null} />
        <DetailRow label="First Name" value={lead.first_name} />
        <DetailRow label="Last Name" value={lead.last_name} />
        <DetailRow label="Title" value={lead.title || null} />
        <DetailRow label="Email" value={lead.email || null} />
        <DetailRow label="Phone" value={lead.phone || null} />
        <DetailRow label="Mobile" value={lead.mobile || null} />
        <DetailRow label="Company Name" value={lead.company_name || null} />
        <DetailRow label="Website" value={lead.website || null} />
        <DetailRow label="Industry" value={lead.industry || null} />
        <DetailRow label="No. of Employees" value={lead.no_of_employees} />
        <DetailRow label="Source" value={lead.source?.name ?? null} />
        <DetailRow label="Owner" value={lead.owner?.full_name ?? null} />
        <DetailRow label="Converted At" value={lead.converted_at ? new Date(lead.converted_at).toLocaleString() : null} />
        <DetailRow label="Created" value={new Date(lead.created_at).toLocaleString()} />
        <DetailRow label="Updated" value={new Date(lead.updated_at).toLocaleString()} />
      </dl>

      <ActivityFeed contentType="lead" objectId={lead.id} />

      <div>
        <Link
          href="/leads"
          className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back to leads
        </Link>
      </div>
    </div>
  )
}

export default function LeadDetailPage() {
  const params = useParams()
  const id = Number(params.id)

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <LeadDetail id={id} />
      </Suspense>
    </main>
  )
}
