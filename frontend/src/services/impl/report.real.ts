import { api } from '../api'
import type { Report, CreateReportDto, UpdateReportDto, RejectReportDto, ReportListParams, Paginated } from '@/types'

export const reportServiceReal = {
  createForShift: (shiftId: number, dto: CreateReportDto) =>
    api.post<Report>(`/shifts/${shiftId}/report`, dto).then((r) => r.data),

  list: (params?: ReportListParams) =>
    api.get<Report[] | Paginated<Report>>('/reports', { params }).then((r) => r.data),

  getById: (id: number) =>
    api.get<Report>(`/reports/${id}`).then((r) => r.data),

  approve: (id: number) =>
    api.patch<Report>(`/reports/${id}/approve`).then((r) => r.data),

  reject: (id: number, dto: RejectReportDto) =>
    api.patch<Report>(`/reports/${id}/reject`, dto).then((r) => r.data),

  update: (id: number, dto: UpdateReportDto) =>
    api.put<Report>(`/reports/${id}`, dto).then((r) => r.data),

  submit: (id: number) =>
    api.patch<Report>(`/reports/${id}/submit`).then((r) => r.data),

  listMine: (params?: Pick<ReportListParams, 'status'>) =>
    api.get<Report[]>('/me/reports', { params }).then((r) => r.data),
}
