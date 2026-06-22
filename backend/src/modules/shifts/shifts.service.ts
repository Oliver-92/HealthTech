import { Prisma, ShiftStatus } from '../../generated/prisma/client.js'
import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import type {
  CreateShiftInput,
  UpdateShiftInput,
  UpdateShiftStatusInput,
  ListShiftsQuery,
  ListMyShiftsQuery,
} from './shifts.schema.js'

// Valid status transitions
const TRANSITIONS: Record<ShiftStatus, ShiftStatus[]> = {
  SCHEDULED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
}

const shiftInclude = {
  patient: { select: { id: true, firstName: true, lastName: true } },
  caregiver: { select: { id: true, firstName: true, lastName: true } },
  report: { select: { id: true, status: true } },
} satisfies Prisma.ShiftInclude

async function assertCaregiverOverlap(
  caregiverId: number,
  date: Date,
  startTime: string,
  endTime: string,
  excludeId?: number,
) {
  const overlap = await prisma.shift.findFirst({
    where: {
      caregiverId,
      date,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      ...(excludeId && { id: { not: excludeId } }),
      AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
    },
  })

  if (overlap) {
    throw ApiError.conflict(
      `Caregiver already has a shift on this date from ${overlap.startTime} to ${overlap.endTime}`,
    )
  }
}

async function assertCaregiverAndPatientActive(caregiverId: number, patientId: number) {
  const [caregiver, patient] = await Promise.all([
    prisma.caregiver.findUnique({ where: { id: caregiverId }, select: { isActive: true } }),
    prisma.patient.findUnique({ where: { id: patientId }, select: { isActive: true } }),
  ])

  if (!caregiver) throw ApiError.notFound(`Caregiver #${caregiverId} not found`)
  if (!caregiver.isActive) throw ApiError.badRequest('Caregiver is inactive')
  if (!patient) throw ApiError.notFound(`Patient #${patientId} not found`)
  if (!patient.isActive) throw ApiError.badRequest('Patient is inactive')
}

export async function listShifts(filters: ListShiftsQuery) {
  const where: Prisma.ShiftWhereInput = {}

  if (filters.caregiverId) where.caregiverId = filters.caregiverId
  if (filters.patientId) where.patientId = filters.patientId
  if (filters.status) where.status = filters.status
  if (filters.from || filters.to) {
    where.date = {
      ...(filters.from && { gte: new Date(filters.from) }),
      ...(filters.to && { lte: new Date(filters.to) }),
    }
  }

  return prisma.shift.findMany({
    where,
    include: shiftInclude,
    orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
  })
}

export async function getShiftById(id: number) {
  const shift = await prisma.shift.findUnique({ where: { id }, include: shiftInclude })
  if (!shift) throw ApiError.notFound(`Shift #${id} not found`)
  return shift
}

export async function createShift(data: CreateShiftInput) {
  await assertCaregiverAndPatientActive(data.caregiverId, data.patientId)

  const date = new Date(data.date)
  await assertCaregiverOverlap(data.caregiverId, date, data.startTime, data.endTime)

  return prisma.shift.create({
    data: {
      patientId: data.patientId,
      caregiverId: data.caregiverId,
      date,
      startTime: data.startTime,
      endTime: data.endTime,
    },
    include: shiftInclude,
  })
}

export async function updateShift(id: number, data: UpdateShiftInput) {
  const shift = await getShiftById(id)

  if (shift.status === 'COMPLETED' || shift.status === 'CANCELLED') {
    throw ApiError.badRequest(`Cannot edit a shift with status ${shift.status}`)
  }

  const caregiverId = data.caregiverId ?? shift.caregiverId
  const patientId = data.patientId ?? shift.patientId

  if (data.caregiverId || data.patientId) {
    await assertCaregiverAndPatientActive(caregiverId, patientId)
  }

  const date = data.date ? new Date(data.date) : shift.date
  const startTime = data.startTime ?? shift.startTime
  const endTime = data.endTime ?? shift.endTime

  if (data.caregiverId || data.date || data.startTime || data.endTime) {
    await assertCaregiverOverlap(caregiverId, date, startTime, endTime, id)
  }

  return prisma.shift.update({
    where: { id },
    data: {
      ...(data.patientId && { patientId }),
      ...(data.caregiverId && { caregiverId }),
      ...(data.date && { date }),
      ...(data.startTime && { startTime }),
      ...(data.endTime && { endTime }),
    },
    include: shiftInclude,
  })
}

export async function updateShiftStatus(id: number, { status }: UpdateShiftStatusInput) {
  const shift = await getShiftById(id)
  const allowed = TRANSITIONS[shift.status]

  if (!allowed.includes(status as ShiftStatus)) {
    throw ApiError.badRequest(
      `Cannot transition from ${shift.status} to ${status}. Allowed: ${allowed.join(', ') || 'none'}`,
    )
  }

  return prisma.shift.update({
    where: { id },
    data: { status: status as ShiftStatus },
    include: shiftInclude,
  })
}

export async function deleteShift(id: number) {
  const shift = await getShiftById(id)

  if (shift.status !== 'SCHEDULED') {
    throw ApiError.badRequest(`Only SCHEDULED shifts can be deleted (current: ${shift.status})`)
  }

  if (shift.report) {
    throw ApiError.badRequest('Cannot delete a shift that already has a report')
  }

  await prisma.shift.delete({ where: { id } })
}

export async function listMyShifts(caregiverId: number, filters: ListMyShiftsQuery) {
  const where: Prisma.ShiftWhereInput = { caregiverId }

  if (filters.status) where.status = filters.status
  if (filters.from || filters.to) {
    where.date = {
      ...(filters.from && { gte: new Date(filters.from) }),
      ...(filters.to && { lte: new Date(filters.to) }),
    }
  }

  return prisma.shift.findMany({
    where,
    include: shiftInclude,
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  })
}
