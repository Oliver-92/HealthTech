import type { ShiftStatus } from './shift'

export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

export interface Report {
  id: number
  shiftId: number
  caregiverId: number
  patientId: number
  workedMinutes: number
  observations: string | null
  medication: string | null
  vitalSigns: string | null
  status: ReportStatus
  rejectionReason: string | null
  reviewedById: number | null
  reviewedAt: string | null
  createdAt: string
  shift: { id: number; date: string; startTime: string; endTime: string; status: ShiftStatus }
  caregiver: { id: number; firstName: string; lastName: string }
  patient: { id: number; firstName: string; lastName: string }
  reviewedBy: { id: number; email: string } | null
}

export interface CreateReportDto {
  workedMinutes: number
  observations?: string
  medication?: string
  vitalSigns?: string
  submit?: boolean
}

export interface UpdateReportDto {
  workedMinutes?: number
  observations?: string
  medication?: string
  vitalSigns?: string
}

export interface RejectReportDto {
  reason: string
}

export interface ReportListParams {
  caregiverId?: number
  patientId?: number
  status?: ReportStatus
  page?: number
  pageSize?: number
}
