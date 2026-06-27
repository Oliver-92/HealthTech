import { describe, it, expect } from 'vitest'
import { loginSchema } from './authSchema'

describe('loginSchema', () => {
  it('acepta email y contraseña válidos', () => {
    const r = loginSchema.safeParse({ email: 'admin@healthtech.com', password: 'Admin1234!' })
    expect(r.success).toBe(true)
  })

  it('rechaza email inválido', () => {
    const r = loginSchema.safeParse({ email: 'no-es-email', password: 'x' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].message).toBe('Email inválido')
  })

  it('rechaza contraseña vacía', () => {
    const r = loginSchema.safeParse({ email: 'admin@healthtech.com', password: '' })
    expect(r.success).toBe(false)
  })
})
