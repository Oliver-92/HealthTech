import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  PrismaClient,
  Role,
  ShiftStatus,
  ReportStatus,
  PaymentReportStatus,
  PaymentMethod,
  PaymentStatus,
} from '../src/generated/prisma/client.js'
import bcrypt from 'bcrypt'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
const SALT_ROUNDS = 10
const HOURLY_RATE = 1500
const amountFor = (mins: number) => (mins / 60) * HOURLY_RATE

// ── Date helpers (UTC, aligned with @db.Date columns) ─────────────────────────
const now = new Date()
const utcDay = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d))
const today = utcDay(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
const yesterday = utcDay(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)
const tomorrow = utcDay(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
// Previous month, for a closed-ish payroll period with billable (approved) work
const lastMonthStart = utcDay(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)
const lastMonthEnd = utcDay(now.getUTCFullYear(), now.getUTCMonth(), 0)
const lmDay = (d: number) => utcDay(lastMonthStart.getUTCFullYear(), lastMonthStart.getUTCMonth(), d)

async function main() {
  console.log('🌱  Seeding database...')

  // Reset transactional data so the seed is re-runnable (respect FK order)
  await prisma.payment.deleteMany()
  await prisma.paymentReport.deleteMany()
  await prisma.payrollPeriod.deleteMany()
  await prisma.report.deleteMany()
  await prisma.shift.deleteMany()

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
      hourlyRate: HOURLY_RATE,
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
      hourlyRate: HOURLY_RATE,
      hiredAt: new Date('2024-06-15'),
    },
  })
  console.log(`✅  Caregivers: ${caregiver1.firstName} ${caregiver1.lastName}, ${caregiver2.firstName} ${caregiver2.lastName}`)

  // ── Patients ──────────────────────────────────────────────────────────────
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

  // ── Last month: completed shifts with APPROVED reports (billable) ──────────
  const SHIFT_MINUTES = 360 // 08:00–14:00
  async function completedShiftWithApprovedReport(
    date: Date,
    caregiverId: number,
    patientId: number,
  ) {
    const shift = await prisma.shift.create({
      data: { patientId, caregiverId, date, startTime: '08:00', endTime: '14:00', status: ShiftStatus.COMPLETED },
    })
    await prisma.report.create({
      data: {
        shiftId: shift.id,
        caregiverId,
        patientId,
        workedMinutes: SHIFT_MINUTES,
        observations: 'Paciente estable. Sin novedades.',
        medication: 'Medicación administrada según pauta.',
        vitalSigns: 'TA: 130/80 mmHg. FC: 72 lpm.',
        status: ReportStatus.APPROVED,
        reviewedById: adminUser.id,
        reviewedAt: new Date(),
      },
    })
  }

  // María: 2 approved shifts (720 min); Carlos: 1 approved shift (360 min)
  await completedShiftWithApprovedReport(lmDay(5), caregiver1.id, patient1.id)
  await completedShiftWithApprovedReport(lmDay(12), caregiver1.id, patient1.id)
  await completedShiftWithApprovedReport(lmDay(18), caregiver2.id, patient2.id)
  const mariaMinutes = SHIFT_MINUTES * 2
  const carlosMinutes = SHIFT_MINUTES
  console.log('✅  Last-month work: 3 completed shifts with APPROVED reports')

  // ── Recent: completed shifts with SUBMITTED reports (pending admin review) ──
  const shiftRecent1 = await prisma.shift.create({
    data: { patientId: patient1.id, caregiverId: caregiver1.id, date: yesterday, startTime: '08:00', endTime: '14:00', status: ShiftStatus.COMPLETED },
  })
  await prisma.report.create({
    data: {
      shiftId: shiftRecent1.id,
      caregiverId: caregiver1.id,
      patientId: patient1.id,
      workedMinutes: 360,
      observations: 'Paciente con ánimo positivo. Realizó ejercicios de movilidad.',
      medication: 'Enalapril 10mg a las 08:30.',
      vitalSigns: 'TA: 128/82 mmHg. FC: 70 lpm.',
      status: ReportStatus.SUBMITTED,
    },
  })

  const shiftRecent2 = await prisma.shift.create({
    data: { patientId: patient2.id, caregiverId: caregiver2.id, date: yesterday, startTime: '14:00', endTime: '20:00', status: ShiftStatus.COMPLETED },
  })
  await prisma.report.create({
    data: {
      shiftId: shiftRecent2.id,
      caregiverId: caregiver2.id,
      patientId: patient2.id,
      workedMinutes: 360,
      observations: 'Almorzó bien y descansó. Sin inconvenientes.',
      medication: 'Medicación tomada a las 20:00 según pauta.',
      vitalSigns: 'TA: 125/75 mmHg. FC: 68 lpm.',
      status: ReportStatus.SUBMITTED,
    },
  })
  console.log('✅  Recent work: 2 completed shifts with SUBMITTED reports (pending review)')

  // ── Upcoming scheduled shifts ──────────────────────────────────────────────
  await prisma.shift.create({
    data: { patientId: patient1.id, caregiverId: caregiver1.id, date: today, startTime: '08:00', endTime: '14:00', status: ShiftStatus.SCHEDULED },
  })
  await prisma.shift.create({
    data: { patientId: patient2.id, caregiverId: caregiver2.id, date: tomorrow, startTime: '14:00', endTime: '20:00', status: ShiftStatus.SCHEDULED },
  })
  console.log('✅  Upcoming: 2 scheduled shifts')

  // ── Billing: payroll period + liquidations + one completed payment ─────────
  const period = await prisma.payrollPeriod.create({
    data: { month: lastMonthStart, startDate: lastMonthStart, endDate: lastMonthEnd, isOpen: true },
  })

  // María's liquidation is already paid; Carlos's is generated and pending payment
  const mariaReport = await prisma.paymentReport.create({
    data: {
      payrollPeriodId: period.id,
      caregiverId: caregiver1.id,
      totalTimeMins: mariaMinutes,
      totalAmount: amountFor(mariaMinutes),
      status: PaymentReportStatus.PAID,
    },
  })
  await prisma.paymentReport.create({
    data: {
      payrollPeriodId: period.id,
      caregiverId: caregiver2.id,
      totalTimeMins: carlosMinutes,
      totalAmount: amountFor(carlosMinutes),
      status: PaymentReportStatus.GENERATED,
    },
  })

  await prisma.payment.create({
    data: {
      paymentReportId: mariaReport.id,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentStatus: PaymentStatus.COMPLETED,
      initiatedAt: new Date(),
      completedAt: new Date(),
      transactionReference: 'SEED-TRANSFER-0001',
    },
  })
  console.log(
    `✅  Billing: period ${period.id} — María $${amountFor(mariaMinutes)} (PAID), Carlos $${amountFor(carlosMinutes)} (pending)`,
  )

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
