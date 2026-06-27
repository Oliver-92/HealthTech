import { describe, it, expect } from 'vitest'
import { formatMoney, formatMinutes } from './money'

describe('formatMoney', () => {
  it('formatea ARS con separador de miles y 2 decimales', () => {
    // Normalizamos espacios (puede haber NBSP entre símbolo y número según ICU)
    expect(formatMoney(1500).replace(/\s/g, '')).toBe('$1.500,00')
  })

  it('formatea el cero', () => {
    expect(formatMoney(0).replace(/\s/g, '')).toBe('$0,00')
  })
})

describe('formatMinutes', () => {
  it('solo minutos cuando es menor a una hora', () => {
    expect(formatMinutes(45)).toBe('45m')
  })

  it('solo horas cuando es múltiplo exacto', () => {
    expect(formatMinutes(60)).toBe('1h')
  })

  it('horas y minutos combinados', () => {
    expect(formatMinutes(90)).toBe('1h 30m')
    expect(formatMinutes(125)).toBe('2h 5m')
  })

  it('cero minutos', () => {
    expect(formatMinutes(0)).toBe('0m')
  })
})
