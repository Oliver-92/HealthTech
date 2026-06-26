import { z } from 'zod'

export const reportSchema = z.object({
  workedMinutes: z.coerce.number().int().positive('Debe ser mayor a 0'),
  observations:  z.string().optional(),
  medication:    z.string().optional(),
  vitalSigns:    z.string().optional(),
})

export const rejectSchema = z.object({
  reason: z.string().min(1, 'El motivo es obligatorio'),
})

export type ReportForm  = z.infer<typeof reportSchema>
export type RejectForm  = z.infer<typeof rejectSchema>
