'use client'

import { Suspense, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { ContactForm } from '@/features/contacts/components/ContactForm'
import { useContact } from '@/features/contacts/hooks/useContact'
import { useUpdateContact } from '@/features/contacts/hooks/useUpdateContact'
import type { ContactFormValues } from '@/features/contacts/schemas/contact'

function EditContactForm({ id }: { id: number }) {
  const router = useRouter()
  const { data: contact, isPending, isError, error } = useContact(id)
  const { mutateAsync, isPending: isSaving } = useUpdateContact(id)

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

  async function handleSubmit(values: ContactFormValues) {
    await mutateAsync(values)
    router.push(`/contacts/${id}`)
  }

  return (
    <ContactForm
      defaultValues={{
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email ?? '',
        phone: contact.phone ?? '',
        title: contact.title ?? '',
        company_id: contact.company?.id ?? null,
        owner_id: contact.owner?.id ?? null,
      }}
      onSubmit={handleSubmit}
      isSubmitting={isSaving}
      submitLabel="Save Changes"
      onCancel={() => router.push(`/contacts/${id}`)}
    />
  )
}

export default function EditContactPage() {
  const params = useParams()
  const id = Number(params.id)

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Edit Contact
      </h1>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <EditContactForm id={id} />
      </Suspense>
    </main>
  )
}
