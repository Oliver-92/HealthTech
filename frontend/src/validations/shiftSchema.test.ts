import { describe, it, expect } from 'vitest'
import { createShiftSchema, updateShiftSchema } from './shiftSchema'

const valid = {
  patientId: '1',
  caregiverId: '2',
  date: '2024-03-01',
  startTime: '08:00',
  endTime: '16:00',
}

describe('createShiftSchema', () => {
  it('acepta una guardia válida y coacciona los ids a número', () => {
    const r = createShiftSchema.safeParse(valid)
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.patientId).toBe(1)
      expect(r.data.caregiverId).toBe(2)
    }
  })

  it('acepta turno nocturno (cruza medianoche, horas distintas)', () => {
    const r = createShiftSchema.safeParse({ ...valid, startTime: '22:00', endTime: '06:00' })
    expect(r.success).toBe(true)
  })

  it('rechaza cuando inicio y fin son iguales', () => {
    const r = createShiftSchema.safeParse({ ...valid, startTime: '08:00', endTime: '08:00' })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues[0].message).toBe('Inicio y fin deben diferir')
      expect(r.error.issues[0].path).toEqual(['endTime'])
    }
  })

  it('rechaza formato de hora inválido', () => {
    const r = createShiftSchema.safeParse({ ...valid, startTime: '8am' })
    expect(r.success).toBe(false)
  })
})

describe('updateShiftSchema', () => {
  it('permite campos parciales', () => {
    const r = updateShiftSchema.safeParse({ startTime: '09:00' })
    expect(r.success).toBe(true)
  })
})
