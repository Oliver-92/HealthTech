import { describe, it, expect } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../app.js'
import { env } from '../config/env.js'

// Tokens de prueba firmados con el secret real. Todas las requests de este archivo
// ejercitan caminos que cortocircuitan ANTES de tocar la base (auth → requireRole →
// validate), por lo que no necesitan DB ni mocks.
const tokenFor = (role: 'ADMIN' | 'CAREGIVER' | 'PATIENT', id = 1) =>
  jwt.sign({ sub: String(id), email: `${role.toLowerCase()}@test.com`, role }, env.JWT_SECRET, {
    expiresIn: '5m',
  })

const adminToken = tokenFor('ADMIN')
const caregiverToken = tokenFor('CAREGIVER')
const patientToken = tokenFor('PATIENT')

const bearer = (t: string) => ({ Authorization: `Bearer ${t}` })

describe('Auth middleware', () => {
  it('rejects a request without Authorization header (401)', async () => {
    const res = await request(app).get('/api/admin/metrics')
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ message: expect.any(String), errors: expect.any(Array) })
  })

  it('rejects a malformed Authorization header (401)', async () => {
    const res = await request(app).get('/api/admin/metrics').set('Authorization', 'NotBearer xyz')
    expect(res.status).toBe(401)
  })

  it('rejects an invalid/garbage token (401)', async () => {
    const res = await request(app).get('/api/admin/metrics').set(bearer('not-a-real-jwt'))
    expect(res.status).toBe(401)
  })

  it('rejects a token signed with the wrong secret (401)', async () => {
    const forged = jwt.sign({ sub: '1', email: 'x@test.com', role: 'ADMIN' }, 'wrong-secret-xxxxxxxxxxxx')
    const res = await request(app).get('/api/admin/metrics').set(bearer(forged))
    expect(res.status).toBe(401)
  })
})

describe('Role gating (requireRole)', () => {
  it('CAREGIVER cannot reach an ADMIN route (403)', async () => {
    const res = await request(app).get('/api/admin/metrics').set(bearer(caregiverToken))
    expect(res.status).toBe(403)
    expect(res.body.message).toMatch(/ADMIN/)
  })

  it('PATIENT cannot reach an ADMIN route (403)', async () => {
    const res = await request(app).get('/api/caregivers').set(bearer(patientToken))
    expect(res.status).toBe(403)
  })

  it('ADMIN cannot reach a CAREGIVER-only route (403)', async () => {
    const res = await request(app).get('/api/me/shifts').set(bearer(adminToken))
    expect(res.status).toBe(403)
  })

  it('PATIENT cannot update a report (CAREGIVER-only) (403)', async () => {
    const res = await request(app).put('/api/reports/1').set(bearer(patientToken)).send({ workedMinutes: 10 })
    expect(res.status).toBe(403)
  })

  it('ADMIN cannot use the self-service reports route (CAREGIVER/PATIENT) (403)', async () => {
    const res = await request(app).get('/api/me/reports').set(bearer(adminToken))
    expect(res.status).toBe(403)
  })
})

describe('Auth routes (no DB needed)', () => {
  it('login with an invalid body returns 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Validation error')
  })

  it('refresh without a cookie returns 401', async () => {
    const res = await request(app).post('/api/auth/refresh')
    expect(res.status).toBe(401)
  })

  it('logout clears the cookie and returns 204', async () => {
    const res = await request(app).post('/api/auth/logout')
    expect(res.status).toBe(204)
    expect(res.headers['set-cookie']?.[0]).toMatch(/refreshToken=/)
  })

  it('/auth/me without a token returns 401', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })
})

describe('Unknown routes', () => {
  it('returns 404 with the standard error shape', async () => {
    const res = await request(app).get('/api/this-does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ message: 'Route not found' })
  })
})
