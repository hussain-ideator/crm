import { z } from 'zod'

export const dealSchema = z.object({
  name: z.string().min(1, 'Name is required').max(500),
  amount: z
    .preprocess(
      (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
      z.number().min(0, 'Amount must be 0 or greater').nullable().optional(),
    ),
  currency: z.string().max(3).default('USD'),
  close_date: z.string().nullable().optional(),
  pipeline_id: z.number().nullable().optional(),
  stage_id: z.number().nullable().optional(),
  company_id: z.number().nullable().optional(),
  primary_contact_id: z.number().nullable().optional(),
  owner_id: z.number().nullable().optional(),
  probability: z
    .preprocess(
      (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
      z
        .number()
        .int()
        .min(0, 'Probability must be 0–100')
        .max(100, 'Probability must be 0–100')
        .nullable()
        .optional(),
    ),
})

export const createDealSchema = dealSchema
export const updateDealSchema = dealSchema.partial().extend({
  name: z.string().min(1, 'Name is required').max(500).optional(),
})

export type DealFormInput = z.input<typeof dealSchema>
export type DealFormValues = z.output<typeof dealSchema>
