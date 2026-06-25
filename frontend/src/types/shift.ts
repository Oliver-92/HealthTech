import type { ReportStatus } from './report'

export type ShiftStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export interface Shift {
  id: number
  patientId: number
  caregiverId: number
  date: string
  startTime: string
  endTime: string
  status: ShiftStatus
  createdAt: string
  updatedAt: string
  patient: { id: number; firstName: string; lastName: string }
  caregiver: { id: number; firstName: string; lastName: string }
  report: { id: number; status: ReportStatus } | null
}

export interface CreateShiftDto {
  patientId: number
  caregiverId: number
  date: string
  startTime: string
  endTime: string
}

export interface UpdateShiftDto {
  patientId?: number
  caregiverId?: number
  date?: string
  startTime?: string
  endTime?: string
}

export interface UpdateShiftStatusDto {
  status: ShiftStatus
}

export interface ShiftListParams {
  caregiverId?: number
  patientId?: number
  status?: ShiftStatus
  from?: string
  to?: string
  page?: number
  pageSize?: number
}
