import type { Role } from '@/types'

export const ROLES = {
  ADMIN: 'ADMIN',
  CAREGIVER: 'CAREGIVER',
  PATIENT: 'PATIENT',
} as const satisfies Record<string, Role>
