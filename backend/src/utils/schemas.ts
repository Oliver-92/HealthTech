import { z } from 'zod'

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('id must be a positive integer'),
})

export type IdParam = z.infer<typeof idParamSchema>

// Strict calendar date (YYYY-MM-DD) for @db.Date columns and date-range filters.
// Rejects malformed strings and impossible dates (e.g. 2024-02-31) that would
// otherwise become an Invalid Date and surface as a 500 from Prisma.
export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((s) => {
    const d = new Date(`${s}T00:00:00.000Z`)
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
  }, 'Invalid calendar date')
