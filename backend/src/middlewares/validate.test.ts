import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import type { Request, Response } from 'express'
import { validate } from './validate.js'

const schema = z.object({ caregiverId: z.coerce.number().int().optional() })
const res = {} as Response

// Covers BUG-01 — coerced query must reach the handler via req.validatedQuery
describe('validate middleware', () => {
  it('exposes the coerced query on req.validatedQuery (number, not string)', () => {
    const req = { query: { caregiverId: '5' } } as unknown as Request
    const next = vi.fn()
    validate(schema, 'query')(req, res, next)
    expect(next).toHaveBeenCalledWith()
    expect(req.validatedQuery).toEqual({ caregiverId: 5 })
    expect(typeof (req.validatedQuery as { caregiverId: number }).caregiverId).toBe('number')
  })

  it('reassigns parsed data in place for body', () => {
    const req = { body: { caregiverId: '7' } } as unknown as Request
    const next = vi.fn()
    validate(schema, 'body')(req, res, next)
    expect(req.body).toEqual({ caregiverId: 7 })
  })

  it('forwards a validation error to next on invalid input', () => {
    const req = { query: { caregiverId: 'abc' } } as unknown as Request
    const next = vi.fn()
    validate(schema, 'query')(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(Error))
  })
})
