import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { Login } from '@/pages/Login'
import { useAuthStore } from '@/store/authStore'
import { server } from '@/test/msw/server'

const BASE = import.meta.env.VITE_API_BASE_URL

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<div>Panel admin</div>} />
      </Routes>
      <ToastContainer />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null, role: null, isAuthenticated: false })
})

describe('Flujo de login', () => {
  it('ingresa con credenciales válidas y redirige al home del rol', async () => {
    server.use(
      http.post(`${BASE}/auth/login`, () =>
        HttpResponse.json({
          token: 'access-123',
          user: { id: 1, email: 'admin@healthtech.com', role: 'ADMIN' },
        }),
      ),
    )

    renderLogin()
    await userEvent.type(screen.getByLabelText('Email'), 'admin@healthtech.com')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'Admin1234!')
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Panel admin')).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBe('access-123')
    expect(useAuthStore.getState().role).toBe('ADMIN')
  })

  it('muestra el error en español y permanece en login con credenciales inválidas', async () => {
    server.use(
      http.post(`${BASE}/auth/login`, () =>
        HttpResponse.json({ message: 'Invalid credentials', errors: [] }, { status: 401 }),
      ),
    )

    renderLogin()
    await userEvent.type(screen.getByLabelText('Email'), 'admin@healthtech.com')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    // Traducido por el interceptor (U1)
    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
