import { api } from '../api'
import type { AuthUser, LoginCredentials, LoginResponse } from '@/types'

export const authServiceReal = {
  login: (credentials: LoginCredentials) =>
    api.post<LoginResponse>('/auth/login', credentials).then((r) => r.data),

  me: () =>
    api.get<AuthUser>('/auth/me').then((r) => r.data),
}
