import { describe, it, expect } from 'vitest'
import { createPayrollPeriodSchema, paySchema } from './billing.schema.js'

describe('createPayrollPeriodSchema', () => {
  it('accepts a valid period', () => {
    expect(
      createPayrollPeriodSchema.safeParse({
        month: '2026-06-01',
        startDate: '2026-06-01',
        endDate: '2026-06-30',
      }).success,
    ).toBe(true)
  })

  it('rejects startDate after endDate', () => {
    expect(
      createPayrollPeriodSchema.safeParse({
        month: '2026-06-01',
        startDate: '2026-06-30',
        endDate: '2026-06-01',
      }).success,
    ).toBe(false)
  })

  it('rejects malformed dates', () => {
    expect(
      createPayrollPeriodSchema.safeParse({ month: '2026-06', startDate: 'x', endDate: 'y' }).success,
    ).toBe(false)
  })
})

describe('paySchema', () => {
  it.each(['BANK_TRANSFER', 'MERCADO_PAGO'])('accepts payment method %s', (m) => {
    expect(paySchema.safeParse({ paymentMethod: m }).success).toBe(true)
  })

  it('rejects an unknown method', () => {
    expect(paySchema.safeParse({ paymentMethod: 'CASH' }).success).toBe(false)
  })
})
