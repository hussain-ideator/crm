'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { contactSchema, type ContactFormInput, type ContactFormValues } from '../schemas/contact'

interface Props {
  defaultValues?: Partial<ContactFormInput>
  onSubmit: (values: ContactFormValues) => void | Promise<void>
  isSubmitting?: boolean
  submitLabel?: string
  onCancel?: () => void
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
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

export function ContactForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormInput, unknown, ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      title: '',
      company_id: null,
      owner_id: null,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="First Name *" error={errors.first_name?.message}>
          <input
            {...register('first_name')}
            type="text"
            className={inputCls}
            placeholder="Jane"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Last Name *" error={errors.last_name?.message}>
          <input
            {...register('last_name')}
            type="text"
            className={inputCls}
            placeholder="Doe"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            className={inputCls}
            placeholder="jane@example.com"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Phone" error={errors.phone?.message}>
          <input
            {...register('phone')}
            type="text"
            className={inputCls}
            placeholder="+1-555-0100"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Title" error={errors.title?.message}>
          <input
            {...register('title')}
            type="text"
            className={inputCls}
            placeholder="VP of Sales"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Company (ID)" error={errors.company_id?.message}>
          <input
            {...register('company_id', { setValueAs: (v) => (v === '' || v === null ? null : Number(v)) })}
            type="number"
            min={1}
            className={inputCls}
            placeholder="Company ID"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Owner (User ID)" error={errors.owner_id?.message}>
          <input
            {...register('owner_id', { setValueAs: (v) => (v === '' || v === null ? null : Number(v)) })}
            type="number"
            min={1}
            className={inputCls}
            placeholder="User ID"
            disabled={isSubmitting}
          />
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
