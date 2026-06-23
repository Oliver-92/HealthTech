import { z } from 'zod'
import { dateString } from '../../utils/schemas.js'
import { paginationFields } from '../../utils/pagination.js'

export const createCaregiverSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  documentId: z.string().min(1, 'Document ID is required'),
  phone: z.string().optional(),
  hourlyRate: z.number().positive('Hourly rate must be positive'),
  hiredAt: dateString,
})

export const updateCaregiverSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  hourlyRate: z.number().positive().optional(),
  hiredAt: dateString.optional(),
})

export const listCaregiversSchema = z.object({
  q: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  ...paginationFields,
})

export type CreateCaregiverInput = z.infer<typeof createCaregiverSchema>
export type UpdateCaregiverInput = z.infer<typeof updateCaregiverSchema>
export type ListCaregiversQuery = z.infer<typeof listCaregiversSchema>
