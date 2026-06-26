import { z } from 'zod'

const time = z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM')

const shiftBase = z.object({
  patientId:   z.coerce.number().int().positive('Requerido'),
  caregiverId: z.coerce.number().int().positive('Requerido'),
  date:        z.string().min(1, 'Requerido'),
  startTime:   time,
  endTime:     time,
})

export const createShiftSchema = shiftBase.refine(
  (d) => d.startTime !== d.endTime,
  { message: 'Inicio y fin deben diferir', path: ['endTime'] },
)

export const updateShiftSchema = shiftBase.partial()

export type CreateShiftForm = z.infer<typeof createShiftSchema>
export type UpdateShiftForm = z.infer<typeof updateShiftSchema>
