import { z } from 'zod'
import { dateString } from '../../utils/schemas.js'

const TIME_RE = /^\d{2}:\d{2}$/

export const createShiftSchema = z
  .object({
    patientId: z.number().int().positive('patientId must be a positive integer'),
    caregiverId: z.number().int().positive('caregiverId must be a positive integer'),
    date: dateString,
    startTime: z.string().regex(TIME_RE, 'startTime must be HH:MM'),
    endTime: z.string().regex(TIME_RE, 'endTime must be HH:MM'),
  })
  .refine((d) => d.startTime !== d.endTime, {
    message: 'startTime and endTime must differ (a shift may cross midnight)',
    path: ['endTime'],
  })

export const updateShiftSchema = z
  .object({
    patientId: z.number().int().positive().optional(),
    caregiverId: z.number().int().positive().optional(),
    date: dateString.optional(),
    startTime: z.string().regex(TIME_RE, 'startTime must be HH:MM').optional(),
    endTime: z.string().regex(TIME_RE, 'endTime must be HH:MM').optional(),
  })
  .refine(
    (d) => {
      if (d.startTime && d.endTime) return d.startTime !== d.endTime
      return true
    },
    { message: 'startTime and endTime must differ', path: ['endTime'] },
  )

export const updateShiftStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
})

export const listShiftsSchema = z.object({
  caregiverId: z.coerce.number().int().positive().optional(),
  patientId: z.coerce.number().int().positive().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  from: dateString.optional(),
  to: dateString.optional(),
})

export const listMyShiftsSchema = z.object({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  from: dateString.optional(),
  to: dateString.optional(),
})

export type CreateShiftInput = z.infer<typeof createShiftSchema>
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>
export type UpdateShiftStatusInput = z.infer<typeof updateShiftStatusSchema>
export type ListShiftsQuery = z.infer<typeof listShiftsSchema>
export type ListMyShiftsQuery = z.infer<typeof listMyShiftsSchema>
