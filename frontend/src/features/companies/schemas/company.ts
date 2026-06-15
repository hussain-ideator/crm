import { z } from 'zod'

export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().default(''),
  website: z
    .union([
      z
        .string()
        .url('Enter a valid URL')
        .refine(
          (url) => {
            try {
              const { hostname } = new URL(url)
              return hostname === 'localhost' || hostname.includes('.')
            } catch {
              return false
            }
          },
          'Enter a valid URL with a domain (e.g., https://company.com)',
        ),
      z.literal(''),
    ])
    .default(''),
  phone: z.string().default(''),
  billing_address: z.string().default(''),
  shipping_address: z.string().default(''),
  annual_revenue: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a non-negative number (e.g. 1200000.00)')
    .nullable()
    .optional(),
  employee_count: z
    .number()
    .int('Must be a whole number')
    .nonnegative('Must be 0 or greater')
    .nullable()
    .optional(),
  owner: z.number().nullable().optional(),
})

// Input type — what the form fields hold (defaults make string fields optional in input)
export type CompanyFormInput = z.input<typeof companySchema>
// Output type — what the submit handler receives after Zod transforms/defaults
export type CompanyFormValues = z.output<typeof companySchema>
