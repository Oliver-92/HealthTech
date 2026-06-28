import type {
  AuthUser,
  Caregiver,
  Patient,
  Shift,
  Report,
  PayrollPeriod,
  PaymentReport,
  Payment,
  AdminMetrics,
} from '@/types'

// ── Usuarios ────────────────────────────────────────────────────────────────

export const MOCK_USERS: Record<string, { user: AuthUser; password: string; token: string }> = {
  'admin@healthtech.com': {
    password: 'Admin1234!',
    token: 'mock-token-admin',
    user: { id: 1, email: 'admin@healthtech.com', role: 'ADMIN' },
  },
  'maria.lopez@healthtech.com': {
    password: 'Caregiver1234!',
    token: 'mock-token-caregiver',
    user: { id: 2, email: 'maria.lopez@healthtech.com', role: 'CAREGIVER' },
  },
  'familia.garcia@healthtech.com': {
    password: 'Patient1234!',
    token: 'mock-token-patient',
    user: { id: 5, email: 'familia.garcia@healthtech.com', role: 'PATIENT' },
  },
}

// ── Cuidadores ───────────────────────────────────────────────────────────────

export const MOCK_CAREGIVERS: Caregiver[] = [
  {
    id: 1,
    firstName: 'María',
    lastName: 'López',
    documentId: '30111222',
    phone: '11-4444-5555',
    hourlyRate: 1500,
    isActive: true,
    hiredAt: '2024-03-01T00:00:00.000Z',
    createdAt: '2024-03-01T00:00:00.000Z',
    user: { id: 2, email: 'maria.lopez@healthtech.com' },
  },
  {
    id: 2,
    firstName: 'Carlos',
    lastName: 'Méndez',
    documentId: '28333444',
    phone: '11-5555-6666',
    hourlyRate: 1400,
    isActive: true,
    hiredAt: '2024-05-15T00:00:00.000Z',
    createdAt: '2024-05-15T00:00:00.000Z',
    user: { id: 3, email: 'carlos.mendez@healthtech.com' },
  },
  {
    id: 3,
    firstName: 'Laura',
    lastName: 'Fernández',
    documentId: '32555666',
    phone: null,
    hourlyRate: 1600,
    isActive: false,
    hiredAt: '2023-11-01T00:00:00.000Z',
    createdAt: '2023-11-01T00:00:00.000Z',
    user: { id: 4, email: 'laura.fernandez@healthtech.com' },
  },
]

// ── Pacientes ────────────────────────────────────────────────────────────────

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 1,
    firstName: 'Roberto',
    lastName: 'García',
    documentId: '10555666',
    birthDate: '1945-08-22T00:00:00.000Z',
    address: 'Av. Corrientes 1234',
    phone: '11-2222-3333',
    emergencyContact: 'Ana García — 11-7777-8888',
    notes: 'Movilidad reducida.',
    isActive: true,
    createdAt: '2024-01-10T00:00:00.000Z',
    user: { id: 5, email: 'familia.garcia@healthtech.com' },
  },
  {
    id: 2,
    firstName: 'Elena',
    lastName: 'Martínez',
    documentId: '12777888',
    birthDate: '1938-04-10T00:00:00.000Z',
    address: 'Calle Salta 567',
    phone: '11-9999-0000',
    emergencyContact: null,
    notes: null,
    isActive: true,
    createdAt: '2024-02-20T00:00:00.000Z',
    user: null,
  },
]

// ── Guardias ─────────────────────────────────────────────────────────────────

