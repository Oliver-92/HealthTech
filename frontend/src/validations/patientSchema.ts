import { z } from 'zod'

export const createPatientSchema = z.object({
  firstName:        z.string().min(1, 'Requerido'),
  lastName:         z.string().min(1, 'Requerido'),
  documentId:       z.string().min(1, 'Requerido'),
  birthDate:        z.string().optional(),
  address:          z.string().optional(),
  phone:            z.string().optional(),
  emergencyContact: z.string().optional(),
  notes:            z.string().optional(),
  email:            z.string().email('Email inválido').optional().or(z.literal('')),
  password:         z.string().min(8, 'Mínimo 8 caracteres').optional().or(z.literal('')),
}).refine(
  (d) => {
    const hasEmail = !!d.email
    const hasPassword = !!d.password
    return hasEmail === hasPassword
  },
  { message: 'Email y contraseña deben ir juntos o ninguno', path: ['email'] },
)

export const updatePatientSchema = z.object({
  firstName:        z.string().min(1, 'Requerido').optional(),
  lastName:         z.string().min(1, 'Requerido').optional(),
  birthDate:        z.string().optional(),
  address:          z.string().optional(),
  phone:            z.string().optional(),
  emergencyContact: z.string().optional(),
  notes:            z.string().optional(),
})

export type CreatePatientForm = z.infer<typeof createPatientSchema>
export type UpdatePatientForm = z.infer<typeof updatePatientSchema>
