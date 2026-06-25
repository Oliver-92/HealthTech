export type PaymentMethod = 'BANK_TRANSFER' | 'MERCADO_PAGO'
export type PaymentStatus = 'CREATED' | 'INITIATED' | 'COMPLETED' | 'FAILED'
export type PaymentReportStatus =
  | 'GENERATED'
  | 'PAYMENT_IN_PROGRESS'
  | 'PAID'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'

export interface PayrollPeriod {
  id: number
  month: string
  startDate: string
  endDate: string
  isOpen: boolean
}

export interface Payment {
  id: number
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  transactionReference: string | null
  completedAt: string | null
}

export interface PaymentReport {
  id: number
  payrollPeriodId: number
  caregiverId: number
  totalTimeMins: number
  totalAmount: number
  status: PaymentReportStatus
  generatedAt: string
  caregiver: { id: number; firstName: string; lastName: string }
  payrollPeriod: { id: number; month: string; startDate: string; endDate: string }
  payments: Payment[]
}

export interface CreatePayrollPeriodDto {
  month: string
  startDate: string
  endDate: string
}

export interface PayDto {
  paymentMethod: PaymentMethod
}

export interface PaymentListParams {
  status?: PaymentStatus
  page?: number
  pageSize?: number
}
