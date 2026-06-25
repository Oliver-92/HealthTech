import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import type { LoginCredentials } from '@/types'

export function useAuth() {
  const { user, role, isAuthenticated, login: setSession, logout: clear } = useAuthStore()

  const login = async (credentials: LoginCredentials) => {
    const res = await authService.login(credentials)
    setSession(res.token, res.user)
    return res.user
  }

  return { user, role, isAuthenticated, login, logout: clear }
}
