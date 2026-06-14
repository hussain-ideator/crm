'use client'

import { useRouter } from 'next/navigation'

import { ContactForm } from '@/features/contacts/components/ContactForm'
import { useCreateContact } from '@/features/contacts/hooks/useCreateContact'
import type { ContactFormValues } from '@/features/contacts/schemas/contact'

export default function NewContactPage() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateContact()

  async function handleSubmit(values: ContactFormValues) {
    const contact = await mutateAsync(values)
    router.push(`/contacts/${contact.id}`)
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        New Contact
      </h1>
      <ContactForm
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel="Create Contact"
        onCancel={() => router.push('/contacts')}
      />
    </main>
  )
}
