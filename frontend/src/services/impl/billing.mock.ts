import { delay } from '../config'
import { MOCK_PAYROLL_PERIODS, MOCK_PAYMENT_REPORTS } from '../mocks/data'
import type { CreatePayrollPeriodDto, PayDto } from '@/types'

export const billingServiceMock = {
  listPeriods: async () => {
    await delay()
    return MOCK_PAYROLL_PERIODS
  },

  createPeriod: async (dto: CreatePayrollPeriodDto) => {
    await delay()
    return { id: Date.now(), ...dto, isOpen: true }
  },

  getPeriod: async (id: number) => {
    await delay()
    const found = MOCK_PAYROLL_PERIODS.find((p) => p.id === id)
    if (!found) throw new Error('Período no encontrado')
    return found
  },

  closePeriod: async (id: number) => {
    await delay()
    const found = MOCK_PAYROLL_PERIODS.find((p) => p.id === id)
    if (!found) throw new Error('Período no encontrado')
    return { ...found, isOpen: false }
  },

  generateReports: async (_: number) => {
    await delay()
    return MOCK_PAYMENT_REPORTS
  },

  reportsByPayroll: async (_: number) => {
    await delay()
    return MOCK_PAYMENT_REPORTS
  },

  reportsByCaregiver: async (caregiverId: number) => {
    await delay()
    return MOCK_PAYMENT_REPORTS.filter((r) => r.caregiverId === caregiverId)
  },

  getReport: async (id: number) => {
    await delay()
    const found = MOCK_PAYMENT_REPORTS.find((r) => r.id === id)
    if (!found) throw new Error('Reporte de pago no encontrado')
    return found
  },

  pay: async (id: number, dto: PayDto) => {
    await delay()
    const found = MOCK_PAYMENT_REPORTS.find((r) => r.id === id)
    if (!found) throw new Error('Reporte de pago no encontrado')
    return {
      ...found,
      status: 'PAID' as const,
      payments: [{
        id: Date.now(),
        paymentStatus: 'COMPLETED' as const,
        paymentMethod: dto.paymentMethod,
        transactionReference: `MOCK-${Date.now()}`,
        completedAt: new Date().toISOString(),
      }],
    }
  },

  listPayments: async () => {
    await delay()
    return []
  },

  getPayment: async (id: number) => {
    await delay()
    throw new Error(`Pago ${id} no encontrado en mock`)
  },
}
