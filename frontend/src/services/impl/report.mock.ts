import { delay } from '../config'
import { MOCK_REPORTS } from '../mocks/data'
import type { Report, CreateReportDto, UpdateReportDto, RejectReportDto, ReportListParams } from '@/types'

export const reportServiceMock = {
  createForShift: async (shiftId: number, dto: CreateReportDto): Promise<Report> => {
    await delay()
    return {
      id: Date.now(),
      shiftId,
      caregiverId: 1,
      patientId: 1,
      workedMinutes: dto.workedMinutes,
      observations: dto.observations ?? null,
      medication: dto.medication ?? null,
      vitalSigns: dto.vitalSigns ?? null,
      status: dto.submit ? 'SUBMITTED' : 'DRAFT',
      rejectionReason: null,
      reviewedById: null,
      reviewedAt: null,
      createdAt: new Date().toISOString(),
      shift: { id: shiftId, date: new Date().toISOString(), startTime: '08:00', endTime: '14:00', status: 'COMPLETED' },
      caregiver: { id: 1, firstName: 'María', lastName: 'López' },
      patient: { id: 1, firstName: 'Roberto', lastName: 'García' },
      reviewedBy: null,
    }
  },

  list: async (params?: ReportListParams) => {
    await delay()
    let result = [...MOCK_REPORTS]
    if (params?.caregiverId) result = result.filter((r) => r.caregiverId === params.caregiverId)
    if (params?.patientId) result = result.filter((r) => r.patientId === params.patientId)
    if (params?.status) result = result.filter((r) => r.status === params.status)
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize
      return { data: result.slice(start, start + params.pageSize), total: result.length, page: params.page, pageSize: params.pageSize }
    }
    return result
  },

  getById: async (id: number) => {
    await delay()
    const found = MOCK_REPORTS.find((r) => r.id === id)
    if (!found) throw new Error('Informe no encontrado')
    return found
  },

  approve: async (id: number): Promise<Report> => {
    await delay()
    const found = MOCK_REPORTS.find((r) => r.id === id)
    if (!found) throw new Error('Informe no encontrado')
    return { ...found, status: 'APPROVED', reviewedAt: new Date().toISOString() }
  },

  reject: async (id: number, dto: RejectReportDto): Promise<Report> => {
    await delay()
    const found = MOCK_REPORTS.find((r) => r.id === id)
    if (!found) throw new Error('Informe no encontrado')
    return { ...found, status: 'REJECTED', rejectionReason: dto.reason, reviewedAt: new Date().toISOString() }
  },

  update: async (id: number, dto: UpdateReportDto): Promise<Report> => {
    await delay()
    const found = MOCK_REPORTS.find((r) => r.id === id)
    if (!found) throw new Error('Informe no encontrado')
    return { ...found, ...dto }
  },

  submit: async (id: number): Promise<Report> => {
    await delay()
    const found = MOCK_REPORTS.find((r) => r.id === id)
    if (!found) throw new Error('Informe no encontrado')
    return { ...found, status: 'SUBMITTED' }
  },

  listMine: async (params?: Pick<ReportListParams, 'status'>) => {
    await delay()
    let result = MOCK_REPORTS.filter((r) => r.caregiverId === 1)
    if (params?.status) result = result.filter((r) => r.status === params.status)
    return result
  },
}
