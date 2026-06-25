export interface Caregiver {
  id: number
  firstName: string
  lastName: string
  documentId: string
  phone: string | null
  hourlyRate: number
  isActive: boolean
  hiredAt: string
  createdAt: string
  user: { id: number; email: string }
}

export interface CreateCaregiverDto {
  email: string
  password: string
  firstName: string
  lastName: string
  documentId: string
  phone?: string
  hourlyRate: number
  hiredAt: string
}

export interface UpdateCaregiverDto {
  firstName?: string
  lastName?: string
  phone?: string
  hourlyRate?: number
  hiredAt?: string
}
