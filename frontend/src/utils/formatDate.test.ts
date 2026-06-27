import { describe, it, expect } from 'vitest'
import { formatDate, dateInput, formatTime } from './formatDate'

describe('formatDate', () => {
  it('formatea ISO como dd/mm/aaaa', () => {
    expect(formatDate('2024-03-01T12:00:00.000Z')).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })

  it('devuelve guion para null/undefined/vacío', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
  })
})

describe('dateInput', () => {
  it('recorta a YYYY-MM-DD', () => {
    expect(dateInput('2024-03-01T00:00:00.000Z')).toBe('2024-03-01')
  })

  it('devuelve cadena vacía para null', () => {
    expect(dateInput(null)).toBe('')
  })
})

describe('formatTime', () => {
  it('agrega el sufijo hs', () => {
    expect(formatTime('08:00')).toBe('08:00 hs')
  })

  it('devuelve guion sin valor', () => {
    expect(formatTime(null)).toBe('—')
  })
})
