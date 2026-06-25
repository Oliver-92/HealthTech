import type { Role } from '@/types'

export const ROLES = {
  ADMIN: 'ADMIN',
  CAREGIVER: 'CAREGIVER',
  PATIENT: 'PATIENT',
} as const satisfies Record<string, Role>

const HOME: Record<Role, string> = {
  ADMIN: '/admin/dashboard',
  CAREGIVER: '/caregiver/dashboard',
  PATIENT: '/patient/dashboard',
}

export const roleHome = (role: Role): string => HOME[role]
