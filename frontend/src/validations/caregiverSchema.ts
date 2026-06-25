import { z } from 'zod'

export const createCaregiverSchema = z.object({
  email:      z.string().email('Email inválido'),
  password:   z.string().min(8, 'Mínimo 8 caracteres'),
  firstName:  z.string().min(1, 'Requerido'),
  lastName:   z.string().min(1, 'Requerido'),
  documentId: z.string().min(1, 'Requerido'),
  phone:      z.string().optional(),
  hourlyRate: z.coerce.number().positive('Debe ser mayor a 0'),
  hiredAt:    z.string().min(1, 'Requerido'),
})

export const updateCaregiverSchema = createCaregiverSchema
  .pick({ firstName: true, lastName: true, phone: true, hourlyRate: true, hiredAt: true })
  .partial()

export type CreateCaregiverForm = z.infer<typeof createCaregiverSchema>
export type UpdateCaregiverForm = z.infer<typeof updateCaregiverSchema>
