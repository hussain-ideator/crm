'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { leadSchema, type LeadFormInput, type LeadFormValues } from '../schemas/lead'
import { useLeadSources } from '../hooks/useLeads'

const SALUTATION_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Ms.', label: 'Ms.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Dr.', label: 'Dr.' },
  { value: 'Mx.', label: 'Mx.' },
]

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
]

interface Props {
  defaultValues?: Partial<LeadFormInput>
  onSubmit: (values: LeadFormValues) => void | Promise<void>
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

export function LeadForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  onCancel,
}: Props) {
  const { data: sources } = useLeadSources()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormInput, unknown, LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      salutation: '',
      first_name: '',
      last_name: '',
      title: '',
      email: '',
      phone: '',
      mobile: '',
      company_name: '',
      website: '',
      industry: '',
      no_of_employees: null,
      source_id: null,
      status: 'new',
      owner_id: null,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Salutation" error={errors.salutation?.message}>
          <select {...register('salutation')} className={inputCls} disabled={isSubmitting}>
            {SALUTATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

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

        <Field label="Title" error={errors.title?.message}>
          <input
            {...register('title')}
            type="text"
            className={inputCls}
            placeholder="VP of Sales"
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

        <Field label="Mobile" error={errors.mobile?.message}>
          <input
            {...register('mobile')}
            type="text"
            className={inputCls}
            placeholder="+1-555-0101"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Company Name" error={errors.company_name?.message}>
          <input
            {...register('company_name')}
            type="text"
            className={inputCls}
            placeholder="Acme Corp"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Website" error={errors.website?.message}>
          <input
            {...register('website')}
            type="text"
            className={inputCls}
            placeholder="https://acme.com"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Industry" error={errors.industry?.message}>
          <input
            {...register('industry')}
            type="text"
            className={inputCls}
            placeholder="Technology"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="No. of Employees" error={errors.no_of_employees?.message}>
          <input
            {...register('no_of_employees', {
              setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
            })}
            type="number"
            min={0}
            className={inputCls}
            placeholder="100"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Source" error={errors.source_id?.message}>
          <select
            {...register('source_id', {
              setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
            })}
            className={inputCls}
            disabled={isSubmitting}
          >
            <option value="">— None —</option>
            {sources?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status" error={errors.status?.message}>
          <select {...register('status')} className={inputCls} disabled={isSubmitting}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Owner (User ID)" error={errors.owner_id?.message}>
          <input
            {...register('owner_id', {
              setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
            })}
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
