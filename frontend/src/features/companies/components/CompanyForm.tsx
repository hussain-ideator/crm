'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { companySchema, type CompanyFormInput, type CompanyFormValues } from '../schemas/company'

interface Props {
  defaultValues?: Partial<CompanyFormInput>
  onSubmit: (values: CompanyFormValues) => void | Promise<void>
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

export function CompanyForm({
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
  } = useForm<CompanyFormInput, unknown, CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      industry: '',
      website: '',
      phone: '',
      billing_address: '',
      shipping_address: '',
      annual_revenue: null,
      employee_count: null,
      owner: null,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <Field label="Company Name *" error={errors.name?.message}>
        <input
          {...register('name')}
          type="text"
          className={inputCls}
          placeholder="Acme Corp"
          disabled={isSubmitting}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Industry" error={errors.industry?.message}>
          <input
            {...register('industry')}
            type="text"
            className={inputCls}
            placeholder="Technology"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Website" error={errors.website?.message}>
          <input
            {...register('website')}
            type="url"
            className={inputCls}
            placeholder="https://example.com"
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

        <Field label="Annual Revenue" error={errors.annual_revenue?.message}>
          <input
            {...register('annual_revenue')}
            type="text"
            className={inputCls}
            placeholder="1200000.00"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Employee Count" error={errors.employee_count?.message}>
          <input
            {...register('employee_count', { setValueAs: (v) => (v === '' || v === null ? null : Number(v)) })}
            type="number"
            min={0}
            step={1}
            className={inputCls}
            placeholder="250"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Owner (User ID)" error={errors.owner?.message}>
          <input
            {...register('owner', { setValueAs: (v) => (v === '' || v === null ? null : Number(v)) })}
            type="number"
            min={1}
            className={inputCls}
            placeholder="7"
            disabled={isSubmitting}
          />
        </Field>
      </div>

      <Field label="Billing Address" error={errors.billing_address?.message}>
        <textarea
          {...register('billing_address')}
          rows={3}
          className={inputCls}
          placeholder="123 Main St, Springfield"
          disabled={isSubmitting}
        />
      </Field>

      <Field label="Shipping Address" error={errors.shipping_address?.message}>
        <textarea
          {...register('shipping_address')}
          rows={3}
          className={inputCls}
          placeholder="123 Main St, Springfield"
          disabled={isSubmitting}
        />
      </Field>

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
