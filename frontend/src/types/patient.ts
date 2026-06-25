export interface Patient {
  id: number
  firstName: string
  lastName: string
  documentId: string
  birthDate: string | null
  address: string | null
  phone: string | null
  emergencyContact: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  user: { id: number; email: string } | null
}

export interface CreatePatientDto {
  firstName: string
  lastName: string
  documentId: string
  birthDate?: string
  address?: string
  phone?: string
  emergencyContact?: string
  notes?: string
  email?: string
  password?: string
}

export interface UpdatePatientDto {
  firstName?: string
  lastName?: string
  birthDate?: string
  address?: string
  phone?: string
  emergencyContact?: string
  notes?: string
}
