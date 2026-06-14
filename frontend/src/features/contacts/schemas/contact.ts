import { z } from 'zod'

export const contactSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email').or(z.literal('')).default(''),
  phone: z.string().default(''),
  title: z.string().default(''),
  company_id: z.number().nullable().optional(),
  owner_id: z.number().nullable().optional(),
})

export type ContactFormInput = z.input<typeof contactSchema>
export type ContactFormValues = z.output<typeof contactSchema>
