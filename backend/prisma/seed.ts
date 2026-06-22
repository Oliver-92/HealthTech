import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Role, ShiftStatus, ReportStatus } from '../src/generated/prisma/client.js'
import bcrypt from 'bcrypt'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
const SALT_ROUNDS = 10

async function main() {
  console.log('🌱  Seeding database...')

  // ── Admin ────────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@healthtech.com' },
    update: {},
    create: {
      email: 'admin@healthtech.com',
      passwordHash: await bcrypt.hash('Admin1234!', SALT_ROUNDS),
      role: Role.ADMIN,
      isActive: true,
    },
  })
  console.log(`✅  Admin: ${adminUser.email}`)

  // ── Caregivers ────────────────────────────────────────────────────────────
  const caregiverUser1 = await prisma.user.upsert({
    where: { email: 'maria.lopez@healthtech.com' },
    update: {},
    create: {
      email: 'maria.lopez@healthtech.com',
      passwordHash: await bcrypt.hash('Caregiver1234!', SALT_ROUNDS),
      role: Role.CAREGIVER,
      isActive: true,
    },
  })

  const caregiver1 = await prisma.caregiver.upsert({
    where: { userId: caregiverUser1.id },
    update: {},
    create: {
      userId: caregiverUser1.id,
      firstName: 'María',
      lastName: 'López',
      documentId: '30111222',
      phone: '11-4444-5555',
      hourlyRate: 1500.0,
      hiredAt: new Date('2024-03-01'),
    },
  })

  const caregiverUser2 = await prisma.user.upsert({
    where: { email: 'carlos.perez@healthtech.com' },
    update: {},
    create: {
      email: 'carlos.perez@healthtech.com',
      passwordHash: await bcrypt.hash('Caregiver1234!', SALT_ROUNDS),
      role: Role.CAREGIVER,
      isActive: true,
    },
  })

  const caregiver2 = await prisma.caregiver.upsert({
    where: { userId: caregiverUser2.id },
    update: {},
    create: {
      userId: caregiverUser2.id,
      firstName: 'Carlos',
      lastName: 'Pérez',
      documentId: '28333444',
      phone: '11-5555-6666',
      hourlyRate: 1500.0,
      hiredAt: new Date('2024-06-15'),
    },
  })
  console.log(`✅  Caregivers: ${caregiver1.firstName} ${caregiver1.lastName}, ${caregiver2.firstName} ${caregiver2.lastName}`)

  // ── Patients ──────────────────────────────────────────────────────────────
  // Patient with family login
  const patientUser = await prisma.user.upsert({
    where: { email: 'familia.garcia@healthtech.com' },
    update: {},
    create: {
      email: 'familia.garcia@healthtech.com',
      passwordHash: await bcrypt.hash('Patient1234!', SALT_ROUNDS),
      role: Role.PATIENT,
      isActive: true,
    },
  })

  const patient1 = await prisma.patient.upsert({
    where: { documentId: '10555666' },
    update: {},
    create: {
      userId: patientUser.id,
      firstName: 'Roberto',
      lastName: 'García',
      documentId: '10555666',
      birthDate: new Date('1945-08-22'),
      address: 'Av. Corrientes 1234, CABA',
      phone: '11-2222-3333',
      emergencyContact: 'Ana García — 11-7777-8888',
      notes: 'Movilidad reducida. Requiere asistencia para desplazarse.',
    },
  })

  // Patient without login account
  const patient2 = await prisma.patient.upsert({
    where: { documentId: '12777888' },
    update: {},
    create: {
      firstName: 'Elena',
      lastName: 'Martínez',
      documentId: '12777888',
      birthDate: new Date('1938-04-10'),
      address: 'Av. Santa Fe 5678, CABA',
      phone: '11-9999-0000',
      emergencyContact: 'Pedro Martínez — 11-1111-2222',
      notes: 'Dieta sin sal. Medicación pautada a las 8:00 y 20:00.',
    },
  })
  console.log(`✅  Patients: ${patient1.firstName} ${patient1.lastName}, ${patient2.firstName} ${patient2.lastName}`)

  // ── Shifts ────────────────────────────────────────────────────────────────
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const shift1 = await prisma.shift.create({
    data: {
      patientId: patient1.id,
      caregiverId: caregiver1.id,
      date: yesterday,
      startTime: '08:00',
      endTime: '14:00',
      status: ShiftStatus.COMPLETED,
    },
  })

  const shift2 = await prisma.shift.create({
    data: {
      patientId: patient2.id,
      caregiverId: caregiver2.id,
      date: yesterday,
      startTime: '14:00',
      endTime: '20:00',
      status: ShiftStatus.COMPLETED,
    },
  })

  await prisma.shift.create({
    data: {
      patientId: patient1.id,
      caregiverId: caregiver1.id,
      date: today,
      startTime: '08:00',
      endTime: '14:00',
      status: ShiftStatus.SCHEDULED,
    },
  })

  await prisma.shift.create({
    data: {
      patientId: patient2.id,
      caregiverId: caregiver2.id,
      date: tomorrow,
      startTime: '14:00',
      endTime: '20:00',
      status: ShiftStatus.SCHEDULED,
    },
  })
  console.log('✅  Shifts: 4 created (2 completed, 2 scheduled)')

  // ── Reports ───────────────────────────────────────────────────────────────
  await prisma.report.create({
    data: {
      shiftId: shift1.id,
      caregiverId: caregiver1.id,
      patientId: patient1.id,
      workedMinutes: 360,
      observations: 'Paciente estable. Realizó ejercicios de movilidad sin inconvenientes.',
      medication: 'Enalapril 10mg — tomado a las 08:30. Aspirina 100mg — tomada a las 09:00.',
      vitalSigns: 'TA: 130/80 mmHg. FC: 72 lpm. Temperatura: 36.5°C.',
      status: ReportStatus.SUBMITTED,
    },
  })

  await prisma.report.create({
    data: {
      shiftId: shift2.id,
      caregiverId: caregiver2.id,
      patientId: patient2.id,
      workedMinutes: 360,
      observations: 'Paciente con ánimo positivo. Almorzó bien y descansó luego.',
      medication: 'Medicación tomada a las 20:00 según pauta.',
      vitalSigns: 'TA: 125/75 mmHg. FC: 68 lpm. Temperatura: 36.2°C.',
      status: ReportStatus.SUBMITTED,
    },
  })
  console.log('✅  Reports: 2 submitted (pending admin review)')

  console.log('\n🎉  Seed complete!\n')
  console.log('  Credentials:')
  console.log('  Admin     → admin@healthtech.com          / Admin1234!')
  console.log('  Caregiver → maria.lopez@healthtech.com    / Caregiver1234!')
  console.log('  Caregiver → carlos.perez@healthtech.com   / Caregiver1234!')
  console.log('  Patient   → familia.garcia@healthtech.com / Patient1234!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
