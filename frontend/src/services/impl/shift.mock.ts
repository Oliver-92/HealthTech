import { delay } from '../config'
import { MOCK_SHIFTS } from '../mocks/data'
import type { Shift, CreateShiftDto, UpdateShiftDto, UpdateShiftStatusDto, ShiftListParams } from '@/types'

export const shiftServiceMock = {
  list: async (params?: ShiftListParams) => {
    await delay()
    let result = [...MOCK_SHIFTS]
    if (params?.caregiverId) result = result.filter((s) => s.caregiverId === params.caregiverId)
    if (params?.patientId) result = result.filter((s) => s.patientId === params.patientId)
    if (params?.status) result = result.filter((s) => s.status === params.status)
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize
      return { data: result.slice(start, start + params.pageSize), total: result.length, page: params.page, pageSize: params.pageSize }
    }
    return result
  },

  getById: async (id: number) => {
    await delay()
    const found = MOCK_SHIFTS.find((s) => s.id === id)
    if (!found) throw new Error('Guardia no encontrada')
    return found
  },

  create: async (dto: CreateShiftDto): Promise<Shift> => {
    await delay()
    return {
      id: Date.now(),
      ...dto,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patient: { id: dto.patientId, firstName: 'Paciente', lastName: 'Mock' },
      caregiver: { id: dto.caregiverId, firstName: 'Cuidador', lastName: 'Mock' },
      report: null,
    }
  },

  update: async (id: number, dto: UpdateShiftDto): Promise<Shift> => {
    await delay()
    const found = MOCK_SHIFTS.find((s) => s.id === id)
    if (!found) throw new Error('Guardia no encontrada')
    return { ...found, ...dto, updatedAt: new Date().toISOString() }
  },

  updateStatus: async (id: number, dto: UpdateShiftStatusDto): Promise<Shift> => {
    await delay()
    const found = MOCK_SHIFTS.find((s) => s.id === id)
    if (!found) throw new Error('Guardia no encontrada')
    return { ...found, status: dto.status, updatedAt: new Date().toISOString() }
  },

  remove: async (_: number): Promise<void> => {
    await delay()
  },

  listMine: async (params?: Pick<ShiftListParams, 'status' | 'from' | 'to'>) => {
    await delay()
    let result = MOCK_SHIFTS.filter((s) => s.caregiverId === 1)
    if (params?.status) result = result.filter((s) => s.status === params.status)
    return result
  },
}
