'use client'

import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { dealSchema, type DealFormInput, type DealFormValues } from '../schemas/deal'
import { usePipelines } from '../hooks/usePipelines'

interface Props {
  defaultValues?: Partial<DealFormInput>
  onSubmit: (values: DealFormValues) => void | Promise<void>
  isSubmitting?: boolean
  submitLabel?: string
  onCancel?: () => void
  mode?: 'create' | 'edit'
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

export function DealForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  onCancel,
  mode = 'create',
}: Props) {
  const { data: pipelines } = usePipelines()
  // true when the user has manually typed a probability — suppresses auto-set from stage
  const userOverrodeProbability = useRef(mode === 'edit')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DealFormInput, unknown, DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      name: '',
      amount: null,
      currency: 'USD',
      close_date: null,
      pipeline_id: null,
      stage_id: null,
      company_id: null,
      primary_contact_id: null,
      owner_id: null,
      probability: null,
      ...defaultValues,
    },
  })

  const selectedPipelineId = watch('pipeline_id')
  const selectedPipeline = pipelines?.find((p) => p.id === Number(selectedPipelineId))
  const stageOptions = selectedPipeline?.stages ?? []

  function handleStageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const stageId = e.target.value ? Number(e.target.value) : null
    setValue('stage_id', stageId)
    if (!userOverrodeProbability.current && stageId) {
      const stage = stageOptions.find((s) => s.id === stageId)
      if (stage) {
        setValue('probability', stage.probability)
      }
    }
  }

  function handleProbabilityChange(e: React.ChangeEvent<HTMLInputElement>) {
    userOverrodeProbability.current = true
    // let react-hook-form handle the value via register
    register('probability').onChange(e)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Deal Name *" error={errors.name?.message}>
          <input
            {...register('name')}
            type="text"
            className={inputCls}
            placeholder="Acme Corp Renewal"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Amount" error={errors.amount?.message}>
          <input
            {...register('amount')}
            type="number"
            min={0}
            step="0.01"
            className={inputCls}
            placeholder="10000"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Currency" error={errors.currency?.message}>
          <input
            {...register('currency')}
            type="text"
            maxLength={3}
            className={inputCls}
            placeholder="USD"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Close Date" error={errors.close_date?.message}>
          <input
            {...register('close_date')}
            type="date"
            className={inputCls}
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Pipeline" error={errors.pipeline_id?.message}>
          <select
            {...register('pipeline_id', {
              setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
            })}
            className={inputCls}
            disabled={isSubmitting}
          >
            <option value="">— None —</option>
            {pipelines?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Stage" error={errors.stage_id?.message}>
          <select
            {...register('stage_id', {
              setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
            })}
            onChange={handleStageChange}
            className={inputCls}
            disabled={isSubmitting || stageOptions.length === 0}
          >
            <option value="">— None —</option>
            {stageOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.probability}%)
              </option>
            ))}
          </select>
        </Field>

        <Field label="Probability (%)" error={errors.probability?.message}>
          <input
            {...register('probability')}
            type="number"
            min={0}
            max={100}
            className={inputCls}
            placeholder="Auto-set from stage"
            disabled={isSubmitting}
            onChange={handleProbabilityChange}
          />
        </Field>

        <Field label="Company (ID)" error={errors.company_id?.message}>
          <input
            {...register('company_id', {
              setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
            })}
            type="number"
            min={1}
            className={inputCls}
            placeholder="Company ID"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Primary Contact (ID)" error={errors.primary_contact_id?.message}>
          <input
            {...register('primary_contact_id', {
              setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
            })}
            type="number"
            min={1}
            className={inputCls}
            placeholder="Contact ID"
            disabled={isSubmitting}
          />
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
