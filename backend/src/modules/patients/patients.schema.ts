import { z } from 'zod'
import { dateString } from '../../utils/schemas.js'

export const createPatientSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    documentId: z.string().min(1, 'Document ID is required'),
    birthDate: dateString.optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    emergencyContact: z.string().optional(),
    notes: z.string().optional(),
    // Optional login account for family member
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
  })
  .refine((d) => (d.email == null) === (d.password == null), {
    message: 'email and password must both be provided or both omitted',
    path: ['email'],
  })

export const updatePatientSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  notes: z.string().optional(),
})

export const listPatientsSchema = z.object({
  q: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
export type ListPatientsQuery = z.infer<typeof listPatientsSchema>
