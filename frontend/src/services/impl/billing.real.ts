import { api } from '../api'
import type {
  PayrollPeriod,
  PaymentReport,
  Payment,
  CreatePayrollPeriodDto,
  PayDto,
  PaymentListParams,
  Paginated,
} from '@/types'

export const billingServiceReal = {
  listPeriods: () =>
    api.get<PayrollPeriod[]>('/billing/payroll-periods').then((r) => r.data),

  createPeriod: (dto: CreatePayrollPeriodDto) =>
    api.post<PayrollPeriod>('/billing/payroll-periods', dto).then((r) => r.data),

  getPeriod: (id: number) =>
    api.get<PayrollPeriod>(`/billing/payroll-periods/${id}`).then((r) => r.data),

  closePeriod: (id: number) =>
    api.patch<PayrollPeriod>(`/billing/payroll-periods/${id}/close`).then((r) => r.data),

  generateReports: (periodId: number) =>
    api.post<PaymentReport[]>(`/billing/payroll-periods/${periodId}/generate-reports`).then((r) => r.data),

  reportsByPayroll: (payrollPeriodId: number) =>
    api.get<PaymentReport[]>(`/billing/payment-reports/payroll/${payrollPeriodId}`).then((r) => r.data),

  reportsByCaregiver: (caregiverId: number) =>
    api.get<PaymentReport[]>(`/billing/payment-reports/caregiver/${caregiverId}`).then((r) => r.data),

  getReport: (id: number) =>
    api.get<PaymentReport>(`/billing/payment-reports/${id}`).then((r) => r.data),

  pay: (id: number, dto: PayDto) =>
    api.post<PaymentReport>(`/billing/payment-reports/${id}/pay`, dto).then((r) => r.data),

  listPayments: (params?: PaymentListParams) =>
    api.get<Payment[] | Paginated<Payment>>('/billing/payments', { params }).then((r) => r.data),

  getPayment: (id: number) =>
    api.get<Payment>(`/billing/payments/${id}`).then((r) => r.data),
}
