import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { roleHome } from '@/constants/roles'
import type { Role } from '@/types'

interface Props {
  roles?: Role[]
}

export function ProtectedRoute({ roles }: Props) {
  const { isAuthenticated, role } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />

  if (roles && role && !roles.includes(role))
    return <Navigate to={roleHome(role)} replace />

  return <Outlet />
}
