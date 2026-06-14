import { z } from 'zod'

const LEAD_STATUS_VALUES = ['new', 'contacted', 'qualified', 'unqualified'] as const

export const leadSchema = z.object({
  salutation: z.string().default(''),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  title: z.string().default(''),
  email: z.string().email('Enter a valid email').or(z.literal('')).default(''),
  phone: z.string().default(''),
  mobile: z.string().default(''),
  company_name: z.string().default(''),
  website: z.string().default(''),
  industry: z.string().default(''),
  no_of_employees: z.number().int().min(0, 'Must be 0 or greater').nullable().optional(),
  source_id: z.number().nullable().optional(),
  status: z.enum(LEAD_STATUS_VALUES).default('new'),
  owner_id: z.number().nullable().optional(),
})

export const createLeadSchema = leadSchema

export const updateLeadSchema = leadSchema.partial().extend({
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
})

export type LeadFormInput = z.input<typeof leadSchema>
export type LeadFormValues = z.output<typeof leadSchema>
