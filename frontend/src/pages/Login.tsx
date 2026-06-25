import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Button, Input, ThemeToggle } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import { handleError } from '@/utils/handleError'
import { loginSchema } from '@/validations/authSchema'
import { roleHome } from '@/constants/roles'
import { USE_MOCKS } from '@/services/config'
import type { LoginForm } from '@/validations/authSchema'

const EMPTY: LoginForm = { email: '', password: '' }

const MOCK_CREDENTIALS = [
  { role: 'ADMIN',     email: 'admin@healthtech.com',         password: 'Admin1234!'      },
  { role: 'CUIDADOR',  email: 'maria.lopez@healthtech.com',   password: 'Caregiver1234!'  },
  { role: 'PACIENTE',  email: 'familia.garcia@healthtech.com', password: 'Patient1234!'   },
]

export function Login() {
  const { isAuthenticated, role, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState<LoginForm>(EMPTY)
  const [errors, setErrors] = useState<Partial<LoginForm>>({})
  const [loading, setLoading] = useState(false)

  // Si ya está autenticado, redirigir al home del rol
  if (isAuthenticated && role) return <Navigate to={roleHome(role)} replace />

  const set = (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = loginSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<LoginForm> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginForm
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      const user = await login(result.data)
      const from = (location.state as { from?: Location })?.from?.pathname
      navigate(from ?? roleHome(user.role), { replace: true })
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (email: string, password: string) => {
    setForm({ email, password })
    setErrors({})
  }

  return (
    <div className="min-h-svh bg-background flex items-center justify-center p-4">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-6">
        {/* Logo / título */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-foreground">HealthTech</h1>
          <p className="text-sm text-muted">Ingresá a tu cuenta para continuar</p>
        </div>

        {/* Card del form */}
        <div className="bg-surface border border-border rounded-[--radius] shadow-sm p-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="tu@email.com"
              autoComplete="email"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              disabled={loading}
            />
            <Input
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              autoComplete="current-password"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              disabled={loading}
            />
            <Button type="submit" className="w-full" isLoading={loading}>
              Ingresar
            </Button>
          </form>
        </div>

        {/* Credenciales mock (solo en desarrollo) */}
        {USE_MOCKS && (
          <div className="bg-surface-2 border border-border rounded-[--radius] p-4 space-y-2">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">
              Credenciales de prueba
            </p>
            {MOCK_CREDENTIALS.map(({ role: r, email, password }) => (
              <button
                key={r}
                type="button"
                onClick={() => fillCredentials(email, password)}
                className="w-full text-left rounded-[--radius] px-3 py-2 text-xs hover:bg-border transition-colors"
              >
                <span className="font-medium text-foreground">{r}</span>
                <span className="text-muted ml-2">{email}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
