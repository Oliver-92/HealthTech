import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import type {
  CreateReportInput,
  UpdateReportInput,
  RejectReportInput,
  ListReportsQuery,
} from './reports.schema.js'

const reportInclude = {
  shift: { select: { id: true, date: true, startTime: true, endTime: true, status: true } },
  caregiver: { select: { id: true, firstName: true, lastName: true } },
  patient: { select: { id: true, firstName: true, lastName: true } },
  reviewedBy: { select: { id: true, email: true } },
} satisfies Prisma.ReportInclude

// ── Admin ────────────────────────────────────────────────────────────────────

export async function listReports(filters: ListReportsQuery) {
  const where: Prisma.ReportWhereInput = {}
  if (filters.caregiverId) where.caregiverId = filters.caregiverId
  if (filters.patientId) where.patientId = filters.patientId
  if (filters.status) where.status = filters.status

  return prisma.report.findMany({
    where,
    include: reportInclude,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getReportById(id: number) {
  const report = await prisma.report.findUnique({ where: { id }, include: reportInclude })
  if (!report) throw ApiError.notFound(`Report #${id} not found`)
  return report
}

export async function approveReport(id: number, adminUserId: number) {
  const report = await getReportById(id)

  if (report.status !== 'SUBMITTED') {
    throw ApiError.badRequest(`Only SUBMITTED reports can be approved (current: ${report.status})`)
  }

  // A report on a cancelled / no-show shift must not silently revive it to COMPLETED
  if (report.shift.status === 'CANCELLED' || report.shift.status === 'NO_SHOW') {
    throw ApiError.badRequest(`Cannot approve a report for a ${report.shift.status} shift`)
  }

  // Approve report and set shift to COMPLETED in a single transaction
  return prisma.$transaction(async (tx) => {
    const updated = await tx.report.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedById: adminUserId,
        reviewedAt: new Date(),
      },
      include: reportInclude,
    })

    await tx.shift.update({
      where: { id: report.shift.id },
      data: { status: 'COMPLETED' },
    })

    return updated
  })
}

export async function rejectReport(id: number, adminUserId: number, { reason }: RejectReportInput) {
  const report = await getReportById(id)

  if (report.status !== 'SUBMITTED') {
    throw ApiError.badRequest(`Only SUBMITTED reports can be rejected (current: ${report.status})`)
  }

  return prisma.report.update({
    where: { id },
    data: {
      status: 'REJECTED',
      // Store rejection reason in observations for the caregiver to see
      observations: report.observations
        ? `[REJECTED: ${reason}]\n${report.observations}`
        : `[REJECTED: ${reason}]`,
      reviewedById: adminUserId,
      reviewedAt: new Date(),
    },
    include: reportInclude,
  })
}

// ── Caregiver ─────────────────────────────────────────────────────────────────

export async function createReport(
  shiftId: number,
  caregiverId: number,
  data: CreateReportInput,
) {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: { report: { select: { id: true, status: true } } },
  })

  if (!shift) throw ApiError.notFound(`Shift #${shiftId} not found`)
  if (shift.caregiverId !== caregiverId) throw ApiError.forbidden('This shift is not assigned to you')
  if (shift.status === 'CANCELLED' || shift.status === 'NO_SHOW') {
    throw ApiError.badRequest(`Cannot report on a ${shift.status} shift`)
  }

  if (shift.report) {
    if (shift.report.status === 'APPROVED') {
      throw ApiError.conflict('This shift already has an approved report')
    }
    // Allow overwriting DRAFT or REJECTED reports
    await prisma.report.delete({ where: { id: shift.report.id } })
  }

  return prisma.report.create({
    data: {
      shiftId,
      caregiverId,
      patientId: shift.patientId,
      workedMinutes: data.workedMinutes,
      observations: data.observations,
      medication: data.medication,
      vitalSigns: data.vitalSigns,
      status: 'SUBMITTED',
    },
    include: reportInclude,
  })
}

export async function updateReport(id: number, caregiverId: number, data: UpdateReportInput) {
  const report = await getReportById(id)

  if (report.caregiverId !== caregiverId) throw ApiError.forbidden('This report does not belong to you')
  if (report.status !== 'DRAFT' && report.status !== 'REJECTED') {
    throw ApiError.badRequest(`Cannot edit a report with status ${report.status}`)
  }

  return prisma.report.update({
    where: { id },
    data: {
      ...(data.workedMinutes !== undefined && { workedMinutes: data.workedMinutes }),
      ...(data.observations !== undefined && { observations: data.observations }),
      ...(data.medication !== undefined && { medication: data.medication }),
      ...(data.vitalSigns !== undefined && { vitalSigns: data.vitalSigns }),
      // Editing a rejected report sets it back to DRAFT for re-review
      status: 'DRAFT',
    },
    include: reportInclude,
  })
}

export async function submitReport(id: number, caregiverId: number) {
  const report = await getReportById(id)

  if (report.caregiverId !== caregiverId) throw ApiError.forbidden('This report does not belong to you')
  if (report.status !== 'DRAFT') {
    throw ApiError.badRequest(`Only DRAFT reports can be submitted (current: ${report.status})`)
  }

  return prisma.report.update({
    where: { id },
    data: { status: 'SUBMITTED' },
    include: reportInclude,
  })
}

// ── Self-service (caregiver + patient) ────────────────────────────────────────

export async function listMyReports(caregiverId: number, filters: ListReportsQuery) {
  return prisma.report.findMany({
    where: { caregiverId, ...(filters.status && { status: filters.status }) },
    include: reportInclude,
    orderBy: { createdAt: 'desc' },
  })
}

export async function listPatientReports(patientId: number, _filters: ListReportsQuery) {
  // Family members (PATIENT role) may only see APPROVED reports — never drafts,
  // submitted-but-unreviewed, or rejected ones (which would leak internal notes).
  return prisma.report.findMany({
    where: { patientId, status: 'APPROVED' },
    include: reportInclude,
    orderBy: { createdAt: 'desc' },
  })
}
