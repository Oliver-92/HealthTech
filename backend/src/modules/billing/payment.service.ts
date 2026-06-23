import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { getPaginationArgs } from '../../utils/pagination.js'
import type { ListPaymentsQuery } from './billing.schema.js'

const paymentInclude = {
  paymentReport: {
    select: { id: true, caregiverId: true, payrollPeriodId: true, status: true },
  },
} satisfies Prisma.PaymentInclude

export async function listPayments(filters: ListPaymentsQuery) {
  const where: Prisma.PaymentWhereInput = {}
  if (filters.status) where.paymentStatus = filters.status

  const orderBy: Prisma.PaymentOrderByWithRelationInput = { createdAt: 'desc' }
  const pag = getPaginationArgs(filters)

  if (!pag) {
    return prisma.payment.findMany({ where, include: paymentInclude, orderBy })
  }

  const [data, total] = await Promise.all([
    prisma.payment.findMany({ where, include: paymentInclude, orderBy, skip: pag.skip, take: pag.take }),
    prisma.payment.count({ where }),
  ])
  return { data, total, page: pag.page, pageSize: pag.pageSize }
}

export async function getPaymentById(id: number) {
  const payment = await prisma.payment.findUnique({ where: { id }, include: paymentInclude })
  if (!payment) throw ApiError.notFound(`Payment #${id} not found`)
  return payment
}
