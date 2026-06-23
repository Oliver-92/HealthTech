import { describe, it, expect } from 'vitest'
import { createShiftSchema } from './shifts.schema.js'

const base = { patientId: 1, caregiverId: 1, date: '2030-01-01' }

// Covers BIZ-03 — shifts may cross midnight; only equal times are rejected
describe('createShiftSchema', () => {
  it('accepts a normal daytime shift', () => {
    expect(createShiftSchema.safeParse({ ...base, startTime: '08:00', endTime: '14:00' }).success).toBe(
      true,
    )
  })

  it('accepts a night shift crossing midnight (22:00 → 06:00)', () => {
    expect(createShiftSchema.safeParse({ ...base, startTime: '22:00', endTime: '06:00' }).success).toBe(
      true,
    )
  })

  it('rejects equal start and end times', () => {
    expect(createShiftSchema.safeParse({ ...base, startTime: '08:00', endTime: '08:00' }).success).toBe(
      false,
    )
  })

  it('rejects malformed time', () => {
    expect(createShiftSchema.safeParse({ ...base, startTime: '8:00', endTime: '14:00' }).success).toBe(
      false,
    )
  })
})
