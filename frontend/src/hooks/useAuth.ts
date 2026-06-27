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

  const logout = () => {
    clear() // limpia la sesión local de inmediato (evita race con la redirección)
    // best-effort: invalida la cookie de refresh en el backend
    void authService.logout().catch(() => {})
  }

  return { user, role, isAuthenticated, login, logout }
}
