import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import type { CreatePayrollPeriodInput } from './billing.schema.js'

export async function listPayrollPeriods() {
  return prisma.payrollPeriod.findMany({ orderBy: { month: 'desc' } })
}

export async function getPayrollPeriodById(id: number) {
  const period = await prisma.payrollPeriod.findUnique({ where: { id } })
  if (!period) throw ApiError.notFound(`Payroll period #${id} not found`)
  return period
}

export async function createPayrollPeriod(data: CreatePayrollPeriodInput) {
  return prisma.payrollPeriod.create({
    data: {
      month: new Date(data.month),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  })
}

export async function closePayrollPeriod(id: number) {
  const period = await getPayrollPeriodById(id)
  if (!period.isOpen) throw ApiError.badRequest('Payroll period is already closed')

  return prisma.payrollPeriod.update({ where: { id }, data: { isOpen: false } })
}
