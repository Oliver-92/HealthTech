import { api } from '../api'
import type { AuthUser, LoginCredentials, LoginResponse } from '@/types'

export const authServiceReal = {
  login: (credentials: LoginCredentials) =>
    api.post<LoginResponse>('/auth/login', credentials).then((r) => r.data),

  me: () =>
    api.get<AuthUser>('/auth/me').then((r) => r.data),

  // Renueva el access token usando la cookie httpOnly de refresh (rotación en el backend)
  refresh: () =>
    api.post<LoginResponse>('/auth/refresh').then((r) => r.data),

  // Limpia la cookie de refresh en el backend (best-effort)
  logout: () =>
    api.post('/auth/logout').then(() => undefined),
}
