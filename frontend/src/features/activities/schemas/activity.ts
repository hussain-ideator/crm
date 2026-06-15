import { z } from 'zod'

export const activityTypeSchema = z.enum(['task', 'call', 'meeting'])
export const contentTypeLabelSchema = z.enum(['lead', 'contact', 'company', 'deal'])

export const createActivitySchema = z
  .object({
    type: activityTypeSchema,
    subject: z.string().min(1, 'Subject is required').max(500),
    description: z.string().default(''),
    due_at: z.string().datetime().nullable().optional(),
    completed_at: z.string().datetime().nullable().optional(),
    assigned_to_id: z.number().int().positive().nullable().optional(),
    content_type: contentTypeLabelSchema.nullable().optional(),
    object_id: z.number().int().positive().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const hasContentType = data.content_type != null
    const hasObjectId = data.object_id != null
    if (hasContentType !== hasObjectId) {
      const msg = 'content_type and object_id must both be provided or both be null'
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg, path: ['content_type'] })
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg, path: ['object_id'] })
    }
  })

export type CreateActivityFormValues = z.output<typeof createActivitySchema>
export type CreateActivityInput = z.input<typeof createActivitySchema>
