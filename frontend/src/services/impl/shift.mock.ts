import { delay } from '../config'
import { MOCK_SHIFTS, MOCK_PATIENTS, MOCK_CAREGIVERS } from '../mocks/data'
import { currentCaregiverId } from '../mocks/session'
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
    const patient = MOCK_PATIENTS.find((p) => p.id === dto.patientId)
    const caregiver = MOCK_CAREGIVERS.find((c) => c.id === dto.caregiverId)
    const newShift: Shift = {
      id: Date.now(),
      ...dto,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patient: { id: dto.patientId, firstName: patient?.firstName ?? 'Paciente', lastName: patient?.lastName ?? '' },
      caregiver: { id: dto.caregiverId, firstName: caregiver?.firstName ?? 'Cuidador', lastName: caregiver?.lastName ?? '' },
      report: null,
    }
    MOCK_SHIFTS.push(newShift)
    return newShift
  },

  update: async (id: number, dto: UpdateShiftDto): Promise<Shift> => {
    await delay()
    const idx = MOCK_SHIFTS.findIndex((s) => s.id === id)
    if (idx === -1) throw new Error('Guardia no encontrada')
    MOCK_SHIFTS[idx] = { ...MOCK_SHIFTS[idx], ...dto, updatedAt: new Date().toISOString() }
    return MOCK_SHIFTS[idx]
  },

  updateStatus: async (id: number, dto: UpdateShiftStatusDto): Promise<Shift> => {
    await delay()
    const idx = MOCK_SHIFTS.findIndex((s) => s.id === id)
    if (idx === -1) throw new Error('Guardia no encontrada')
    MOCK_SHIFTS[idx] = { ...MOCK_SHIFTS[idx], status: dto.status, updatedAt: new Date().toISOString() }
    return MOCK_SHIFTS[idx]
  },

  remove: async (id: number): Promise<void> => {
    await delay()
    const idx = MOCK_SHIFTS.findIndex((s) => s.id === id)
    if (idx !== -1) MOCK_SHIFTS.splice(idx, 1)
  },

  listMine: async (params?: Pick<ShiftListParams, 'status' | 'from' | 'to'>) => {
    await delay()
    const caregiverId = currentCaregiverId()
    let result = MOCK_SHIFTS.filter((s) => s.caregiverId === caregiverId)
    if (params?.status) result = result.filter((s) => s.status === params.status)
    return result
  },
}
