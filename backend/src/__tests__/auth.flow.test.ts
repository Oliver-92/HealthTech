import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

// Mock de Prisma: estos tests ejercitan el flujo completo (route → controller →
// service) con la capa de datos simulada, sin tocar una base real.
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    user: { findUnique: vi.fn() },
    caregiver: { findUnique: vi.fn() },
    report: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  },
}))
vi.mock('../config/prisma.js', () => ({ prisma: mockPrisma }))

const { default: app } = await import('../app.js')
const { env } = await import('../config/env.js')

const PASSWORD = 'TestPass123'
const passwordHash = bcrypt.hashSync(PASSWORD, 4)
const activeUser = { id: 1, email: 'admin@test.com', role: 'ADMIN', isActive: true, passwordHash }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/auth/login', () => {
  it('returns a token + sets the refresh cookie on valid credentials', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(activeUser)
    const res = await request(app).post('/api/auth/login').send({ email: activeUser.email, password: PASSWORD })

    expect(res.status).toBe(200)
    expect(res.body.token).toEqual(expect.any(String))
    expect(res.body.user).toMatchObject({ id: 1, email: activeUser.email, role: 'ADMIN' })
    const cookie = res.headers['set-cookie']?.[0]
    expect(cookie).toMatch(/refreshToken=/)
    expect(cookie).toMatch(/HttpOnly/i)
  })

  it('rejects a wrong password with 401 and a generic message', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(activeUser)
    const res = await request(app).post('/api/auth/login').send({ email: activeUser.email, password: 'nope' })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Invalid credentials')
  })

  it('rejects an unknown email with the same generic 401 (no user enumeration)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    const res = await request(app).post('/api/auth/login').send({ email: 'ghost@test.com', password: PASSWORD })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Invalid credentials')
  })

  it('rejects an inactive user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...activeUser, isActive: false })
    const res = await request(app).post('/api/auth/login').send({ email: activeUser.email, password: PASSWORD })
    expect(res.status).toBe(401)
  })
})

describe('POST /api/auth/refresh', () => {
  const refreshCookie = (id = 1) =>
    `refreshToken=${jwt.sign({ sub: String(id) }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' })}`

  it('issues a new (rotated) token for a valid cookie', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(activeUser)
    const res = await request(app).post('/api/auth/refresh').set('Cookie', refreshCookie())

    expect(res.status).toBe(200)
    expect(res.body.token).toEqual(expect.any(String))
    expect(res.headers['set-cookie']?.[0]).toMatch(/refreshToken=/) // rotación
  })

  it('rejects refresh for a deactivated user (revocación)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...activeUser, isActive: false })
    const res = await request(app).post('/api/auth/refresh').set('Cookie', refreshCookie())
    expect(res.status).toBe(401)
  })

  it('rejects a tampered refresh cookie', async () => {
    const res = await request(app).post('/api/auth/refresh').set('Cookie', 'refreshToken=tampered.value')
    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/me', () => {
  it('returns the current user for a valid access token', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(activeUser)
    const accessToken = jwt.sign(
      { sub: '1', email: activeUser.email, role: 'ADMIN' },
      env.JWT_SECRET,
      { expiresIn: '5m' },
    )
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 1, email: activeUser.email, role: 'ADMIN' })
  })
})

describe('Ownership / IDOR — PUT /api/reports/:id', () => {
  it('forbids a caregiver from editing a report owned by another caregiver (403)', async () => {
    const caregiverToken = jwt.sign(
      { sub: '7', email: 'c@test.com', role: 'CAREGIVER' },
      env.JWT_SECRET,
      { expiresIn: '5m' },
    )
    // El usuario logueado es el cuidador con entidad id=5…
    mockPrisma.caregiver.findUnique.mockResolvedValue({ id: 5 })
    // …pero el informe pertenece al cuidador 99
    const otherReport = { id: 1, caregiverId: 99, status: 'DRAFT' }
    mockPrisma.report.findUnique.mockResolvedValue(otherReport)
    mockPrisma.report.findFirst.mockResolvedValue(otherReport)

    const res = await request(app)
      .put('/api/reports/1')
      .set('Authorization', `Bearer ${caregiverToken}`)
      .send({ workedMinutes: 120 })

    expect(res.status).toBe(403)
    expect(res.body.message).toMatch(/does not belong to you/i)
    expect(mockPrisma.report.update).not.toHaveBeenCalled()
  })
})
