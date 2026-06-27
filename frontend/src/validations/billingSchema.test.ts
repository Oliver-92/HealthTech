import { describe, it, expect } from 'vitest'
import { createPeriodSchema, paySchema } from './billingSchema'

describe('createPeriodSchema', () => {
  it('acepta un período con startDate <= endDate', () => {
    const r = createPeriodSchema.safeParse({
      month: '2024-03-01',
      startDate: '2024-03-01',
      endDate: '2024-03-31',
    })
    expect(r.success).toBe(true)
  })

  it('rechaza cuando endDate es anterior a startDate', () => {
    const r = createPeriodSchema.safeParse({
      month: '2024-03-01',
      startDate: '2024-03-31',
      endDate: '2024-03-01',
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].path).toEqual(['endDate'])
  })
})

describe('paySchema', () => {
  it('acepta métodos válidos', () => {
    expect(paySchema.safeParse({ paymentMethod: 'BANK_TRANSFER' }).success).toBe(true)
    expect(paySchema.safeParse({ paymentMethod: 'MERCADO_PAGO' }).success).toBe(true)
  })

  it('rechaza un método desconocido', () => {
    expect(paySchema.safeParse({ paymentMethod: 'CASH' }).success).toBe(false)
  })
})
