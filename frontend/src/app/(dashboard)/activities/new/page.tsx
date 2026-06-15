'use client'

import { useRouter } from 'next/navigation'

import { ActivityForm } from '@/features/activities/components/ActivityForm'
import { useCreateActivity } from '@/features/activities/hooks/useCreateActivity'
import type { CreateActivityFormValues } from '@/features/activities/schemas/activity'

export default function NewActivityPage() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateActivity()

  async function handleSubmit(values: CreateActivityFormValues) {
    const activity = await mutateAsync(values)
    router.push(`/activities/${activity.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Log Activity</h1>
      <ActivityForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel="Log Activity"
        onCancel={() => router.push('/activities')}
      />
    </div>
  )
}
