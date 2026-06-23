import { z } from 'zod'
import { dateString } from '../../utils/schemas.js'
import { paginationFields } from '../../utils/pagination.js'

export const createPayrollPeriodSchema = z
  .object({
    month: dateString,
    startDate: dateString,
    endDate: dateString,
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: 'startDate must be on or before endDate',
    path: ['endDate'],
  })

export const paySchema = z.object({
  paymentMethod: z.enum(['BANK_TRANSFER', 'MERCADO_PAGO']),
})

export const listPaymentsSchema = z.object({
  status: z.enum(['CREATED', 'INITIATED', 'COMPLETED', 'FAILED']).optional(),
  ...paginationFields,
})

export const payrollPeriodParamSchema = z.object({
  payrollPeriodId: z.coerce.number().int().positive('payrollPeriodId must be a positive integer'),
})

export const caregiverParamSchema = z.object({
  caregiverId: z.coerce.number().int().positive('caregiverId must be a positive integer'),
})

export type CreatePayrollPeriodInput = z.infer<typeof createPayrollPeriodSchema>
export type PayInput = z.infer<typeof paySchema>
export type ListPaymentsQuery = z.infer<typeof listPaymentsSchema>
