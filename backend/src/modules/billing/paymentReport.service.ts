import { Prisma, PaymentMethod } from '../../generated/prisma/client.js'
import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { stubGateway } from './payment.gateway.js'
import type { PayInput } from './billing.schema.js'

const paymentReportInclude = {
  caregiver: { select: { id: true, firstName: true, lastName: true } },
  payrollPeriod: { select: { id: true, month: true, startDate: true, endDate: true } },
  payments: {
    select: {
      id: true,
      paymentStatus: true,
      paymentMethod: true,
      transactionReference: true,
      completedAt: true,
    },
  },
} satisfies Prisma.PaymentReportInclude

// totalAmount is a Prisma Decimal; expose it as a plain number
export function serializePaymentReport<T extends { totalAmount: Prisma.Decimal }>(pr: T) {
  return { ...pr, totalAmount: pr.totalAmount.toNumber() }
}

// Generate one PaymentReport per caregiver from APPROVED reports whose shift falls
// inside the period. Recomputes GENERATED (unpaid) reports; never touches reports
// whose payment already started or completed.
export async function generatePaymentReports(payrollPeriodId: number) {
  const period = await prisma.payrollPeriod.findUnique({ where: { id: payrollPeriodId } })
  if (!period) throw ApiError.notFound(`Payroll period #${payrollPeriodId} not found`)
  if (!period.isOpen) throw ApiError.badRequest('Cannot generate reports for a closed period')

  return prisma.$transaction(async (tx) => {
    await tx.paymentReport.deleteMany({ where: { payrollPeriodId, status: 'GENERATED' } })

    // Caregivers whose payment already started/completed — keep them untouched
    const locked = await tx.paymentReport.findMany({
      where: { payrollPeriodId },
      select: { caregiverId: true },
    })
    const lockedIds = new Set(locked.map((l) => l.caregiverId))

    const grouped = await tx.report.groupBy({
      by: ['caregiverId'],
      where: {
        status: 'APPROVED',
        shift: { date: { gte: period.startDate, lte: period.endDate } },
      },
      _sum: { workedMinutes: true },
    })

    const pendingIds = grouped.map((g) => g.caregiverId).filter((id) => !lockedIds.has(id))
    const caregivers = await tx.caregiver.findMany({
      where: { id: { in: pendingIds } },
      select: { id: true, hourlyRate: true },
    })
    const rateById = new Map(caregivers.map((c) => [c.id, c.hourlyRate]))

    for (const g of grouped) {
      const mins = g._sum.workedMinutes ?? 0
      const rate = rateById.get(g.caregiverId)
      if (lockedIds.has(g.caregiverId) || mins <= 0 || !rate) continue

      await tx.paymentReport.create({
        data: {
          payrollPeriodId,
          caregiverId: g.caregiverId,
          totalTimeMins: mins,
          totalAmount: new Prisma.Decimal(mins).div(60).mul(rate),
        },
      })
    }

    const reports = await tx.paymentReport.findMany({
      where: { payrollPeriodId },
      include: paymentReportInclude,
      orderBy: { caregiverId: 'asc' },
    })
    return reports.map(serializePaymentReport)
  })
}

export async function listByPayroll(payrollPeriodId: number) {
  const reports = await prisma.paymentReport.findMany({
    where: { payrollPeriodId },
    include: paymentReportInclude,
    orderBy: { caregiverId: 'asc' },
  })
  return reports.map(serializePaymentReport)
}

export async function listByCaregiver(caregiverId: number) {
  const reports = await prisma.paymentReport.findMany({
    where: { caregiverId },
    include: paymentReportInclude,
    orderBy: { generatedAt: 'desc' },
  })
  return reports.map(serializePaymentReport)
}

export async function getPaymentReportById(id: number) {
  const report = await prisma.paymentReport.findUnique({
    where: { id },
    include: paymentReportInclude,
  })
  if (!report) throw ApiError.notFound(`Payment report #${id} not found`)
  return serializePaymentReport(report)
}

// Execute the payment for a liquidation through the gateway and transition states.
export async function payPaymentReport(id: number, { paymentMethod }: PayInput) {
  const report = await prisma.paymentReport.findUnique({ where: { id } })
  if (!report) throw ApiError.notFound(`Payment report #${id} not found`)
  if (report.status !== 'GENERATED' && report.status !== 'PAYMENT_FAILED') {
    throw ApiError.badRequest(`Cannot pay a report in status ${report.status}`)
  }

  // 1) Mark in-progress and create the initiated payment
  const payment = await prisma.$transaction(async (tx) => {
    await tx.paymentReport.update({ where: { id }, data: { status: 'PAYMENT_IN_PROGRESS' } })
    return tx.payment.create({
      data: {
        paymentReportId: id,
        paymentMethod: paymentMethod as PaymentMethod,
        paymentStatus: 'INITIATED',
        initiatedAt: new Date(),
      },
    })
  })

  // 2) Call the external gateway (stubbed) outside the transaction
  const result = await stubGateway.pay({
    amount: report.totalAmount.toNumber(),
    method: paymentMethod as PaymentMethod,
    reference: String(id),
  })

  // 3) Persist the outcome
  return prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: result.success ? 'COMPLETED' : 'FAILED',
        completedAt: result.success ? new Date() : null,
        transactionReference: result.transactionReference,
      },
    })
    const updated = await tx.paymentReport.update({
      where: { id },
      data: { status: result.success ? 'PAID' : 'PAYMENT_FAILED' },
      include: paymentReportInclude,
    })
    return serializePaymentReport(updated)
  })
}
