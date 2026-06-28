import { delay } from '../config'
import { MOCK_REPORTS, MOCK_SHIFTS, MOCK_CAREGIVERS, MOCK_PATIENTS } from '../mocks/data'
import { currentCaregiverId } from '../mocks/session'
import type { Report, CreateReportDto, UpdateReportDto, RejectReportDto, ReportListParams, ReportStatus } from '@/types'

// Mantiene en sync el puntero `report` embebido en la guardia
function syncShiftReport(shiftId: number, reportId: number, status: ReportStatus) {
  const shift = MOCK_SHIFTS.find((s) => s.id === shiftId)
  if (shift) shift.report = { id: reportId, status }
}

export const reportServiceMock = {
  createForShift: async (shiftId: number, dto: CreateReportDto): Promise<Report> => {
    await delay()
    const caregiverId = currentCaregiverId()
    const shift = MOCK_SHIFTS.find((s) => s.id === shiftId)
    const caregiver = MOCK_CAREGIVERS.find((c) => c.id === caregiverId)
    const patientId = shift?.patientId ?? 1
    const patient = MOCK_PATIENTS.find((p) => p.id === patientId)
    const status: ReportStatus = dto.submit ? 'SUBMITTED' : 'DRAFT'

    const newReport: Report = {
      id: Date.now(),
      shiftId,
      caregiverId,
      patientId,
      workedMinutes: dto.workedMinutes,
      observations: dto.observations ?? null,
      medication: dto.medication ?? null,
      vitalSigns: dto.vitalSigns ?? null,
      status,
      rejectionReason: null,
      reviewedById: null,
      reviewedAt: null,
      createdAt: new Date().toISOString(),
      shift: shift
        ? { id: shift.id, date: shift.date, startTime: shift.startTime, endTime: shift.endTime, status: shift.status }
        : { id: shiftId, date: new Date().toISOString(), startTime: '08:00', endTime: '14:00', status: 'COMPLETED' },
      caregiver: { id: caregiverId, firstName: caregiver?.firstName ?? 'Cuidador', lastName: caregiver?.lastName ?? '' },
      patient: { id: patientId, firstName: patient?.firstName ?? 'Paciente', lastName: patient?.lastName ?? '' },
      reviewedBy: null,
    }
    MOCK_REPORTS.push(newReport)
    syncShiftReport(shiftId, newReport.id, status)
    return newReport
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
    const idx = MOCK_REPORTS.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Informe no encontrado')
    MOCK_REPORTS[idx] = {
      ...MOCK_REPORTS[idx],
      status: 'APPROVED',
      rejectionReason: null,
      reviewedById: 1,
      reviewedAt: new Date().toISOString(),
      reviewedBy: { id: 1, email: 'admin@healthtech.com' },
    }
    syncShiftReport(MOCK_REPORTS[idx].shiftId, id, 'APPROVED')
    return MOCK_REPORTS[idx]
  },

  reject: async (id: number, dto: RejectReportDto): Promise<Report> => {
    await delay()
    const idx = MOCK_REPORTS.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Informe no encontrado')
    MOCK_REPORTS[idx] = {
      ...MOCK_REPORTS[idx],
      status: 'REJECTED',
      rejectionReason: dto.reason,
      reviewedById: 1,
      reviewedAt: new Date().toISOString(),
      reviewedBy: { id: 1, email: 'admin@healthtech.com' },
    }
    syncShiftReport(MOCK_REPORTS[idx].shiftId, id, 'REJECTED')
    return MOCK_REPORTS[idx]
  },

  update: async (id: number, dto: UpdateReportDto): Promise<Report> => {
    await delay()
    const idx = MOCK_REPORTS.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Informe no encontrado')
    // Editar un informe lo devuelve a DRAFT y limpia el motivo de rechazo (igual que el backend)
    MOCK_REPORTS[idx] = { ...MOCK_REPORTS[idx], ...dto, status: 'DRAFT', rejectionReason: null }
    syncShiftReport(MOCK_REPORTS[idx].shiftId, id, 'DRAFT')
    return MOCK_REPORTS[idx]
  },

  submit: async (id: number): Promise<Report> => {
    await delay()
    const idx = MOCK_REPORTS.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Informe no encontrado')
    MOCK_REPORTS[idx] = { ...MOCK_REPORTS[idx], status: 'SUBMITTED' }
    syncShiftReport(MOCK_REPORTS[idx].shiftId, id, 'SUBMITTED')
    return MOCK_REPORTS[idx]
  },

  listMine: async (params?: Pick<ReportListParams, 'status'>) => {
    await delay()
    const caregiverId = currentCaregiverId()
    let result = MOCK_REPORTS.filter((r) => r.caregiverId === caregiverId)
    if (params?.status) result = result.filter((r) => r.status === params.status)
    return result
  },
}
