'use client'

import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { DeleteContactButton } from '@/features/contacts/components/DeleteContactButton'
import { useContact } from '@/features/contacts/hooks/useContact'
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

function ContactDetail({ id }: { id: number }) {
  const router = useRouter()
  const { data: contact, isPending, isError, error } = useContact(id)

  const errorStatus = isError ? (error as { status?: number }).status : undefined

  useEffect(() => {
    if (errorStatus === 404) {
      router.push('/contacts')
    }
  }, [errorStatus, router])

  if (isPending) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
  }

  if (isError) {
    if (errorStatus === 404) return null
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <p className="font-medium text-red-700 dark:text-red-400">
          Failed to load contact.
        </p>
        <button
          onClick={() => router.push('/contacts')}
          className="mt-3 text-sm text-red-600 underline dark:text-red-400"
        >
          Back to contacts
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {contact.first_name} {contact.last_name}
          </h1>
          {contact.title && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{contact.title}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/contacts/${contact.id}/edit`}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Edit
          </Link>
          <DeleteContactButton
            id={contact.id}
            contactName={`${contact.first_name} ${contact.last_name}`.trim()}
          />
        </div>
      </div>

      <dl className="rounded-lg border border-zinc-200 bg-white px-6 dark:border-zinc-700 dark:bg-zinc-900">
        <DetailRow label="First Name" value={contact.first_name} />
        <DetailRow label="Last Name" value={contact.last_name} />
        <DetailRow label="Email" value={contact.email || null} />
        <DetailRow label="Phone" value={contact.phone || null} />
        <DetailRow label="Title" value={contact.title || null} />
        <DetailRow
          label="Company"
          value={
            contact.company ? (
              <Link
                href={`/companies/${contact.company.id}`}
                className="text-blue-600 underline dark:text-blue-400"
              >
                {contact.company.name}
              </Link>
            ) : null
          }
        />
        <DetailRow
          label="Owner"
          value={contact.owner ? contact.owner.full_name : null}
        />
        <DetailRow label="Created" value={new Date(contact.created_at).toLocaleString()} />
        <DetailRow label="Updated" value={new Date(contact.updated_at).toLocaleString()} />
      </dl>

      <ActivityFeed contentType="contact" objectId={contact.id} />

      <div>
        <Link
          href="/contacts"
          className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back to contacts
        </Link>
      </div>
    </div>
  )
}

export default function ContactDetailPage() {
  const params = useParams()
  const id = Number(params.id)

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <ContactDetail id={id} />
      </Suspense>
    </main>
  )
}
