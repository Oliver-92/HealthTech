import { useNavigate } from 'react-router-dom'
import { Menu, LogOut } from 'lucide-react'
import { Badge, ThemeToggle, Button } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/store/uiStore'
import type { Role } from '@/types'

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Admin',
  CAREGIVER: 'Cuidador',
  PATIENT: 'Paciente',
}

const ROLE_VARIANT = {
  ADMIN: 'info',
  CAREGIVER: 'success',
  PATIENT: 'default',
} as const

export function Navbar() {
  const { user, role, logout } = useAuth()
  const { toggleSidebar } = useUiStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-surface border-b border-border shrink-0">
      {/* Hamburguesa (mobile) */}
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Abrir menú"
        className="md:hidden p-2 rounded-[--radius] text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Derecha */}
      <div className="flex items-center gap-3">
        {/* Info del usuario */}
        {user && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-muted">{user.email}</span>
            {role && (
              <Badge variant={ROLE_VARIANT[role]}>
                {ROLE_LABEL[role]}
              </Badge>
            )}
          </div>
        )}

        <ThemeToggle />

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          leftIcon={<LogOut size={16} />}
          aria-label="Cerrar sesión"
        >
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </div>
    </header>
  )
}
