import bcrypt from 'bcrypt'
import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { getPaginationArgs } from '../../utils/pagination.js'
import type {
  CreateCaregiverInput,
  UpdateCaregiverInput,
  ListCaregiversQuery,
} from './caregivers.schema.js'

const SALT_ROUNDS = 10

// Select used in all caregiver queries — never exposes passwordHash
const caregiverSelect = {
  id: true,
  firstName: true,
  lastName: true,
  documentId: true,
  phone: true,
  hourlyRate: true,
  isActive: true,
  hiredAt: true,
  createdAt: true,
  user: { select: { id: true, email: true } },
} satisfies Prisma.CaregiverSelect

// hourlyRate is a Prisma Decimal (serializes to a string); expose it as a plain number
function serializeCaregiver<T extends { hourlyRate: Prisma.Decimal }>(c: T) {
  return { ...c, hourlyRate: c.hourlyRate.toNumber() }
}

export async function listCaregivers({ q, isActive, page, pageSize }: ListCaregiversQuery) {
  const where: Prisma.CaregiverWhereInput = {}

  if (isActive !== undefined) {
    where.isActive = isActive === 'true'
  }

  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
      { documentId: { contains: q, mode: 'insensitive' } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
    ]
  }

  const orderBy: Prisma.CaregiverOrderByWithRelationInput[] = [
    { lastName: 'asc' },
    { firstName: 'asc' },
  ]
  const pag = getPaginationArgs({ page, pageSize })

  if (!pag) {
    const all = await prisma.caregiver.findMany({ where, select: caregiverSelect, orderBy })
    return all.map(serializeCaregiver)
  }

  const [rows, total] = await Promise.all([
    prisma.caregiver.findMany({
      where,
      select: caregiverSelect,
      orderBy,
      skip: pag.skip,
      take: pag.take,
    }),
    prisma.caregiver.count({ where }),
  ])
  return { data: rows.map(serializeCaregiver), total, page: pag.page, pageSize: pag.pageSize }
}

export async function getCaregiverById(id: number) {
  const caregiver = await prisma.caregiver.findUnique({
    where: { id },
    select: caregiverSelect,
  })

  if (!caregiver) throw ApiError.notFound(`Caregiver #${id} not found`)
  return serializeCaregiver(caregiver)
}

export async function createCaregiver(data: CreateCaregiverInput) {
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS)

  try {
    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: 'CAREGIVER',
          caregiver: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              documentId: data.documentId,
              phone: data.phone,
              hourlyRate: data.hourlyRate,
              hiredAt: new Date(data.hiredAt),
            },
          },
        },
        select: {
          id: true,
          email: true,
          caregiver: { select: caregiverSelect },
        },
      })

      return user.caregiver
    })
    return serializeCaregiver(created!)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const fields = (e.meta?.modelName as string) === 'User' ? 'email' : 'document ID'
      throw ApiError.conflict(`A caregiver with this ${fields} already exists`)
    }
    throw e
  }
}

export async function updateCaregiver(id: number, data: UpdateCaregiverInput) {
  await getCaregiverById(id)

  const caregiver = await prisma.caregiver.update({
    where: { id },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.hourlyRate && { hourlyRate: data.hourlyRate }),
      ...(data.hiredAt && { hiredAt: new Date(data.hiredAt) }),
    },
    select: caregiverSelect,
  })
  return serializeCaregiver(caregiver)
}

export async function deactivateCaregiver(id: number) {
  await getCaregiverById(id)

  const caregiver = await prisma.$transaction(async (tx) => {
    const updated = await tx.caregiver.update({
      where: { id },
      data: { isActive: false },
      select: { ...caregiverSelect, userId: true },
    })

    await tx.user.update({
      where: { id: updated.userId },
      data: { isActive: false },
    })

    return updated
  })
  return serializeCaregiver(caregiver)
}

// Resolve the Caregiver row id from an authenticated user's id (JWT sub).
// Used by self-service endpoints (/api/me/...) where the caregiverId is derived
// from the token, never from a client-supplied parameter.
export async function getCaregiverIdByUserId(userId: number): Promise<number> {
  const caregiver = await prisma.caregiver.findUnique({
    where: { userId },
    select: { id: true },
  })
  if (!caregiver) throw ApiError.notFound('Caregiver profile not found for this user')
  return caregiver.id
}
