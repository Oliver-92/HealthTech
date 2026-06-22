import { z } from 'zod'

export const createCaregiverSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  documentId: z.string().min(1, 'Document ID is required'),
  phone: z.string().optional(),
  hourlyRate: z.number().positive('Hourly rate must be positive'),
  hiredAt: z.string().min(1, 'Hire date is required'),
})

export const updateCaregiverSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  hourlyRate: z.number().positive().optional(),
  hiredAt: z.string().optional(),
})

export const listCaregiversSchema = z.object({
  q: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
})

export type CreateCaregiverInput = z.infer<typeof createCaregiverSchema>
export type UpdateCaregiverInput = z.infer<typeof updateCaregiverSchema>
export type ListCaregiversQuery = z.infer<typeof listCaregiversSchema>
