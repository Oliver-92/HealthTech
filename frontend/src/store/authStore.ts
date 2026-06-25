import { create } from 'zustand'
import type { AuthUser, Role } from '@/types'

interface AuthState {
  user: AuthUser | null
  token: string | null
  role: Role | null
  isAuthenticated: boolean
  login: (token: string, user: AuthUser) => void
  setUser: (user: AuthUser) => void
  logout: () => void
}

// Stub mínimo — se reemplaza en 2.5 con persist middleware
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  login: (token, user) => set({ token, user, role: user.role, isAuthenticated: true }),
  setUser: (user) => set({ user, role: user.role }),
  logout: () => set({ user: null, token: null, role: null, isAuthenticated: false }),
}))
