import { z } from 'zod'

export const createPeriodSchema = z
  .object({
    month:     z.string().min(1, 'Requerido'),
    startDate: z.string().min(1, 'Requerido'),
    endDate:   z.string().min(1, 'Requerido'),
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: 'La fecha de fin debe ser igual o posterior al inicio',
    path: ['endDate'],
  })

export const paySchema = z.object({
  paymentMethod: z.enum(['BANK_TRANSFER', 'MERCADO_PAGO'], {
    message: 'Seleccioná un método de pago',
  }),
})

export type CreatePeriodForm = z.infer<typeof createPeriodSchema>
export type PayForm = z.infer<typeof paySchema>
