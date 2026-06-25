import { api } from '../api'
import type { Caregiver, CreateCaregiverDto, UpdateCaregiverDto, ListParams, Paginated } from '@/types'

export const caregiverServiceReal = {
  list: (params?: ListParams) =>
    api.get<Caregiver[] | Paginated<Caregiver>>('/caregivers', { params }).then((r) => r.data),

  getById: (id: number) =>
    api.get<Caregiver>(`/caregivers/${id}`).then((r) => r.data),

  create: (dto: CreateCaregiverDto) =>
    api.post<Caregiver>('/caregivers', dto).then((r) => r.data),

  update: (id: number, dto: UpdateCaregiverDto) =>
    api.put<Caregiver>(`/caregivers/${id}`, dto).then((r) => r.data),

  deactivate: (id: number) =>
    api.patch<Caregiver>(`/caregivers/${id}/deactivate`).then((r) => r.data),
}
