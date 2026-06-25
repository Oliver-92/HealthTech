export type Role = 'ADMIN' | 'CAREGIVER' | 'PATIENT'

export interface AuthUser {
  id: number
  email: string
  role: Role
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}
