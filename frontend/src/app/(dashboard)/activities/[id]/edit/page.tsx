'use client'

import { useParams, useRouter } from 'next/navigation'

import { ActivityForm } from '@/features/activities/components/ActivityForm'
import { useActivity } from '@/features/activities/hooks/useActivity'
import { useUpdateActivity } from '@/features/activities/hooks/useUpdateActivity'
import type { CreateActivityFormValues } from '@/features/activities/schemas/activity'

function EditActivityContent({ id }: { id: number }) {
  const router = useRouter()
  const { data: activity, isPending } = useActivity(id)
  const { mutateAsync, isPending: isSubmitting } = useUpdateActivity()

  if (isPending) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
  }

  if (!activity) return null

  async function handleSubmit(values: CreateActivityFormValues) {
    await mutateAsync({ id, input: values })
    router.push(`/activities/${id}`)
  }

  return (
    <ActivityForm
      mode="edit"
      defaultValues={{
        type: activity.type,
        subject: activity.subject,
        description: activity.description,
        due_at: activity.due_at,
        completed_at: activity.completed_at,
        assigned_to_id: activity.assigned_to?.id ?? null,
        content_type: activity.content_type,
        object_id: activity.object_id,
      }}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Save Changes"
      onCancel={() => router.push(`/activities/${id}`)}
    />
  )
}

export default function EditActivityPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit Activity</h1>
      <EditActivityContent id={Number(id)} />
    </div>
  )
}
