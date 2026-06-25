import { api } from '../api'
import type { Shift, CreateShiftDto, UpdateShiftDto, UpdateShiftStatusDto, ShiftListParams, Paginated } from '@/types'

export const shiftServiceReal = {
  list: (params?: ShiftListParams) =>
    api.get<Shift[] | Paginated<Shift>>('/shifts', { params }).then((r) => r.data),

  getById: (id: number) =>
    api.get<Shift>(`/shifts/${id}`).then((r) => r.data),

  create: (dto: CreateShiftDto) =>
    api.post<Shift>('/shifts', dto).then((r) => r.data),

  update: (id: number, dto: UpdateShiftDto) =>
    api.put<Shift>(`/shifts/${id}`, dto).then((r) => r.data),

  updateStatus: (id: number, dto: UpdateShiftStatusDto) =>
    api.patch<Shift>(`/shifts/${id}/status`, dto).then((r) => r.data),

  remove: (id: number) =>
    api.delete(`/shifts/${id}`).then(() => undefined),

  listMine: (params?: Pick<ShiftListParams, 'status' | 'from' | 'to'>) =>
    api.get<Shift[]>('/me/shifts', { params }).then((r) => r.data),
}
