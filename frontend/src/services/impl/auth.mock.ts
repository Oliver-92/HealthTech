import { delay } from '../config'
import { MOCK_USERS } from '../mocks/data'
import type { AuthUser, LoginCredentials } from '@/types'
import { useAuthStore } from '@/store/authStore'

export const authServiceMock = {
  login: async (credentials: LoginCredentials) => {
    await delay()
    const entry = MOCK_USERS[credentials.email]
    if (!entry || entry.password !== credentials.password)
      throw new Error('Credenciales incorrectas')
    return { token: entry.token, user: entry.user }
  },

  me: async (): Promise<AuthUser> => {
    await delay()
    const token = useAuthStore.getState().token
    const entry = Object.values(MOCK_USERS).find((u) => u.token === token)
    if (!entry) throw new Error('No autenticado')
    return entry.user
  },

  // En modo mock no hay cookie: el refresh devuelve la sesión persistida (o falla)
  refresh: async (): Promise<{ token: string; user: AuthUser }> => {
    await delay()
    const token = useAuthStore.getState().token
    const entry = Object.values(MOCK_USERS).find((u) => u.token === token)
    if (!entry) throw new Error('No autenticado')
    return { token: entry.token, user: entry.user }
  },

  logout: async (): Promise<void> => {
    await delay(0)
  },
}
