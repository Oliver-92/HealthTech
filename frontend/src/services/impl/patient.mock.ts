import { delay } from '../config'
import { MOCK_PATIENTS } from '../mocks/data'
import type { Patient, CreatePatientDto, UpdatePatientDto, ListParams } from '@/types'

export const patientServiceMock = {
  list: async (params?: ListParams) => {
    await delay()
    let result = [...MOCK_PATIENTS]
    if (params?.isActive !== undefined)
      result = result.filter((p) => String(p.isActive) === params.isActive)
    if (params?.q) {
      const q = params.q.toLowerCase()
      result = result.filter(
        (p) =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.documentId.includes(q),
      )
    }
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize
      return { data: result.slice(start, start + params.pageSize), total: result.length, page: params.page, pageSize: params.pageSize }
    }
    return result
  },

  getById: async (id: number) => {
    await delay()
    const found = MOCK_PATIENTS.find((p) => p.id === id)
    if (!found) throw new Error('Paciente no encontrado')
    return found
  },

  create: async (dto: CreatePatientDto): Promise<Patient> => {
    await delay()
    return {
      id: Date.now(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      documentId: dto.documentId,
      birthDate: dto.birthDate ?? null,
      address: dto.address ?? null,
      phone: dto.phone ?? null,
      emergencyContact: dto.emergencyContact ?? null,
      notes: dto.notes ?? null,
      isActive: true,
      createdAt: new Date().toISOString(),
      user: dto.email ? { id: Date.now(), email: dto.email } : null,
    }
  },

  update: async (id: number, dto: UpdatePatientDto): Promise<Patient> => {
    await delay()
    const found = MOCK_PATIENTS.find((p) => p.id === id)
    if (!found) throw new Error('Paciente no encontrado')
    return { ...found, ...dto }
  },

  deactivate: async (id: number): Promise<Patient> => {
    await delay()
    const found = MOCK_PATIENTS.find((p) => p.id === id)
    if (!found) throw new Error('Paciente no encontrado')
    return { ...found, isActive: false }
  },
}
