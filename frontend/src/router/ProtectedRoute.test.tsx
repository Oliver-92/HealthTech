import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuthStore } from '@/store/authStore'
import type { AuthUser } from '@/types'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route path="/admin/x" element={<div>contenido admin</div>} />
        </Route>
        <Route path="/login" element={<div>página de login</div>} />
        <Route path="/caregiver/dashboard" element={<div>home cuidador</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

const adminUser: AuthUser = { id: 1, email: 'admin@healthtech.com', role: 'ADMIN' }
const caregiverUser: AuthUser = { id: 2, email: 'c@healthtech.com', role: 'CAREGIVER' }

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, role: null, isAuthenticated: false })
  })

  it('redirige a /login cuando no hay sesión', () => {
    renderAt('/admin/x')
    expect(screen.getByText('página de login')).toBeInTheDocument()
    expect(screen.queryByText('contenido admin')).not.toBeInTheDocument()
  })

  it('renderiza el contenido cuando el rol coincide', () => {
    useAuthStore.setState({ user: adminUser, token: 't', role: 'ADMIN', isAuthenticated: true })
    renderAt('/admin/x')
    expect(screen.getByText('contenido admin')).toBeInTheDocument()
  })

  it('redirige al home del rol cuando el rol no coincide', () => {
    useAuthStore.setState({ user: caregiverUser, token: 't', role: 'CAREGIVER', isAuthenticated: true })
    renderAt('/admin/x')
    expect(screen.getByText('home cuidador')).toBeInTheDocument()
    expect(screen.queryByText('contenido admin')).not.toBeInTheDocument()
  })
})
