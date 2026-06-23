import { z } from 'zod'
import { paginationFields } from '../../utils/pagination.js'

export const createReportSchema = z.object({
  workedMinutes: z.number().int().positive('workedMinutes must be a positive integer'),
  observations: z.string().optional(),
  medication: z.string().optional(),
  vitalSigns: z.string().optional(),
  // false (default) → save as DRAFT; true → submit immediately for admin review
  submit: z.boolean().optional().default(false),
})

// Caregiver edits a DRAFT or re-edits a REJECTED report
export const updateReportSchema = z.object({
  workedMinutes: z.number().int().positive().optional(),
  observations: z.string().optional(),
  medication: z.string().optional(),
  vitalSigns: z.string().optional(),
})

export const rejectReportSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
})

export const listReportsSchema = z.object({
  caregiverId: z.coerce.number().int().positive().optional(),
  patientId: z.coerce.number().int().positive().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']).optional(),
  ...paginationFields,
})

export const shiftIdParamSchema = z.object({
  shiftId: z.coerce.number().int().positive('shiftId must be a positive integer'),
})

export type CreateReportInput = z.infer<typeof createReportSchema>
export type UpdateReportInput = z.infer<typeof updateReportSchema>
export type RejectReportInput = z.infer<typeof rejectReportSchema>
export type ListReportsQuery = z.infer<typeof listReportsSchema>
