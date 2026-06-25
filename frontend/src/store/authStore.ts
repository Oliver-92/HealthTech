import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      login: (token, user) =>
        set({ token, user, role: user.role, isAuthenticated: true }),
      setUser: (user) =>
        set({ user, role: user.role }),
      logout: () =>
        set({ user: null, token: null, role: null, isAuthenticated: false }),
    }),
    {
      name: 'healthtech-auth',
      // Solo persiste token y user; role e isAuthenticated se recalculan al rehidratar
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && state?.user) {
          state.isAuthenticated = true
          state.role = state.user.role
        }
      },
    },
  ),
)
