import { z } from 'zod'

const TIME_RE = /^\d{2}:\d{2}$/

export const createShiftSchema = z
  .object({
    patientId: z.number().int().positive('patientId must be a positive integer'),
    caregiverId: z.number().int().positive('caregiverId must be a positive integer'),
    date: z.string().min(1, 'date is required'),
    startTime: z.string().regex(TIME_RE, 'startTime must be HH:MM'),
    endTime: z.string().regex(TIME_RE, 'endTime must be HH:MM'),
  })
  .refine((d) => d.startTime < d.endTime, {
    message: 'startTime must be before endTime',
    path: ['endTime'],
  })

export const updateShiftSchema = z
  .object({
    patientId: z.number().int().positive().optional(),
    caregiverId: z.number().int().positive().optional(),
    date: z.string().optional(),
    startTime: z.string().regex(TIME_RE, 'startTime must be HH:MM').optional(),
    endTime: z.string().regex(TIME_RE, 'endTime must be HH:MM').optional(),
  })
  .refine(
    (d) => {
      if (d.startTime && d.endTime) return d.startTime < d.endTime
      return true
    },
    { message: 'startTime must be before endTime', path: ['endTime'] },
  )

export const updateShiftStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
})

export const listShiftsSchema = z.object({
  caregiverId: z.coerce.number().int().positive().optional(),
  patientId: z.coerce.number().int().positive().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

export const listMyShiftsSchema = z.object({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

export type CreateShiftInput = z.infer<typeof createShiftSchema>
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>
export type UpdateShiftStatusInput = z.infer<typeof updateShiftStatusSchema>
export type ListShiftsQuery = z.infer<typeof listShiftsSchema>
export type ListMyShiftsQuery = z.infer<typeof listMyShiftsSchema>
