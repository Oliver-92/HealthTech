import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types'

export function usePermissions() {
  const role = useAuthStore((s) => s.role)
  return {
    role,
    hasRole: (roles: Role[]) => !!role && roles.includes(role),
  }
}
