import { delay } from '../config'
import { MOCK_CAREGIVERS } from '../mocks/data'
import type { Caregiver, CreateCaregiverDto, UpdateCaregiverDto, ListParams } from '@/types'

export const caregiverServiceMock = {
  list: async (params?: ListParams) => {
    await delay()
    let result = [...MOCK_CAREGIVERS]
    if (params?.isActive !== undefined)
      result = result.filter((c) => String(c.isActive) === params.isActive)
    if (params?.q) {
      const q = params.q.toLowerCase()
      result = result.filter(
        (c) =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.documentId.includes(q),
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
    const found = MOCK_CAREGIVERS.find((c) => c.id === id)
    if (!found) throw new Error('Cuidador no encontrado')
    return found
  },

  create: async (dto: CreateCaregiverDto): Promise<Caregiver> => {
    await delay()
    return {
      id: Date.now(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      documentId: dto.documentId,
      phone: dto.phone ?? null,
      hourlyRate: dto.hourlyRate,
      isActive: true,
      hiredAt: dto.hiredAt,
      createdAt: new Date().toISOString(),
      user: { id: Date.now(), email: dto.email },
    }
  },

  update: async (id: number, dto: UpdateCaregiverDto): Promise<Caregiver> => {
    await delay()
    const found = MOCK_CAREGIVERS.find((c) => c.id === id)
    if (!found) throw new Error('Cuidador no encontrado')
    return { ...found, ...dto }
  },

  deactivate: async (id: number): Promise<Caregiver> => {
    await delay()
    const found = MOCK_CAREGIVERS.find((c) => c.id === id)
    if (!found) throw new Error('Cuidador no encontrado')
    return { ...found, isActive: false }
  },
}
