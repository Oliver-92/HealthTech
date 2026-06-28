import { delay } from '../config'
import { MOCK_PAYROLL_PERIODS, MOCK_PAYMENT_REPORTS, MOCK_PAYMENTS } from '../mocks/data'
import type { CreatePayrollPeriodDto, PayDto, PayrollPeriod, Payment, PaymentListParams } from '@/types'

export const billingServiceMock = {
  listPeriods: async () => {
    await delay()
    return [...MOCK_PAYROLL_PERIODS]
  },

  createPeriod: async (dto: CreatePayrollPeriodDto) => {
    await delay()
    const newPeriod: PayrollPeriod = { id: Date.now(), ...dto, isOpen: true }
    MOCK_PAYROLL_PERIODS.push(newPeriod)
    return newPeriod
  },

  getPeriod: async (id: number) => {
    await delay()
    const found = MOCK_PAYROLL_PERIODS.find((p) => p.id === id)
    if (!found) throw new Error('Período no encontrado')
    return found
  },

  closePeriod: async (id: number) => {
    await delay()
    const idx = MOCK_PAYROLL_PERIODS.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Período no encontrado')
    MOCK_PAYROLL_PERIODS[idx] = { ...MOCK_PAYROLL_PERIODS[idx], isOpen: false }
    return MOCK_PAYROLL_PERIODS[idx]
  },

  generateReports: async (periodId: number) => {
    await delay()
    return MOCK_PAYMENT_REPORTS.filter((r) => r.payrollPeriodId === periodId)
  },

  reportsByPayroll: async (payrollPeriodId: number) => {
    await delay()
    return MOCK_PAYMENT_REPORTS.filter((r) => r.payrollPeriodId === payrollPeriodId)
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
    const idx = MOCK_PAYMENT_REPORTS.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Reporte de pago no encontrado')

    const payment: Payment = {
      id: Date.now(),
      paymentStatus: 'COMPLETED',
      paymentMethod: dto.paymentMethod,
      transactionReference: `MOCK-${Date.now()}`,
      completedAt: new Date().toISOString(),
    }
    MOCK_PAYMENTS.push(payment)
    MOCK_PAYMENT_REPORTS[idx] = {
      ...MOCK_PAYMENT_REPORTS[idx],
      status: 'PAID',
      payments: [...MOCK_PAYMENT_REPORTS[idx].payments, payment],
    }
    return MOCK_PAYMENT_REPORTS[idx]
  },

  listPayments: async (params?: PaymentListParams) => {
    await delay()
    let result = [...MOCK_PAYMENTS]
    if (params?.status) result = result.filter((p) => p.paymentStatus === params.status)
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize
      return { data: result.slice(start, start + params.pageSize), total: result.length, page: params.page, pageSize: params.pageSize }
    }
    return result
  },

  getPayment: async (id: number) => {
    await delay()
    const found = MOCK_PAYMENTS.find((p) => p.id === id)
    if (!found) throw new Error(`Pago ${id} no encontrado`)
    return found
  },
}