export const MOCK_SHIFTS: Shift[] = [
  {
    id: 1,
    patientId: 1,
    caregiverId: 1,
    date: '2026-06-20T00:00:00.000Z',
    startTime: '08:00',
    endTime: '14:00',
    status: 'COMPLETED',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-20T00:00:00.000Z',
    patient: { id: 1, firstName: 'Roberto', lastName: 'García' },
    caregiver: { id: 1, firstName: 'María', lastName: 'López' },
    report: { id: 1, status: 'APPROVED' },
  },
  {
    id: 2,
    patientId: 1,
    caregiverId: 2,
    date: '2026-06-22T00:00:00.000Z',
    startTime: '14:00',
    endTime: '20:00',
    status: 'COMPLETED',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-22T00:00:00.000Z',
    patient: { id: 1, firstName: 'Roberto', lastName: 'García' },
    caregiver: { id: 2, firstName: 'Carlos', lastName: 'Méndez' },
    report: { id: 2, status: 'SUBMITTED' },
  },
  {
    id: 3,
    patientId: 2,
    caregiverId: 1,
    date: '2026-06-25T00:00:00.000Z',
    startTime: '08:00',
    endTime: '16:00',
    status: 'SCHEDULED',
    createdAt: '2026-06-10T00:00:00.000Z',
    updatedAt: '2026-06-10T00:00:00.000Z',
    patient: { id: 2, firstName: 'Elena', lastName: 'Martínez' },
    caregiver: { id: 1, firstName: 'María', lastName: 'López' },
    report: null,
  },
]

// ── Informes ─────────────────────────────────────────────────────────────────

export const MOCK_REPORTS: Report[] = [
  {
    id: 1,
    shiftId: 1,
    caregiverId: 1,
    patientId: 1,
    workedMinutes: 360,
    observations: 'Paciente estable, buen estado de ánimo.',
    medication: 'Enalapril 10mg',
    vitalSigns: 'TA 130/80, FC 72',
    status: 'APPROVED',
    rejectionReason: null,
    reviewedById: 1,
    reviewedAt: '2026-06-21T10:00:00.000Z',
    createdAt: '2026-06-20T15:00:00.000Z',
    shift: { id: 1, date: '2026-06-20T00:00:00.000Z', startTime: '08:00', endTime: '14:00', status: 'COMPLETED' },
    caregiver: { id: 1, firstName: 'María', lastName: 'López' },
    patient: { id: 1, firstName: 'Roberto', lastName: 'García' },
    reviewedBy: { id: 1, email: 'admin@healthtech.com' },
  },
  {
    id: 2,
    shiftId: 2,
    caregiverId: 2,
    patientId: 1,
    workedMinutes: 360,
    observations: 'Sin novedades.',
    medication: null,
    vitalSigns: null,
    status: 'SUBMITTED',
    rejectionReason: null,
    reviewedById: null,
    reviewedAt: null,
    createdAt: '2026-06-22T21:00:00.000Z',
    shift: { id: 2, date: '2026-06-22T00:00:00.000Z', startTime: '14:00', endTime: '20:00', status: 'COMPLETED' },
    caregiver: { id: 2, firstName: 'Carlos', lastName: 'Méndez' },
    patient: { id: 1, firstName: 'Roberto', lastName: 'García' },
    reviewedBy: null,
  },
]

// ── Facturación ──────────────────────────────────────────────────────────────

export const MOCK_PAYROLL_PERIODS: PayrollPeriod[] = [
  {
    id: 1,
    month: '2026-06-01T00:00:00.000Z',
    startDate: '2026-06-01T00:00:00.000Z',
    endDate: '2026-06-30T00:00:00.000Z',
    isOpen: true,
  },
]

export const MOCK_PAYMENT_REPORTS: PaymentReport[] = [
  {
    id: 1,
    payrollPeriodId: 1,
    caregiverId: 1,
    totalTimeMins: 720,
    totalAmount: 18000,
    status: 'GENERATED',
    generatedAt: '2026-06-25T00:00:00.000Z',
    caregiver: { id: 1, firstName: 'María', lastName: 'López' },
    payrollPeriod: {
      id: 1,
      month: '2026-06-01T00:00:00.000Z',
      startDate: '2026-06-01T00:00:00.000Z',
      endDate: '2026-06-30T00:00:00.000Z',
    },
    payments: [],
  },
]

// Pagos ejecutados en el demo (se completa al ejecutar pagos en facturación)
export const MOCK_PAYMENTS: Payment[] = []

// ── Métricas ─────────────────────────────────────────────────────────────────

export const MOCK_METRICS: AdminMetrics = {
  activeCaregivers: 2,
  activePatients: 2,
  monthlyHours: 24,
  pendingReports: 1,
  pendingPayments: 1,
  completedPayments: 0,
}
