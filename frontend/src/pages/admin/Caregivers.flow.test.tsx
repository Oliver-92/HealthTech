import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { Caregivers } from '@/pages/admin/Caregivers'
import { useAuthStore } from '@/store/authStore'
import { server } from '@/test/msw/server'

const BASE = import.meta.env.VITE_API_BASE_URL

const maria = {
  id: 1, firstName: 'María', lastName: 'López', documentId: '30111222', phone: null,
  hourlyRate: 1500, isActive: true, hiredAt: '2024-03-01T00:00:00.000Z',
  createdAt: '2024-03-01T00:00:00.000Z', user: { id: 2, email: 'maria.lopez@healthtech.com' },
}

function renderPage() {
  return render(
    <MemoryRouter>
      <Caregivers />
      <ToastContainer />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  // Sesión admin activa para las requests autenticadas
  useAuthStore.setState({
    user: { id: 1, email: 'admin@healthtech.com', role: 'ADMIN' },
    token: 'access-admin', role: 'ADMIN', isAuthenticated: true,
  })
})

describe('Flujo de cuidadores', () => {
  it('renderiza el listado que devuelve la API', async () => {
    server.use(http.get(`${BASE}/caregivers`, () => HttpResponse.json([maria])))

    renderPage()

    expect(await screen.findByText('María López')).toBeInTheDocument()
    expect(screen.getByText('maria.lopez@healthtech.com')).toBeInTheDocument()
  })

  it('crea un cuidador y la lista se refresca con el nuevo registro', async () => {
    let list = [maria]
    server.use(
      http.get(`${BASE}/caregivers`, () => HttpResponse.json(list)),
      http.post(`${BASE}/caregivers`, async ({ request }) => {
        const body = (await request.json()) as {
          firstName: string; lastName: string; documentId: string
          email: string; hourlyRate: number; hiredAt: string
        }
        const created = {
          id: 99, firstName: body.firstName, lastName: body.lastName, documentId: body.documentId,
          phone: null, hourlyRate: body.hourlyRate, isActive: true, hiredAt: body.hiredAt,
          createdAt: '2026-01-01T00:00:00.000Z', user: { id: 50, email: body.email },
        }
        list = [...list, created]
        return HttpResponse.json(created, { status: 201 })
      }),
    )

    renderPage()
    expect(await screen.findByText('María López')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo cuidador' }))
    await userEvent.type(screen.getByLabelText('Nombre'), 'Ana')
    await userEvent.type(screen.getByLabelText('Apellido'), 'Díaz')
    await userEvent.type(screen.getByLabelText('Email'), 'ana.diaz@healthtech.com')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'Secret123')
    await userEvent.type(screen.getByLabelText('N° de documento'), '40555666')
    await userEvent.type(screen.getByLabelText('Valor hora ($)'), '1700')
    fireEvent.change(screen.getByLabelText('Fecha de ingreso'), { target: { value: '2026-01-15' } })
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuidador' }))

    // La lista se refetcha tras el alta y aparece el nuevo cuidador
    expect(await screen.findByText('Ana Díaz')).toBeInTheDocument()
  })
})
