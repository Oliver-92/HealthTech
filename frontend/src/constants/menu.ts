import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarDays,
  FileText,
  CreditCard,
  ClipboardList,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Role } from '@/types'

export interface MenuItem {
  label: string
  path: string
  icon: LucideIcon
  roles: Role[]
}

export const MENU_ITEMS: MenuItem[] = [
  // Admin
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN'],
  },
  {
    label: 'Cuidadores',
    path: '/admin/caregivers',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    label: 'Pacientes',
    path: '/admin/patients',
    icon: UserRound,
    roles: ['ADMIN'],
  },
  {
    label: 'Guardias',
    path: '/admin/shifts',
    icon: CalendarDays,
    roles: ['ADMIN'],
  },
  {
    label: 'Informes',
    path: '/admin/reports',
    icon: FileText,
    roles: ['ADMIN'],
  },
  {
    label: 'Facturación',
    path: '/admin/billing',
    icon: CreditCard,
    roles: ['ADMIN'],
  },
  // Caregiver
  {
    label: 'Dashboard',
    path: '/caregiver/dashboard',
    icon: LayoutDashboard,
    roles: ['CAREGIVER'],
  },
  {
    label: 'Mis guardias',
    path: '/caregiver/shifts',
    icon: CalendarDays,
    roles: ['CAREGIVER'],
  },
  {
    label: 'Mis informes',
    path: '/caregiver/reports',
    icon: ClipboardList,
    roles: ['CAREGIVER'],
  },
  // Patient
  {
    label: 'Mis informes',
    path: '/patient/reports',
    icon: FileText,
    roles: ['PATIENT'],
  },
]
