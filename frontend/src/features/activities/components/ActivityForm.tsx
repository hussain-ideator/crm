'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createActivitySchema, type CreateActivityFormValues, type CreateActivityInput } from '../schemas/activity'
import type { Activity } from '../types'

const TYPE_OPTIONS = [
  { value: 'task', label: 'Task' },
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
]

const CONTENT_TYPE_OPTIONS = [
  { value: '', label: '— None —' },
  { value: 'lead', label: 'Lead' },
  { value: 'contact', label: 'Contact' },
  { value: 'company', label: 'Company' },
  { value: 'deal', label: 'Deal' },
]

interface Props {
  mode: 'create' | 'edit'
  defaultValues?: Partial<CreateActivityInput>
  onSubmit: (values: CreateActivityFormValues) => void | Promise<void>
  isSubmitting?: boolean
  submitLabel?: string
  onCancel?: () => void
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

const inputCls =
  'rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 disabled:opacity-50'

export function ActivityForm({ mode, defaultValues, onSubmit, isSubmitting = false, submitLabel = 'Save', onCancel }: Props) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateActivityInput, unknown, CreateActivityFormValues>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      type: 'task',
      subject: '',
      description: '',
      due_at: null,
      completed_at: null,
      assigned_to_id: null,
      content_type: null,
      object_id: null,
      ...defaultValues,
    },
  })

  const contentType = useWatch({ control, name: 'content_type' })

  // Clear object_id when content_type is cleared
  useEffect(() => {
    if (!contentType) {
      setValue('object_id', null)
    }
  }, [contentType, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field label="Type *" error={errors.type?.message}>
        <select {...register('type')} className={inputCls}>
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Subject *" error={errors.subject?.message}>
        <input type="text" {...register('subject')} className={inputCls} placeholder="Activity subject" />
      </Field>

      <Field label="Description" error={errors.description?.message}>
        <textarea {...register('description')} className={inputCls} rows={3} placeholder="Optional notes" />
      </Field>

      <Field label="Due Date" error={errors.due_at?.message}>
        <input type="datetime-local" {...register('due_at')} className={inputCls} />
      </Field>

      {mode === 'edit' && (
        <Field label="Completed At" error={errors.completed_at?.message}>
          <input type="datetime-local" {...register('completed_at')} className={inputCls} />
        </Field>
      )}

      <Field label="Linked Record Type" error={errors.content_type?.message}>
        <select
          {...register('content_type', {
            setValueAs: (v) => v === '' ? null : v,
          })}
          className={inputCls}
        >
          {CONTENT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>

      {contentType && (
        <Field label="Linked Record ID *" error={errors.object_id?.message}>
          <input
            type="number"
            min={1}
            {...register('object_id', { valueAsNumber: true, setValueAs: (v) => v === '' || isNaN(Number(v)) ? null : Number(v) })}
            className={inputCls}
            placeholder="e.g. 42"
          />
        </Field>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-zinc-600 underline dark:text-zinc-400">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
