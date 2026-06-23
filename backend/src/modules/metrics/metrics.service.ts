import { prisma } from '../../config/prisma.js'

// Aggregated figures for the ADMIN dashboard. All counting/aggregation happens in
// the database; the frontend only renders the result.
export async function getAdminMetrics() {
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))

  const [activeCaregivers, activePatients, hoursAgg, pendingReports, pendingPayments, completedPayments] =
    await Promise.all([
      prisma.caregiver.count({ where: { isActive: true } }),
      prisma.patient.count({ where: { isActive: true } }),
      // Worked minutes for the current month (submitted or approved work)
      prisma.report.aggregate({
        _sum: { workedMinutes: true },
        where: {
          status: { in: ['SUBMITTED', 'APPROVED'] },
          shift: { date: { gte: monthStart, lte: monthEnd } },
        },
      }),
      prisma.report.count({ where: { status: 'SUBMITTED' } }),
      prisma.paymentReport.count({
        where: { status: { in: ['GENERATED', 'PAYMENT_IN_PROGRESS', 'PAYMENT_FAILED'] } },
      }),
      prisma.paymentReport.count({ where: { status: 'PAID' } }),
    ])

  const monthlyMinutes = hoursAgg._sum.workedMinutes ?? 0

  return {
    activeCaregivers,
    activePatients,
    monthlyHours: Math.round((monthlyMinutes / 60) * 100) / 100,
    pendingReports,
    pendingPayments,
    completedPayments,
  }
}
