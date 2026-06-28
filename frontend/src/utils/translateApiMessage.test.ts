import { describe, it, expect } from 'vitest'
import { translateApiMessage } from './translateApiMessage'

describe('translateApiMessage', () => {
  it('traduce mensajes estáticos conocidos', () => {
    expect(translateApiMessage('Invalid credentials')).toBe('Credenciales inválidas')
    expect(translateApiMessage('Patient is inactive')).toBe('El paciente está inactivo')
    expect(translateApiMessage('This report does not belong to you')).toBe('Este informe no te pertenece')
  })

  it('traduce los conflictos 409 de duplicado', () => {
    expect(translateApiMessage('A caregiver with this email already exists')).toBe('Ya existe un cuidador con este email')
    expect(translateApiMessage('A caregiver with this document ID already exists')).toBe('Ya existe un cuidador con este documento')
    expect(translateApiMessage('A patient with this document ID already exists')).toBe('Ya existe un paciente con este documento')
  })

  it('traduce mensajes con estado dinámico', () => {
    expect(translateApiMessage('Cannot edit a report with status APPROVED')).toBe('No se puede editar un informe en estado aprobado')
    expect(translateApiMessage('Only SUBMITTED reports can be approved (current: DRAFT)')).toBe('Solo se pueden aprobar informes enviados (actual: borrador)')
  })

  it('traduce el solapamiento de guardias conservando el detalle', () => {
    const out = translateApiMessage('Caregiver already has a shift overlapping this time (2026-06-20 08:00–14:00)')
    expect(out).toBe('El cuidador ya tiene una guardia que se solapa con este horario (2026-06-20 08:00–14:00)')
  })

  it('traduce los not-found con género correcto', () => {
    expect(translateApiMessage('Shift #3 not found')).toBe('Guardia no encontrada')
    expect(translateApiMessage('Caregiver #1 not found')).toBe('Cuidador no encontrado')
  })

  it('deja intactos los mensajes desconocidos y vacíos', () => {
    expect(translateApiMessage('Some unexpected message')).toBe('Some unexpected message')
    expect(translateApiMessage(undefined)).toBeUndefined()
  })
})
