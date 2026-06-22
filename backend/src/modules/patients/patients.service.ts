import bcrypt from 'bcrypt'
import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import type {
  CreatePatientInput,
  UpdatePatientInput,
  ListPatientsQuery,
} from './patients.schema.js'

const SALT_ROUNDS = 10

const patientSelect = {
  id: true,
  firstName: true,
  lastName: true,
  documentId: true,
  birthDate: true,
  address: true,
  phone: true,
  emergencyContact: true,
  notes: true,
  isActive: true,
  createdAt: true,
  user: { select: { id: true, email: true } },
} satisfies Prisma.PatientSelect

export async function listPatients({ q, isActive }: ListPatientsQuery) {
  const where: Prisma.PatientWhereInput = {}

  if (isActive !== undefined) {
    where.isActive = isActive === 'true'
  }

  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
      { documentId: { contains: q, mode: 'insensitive' } },
    ]
  }

  return prisma.patient.findMany({
    where,
    select: patientSelect,
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })
}

export async function getPatientById(id: number) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    select: patientSelect,
  })

  if (!patient) throw ApiError.notFound(`Patient #${id} not found`)
  return patient
}

export async function createPatient(data: CreatePatientInput) {
  try {
    if (data.email && data.password) {
      // Create patient with a family login account
      const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS)

      return await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: data.email!,
            passwordHash,
            role: 'PATIENT',
            patient: {
              create: {
                firstName: data.firstName,
                lastName: data.lastName,
                documentId: data.documentId,
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
                address: data.address,
                phone: data.phone,
                emergencyContact: data.emergencyContact,
                notes: data.notes,
              },
            },
          },
          select: { patient: { select: patientSelect } },
        })

        return user.patient
      })
    }

    // Create patient without a login account
    return prisma.patient.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        documentId: data.documentId,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        address: data.address,
        phone: data.phone,
        emergencyContact: data.emergencyContact,
        notes: data.notes,
      },
      select: patientSelect,
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const isEmailConflict = (e.meta?.modelName as string) === 'User'
      throw ApiError.conflict(
        isEmailConflict
          ? 'A user with this email already exists'
          : 'A patient with this document ID already exists',
      )
    }
    throw e
  }
}

export async function updatePatient(id: number, data: UpdatePatientInput) {
  await getPatientById(id)

  return prisma.patient.update({
    where: { id },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.birthDate !== undefined && {
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
      }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.emergencyContact !== undefined && { emergencyContact: data.emergencyContact }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    select: patientSelect,
  })
}

export async function deactivatePatient(id: number) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    select: { id: true, isActive: true, userId: true },
  })

  if (!patient) throw ApiError.notFound(`Patient #${id} not found`)

  return prisma.$transaction(async (tx) => {
    const updated = await tx.patient.update({
      where: { id },
      data: { isActive: false },
      select: patientSelect,
    })

    // Deactivate linked login account if it exists
    if (patient.userId) {
      await tx.user.update({
        where: { id: patient.userId },
        data: { isActive: false },
      })
    }

    return updated
  })
}
