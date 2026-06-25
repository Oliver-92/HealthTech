import { api } from '../api'
import type { Patient, CreatePatientDto, UpdatePatientDto, ListParams, Paginated } from '@/types'

export const patientServiceReal = {
  list: (params?: ListParams) =>
    api.get<Patient[] | Paginated<Patient>>('/patients', { params }).then((r) => r.data),

  getById: (id: number) =>
    api.get<Patient>(`/patients/${id}`).then((r) => r.data),

  create: (dto: CreatePatientDto) =>
    api.post<Patient>('/patients', dto).then((r) => r.data),

  update: (id: number, dto: UpdatePatientDto) =>
    api.put<Patient>(`/patients/${id}`, dto).then((r) => r.data),

  deactivate: (id: number) =>
    api.patch<Patient>(`/patients/${id}/deactivate`).then((r) => r.data),
}
