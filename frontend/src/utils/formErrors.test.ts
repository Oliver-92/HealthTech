import { describe, it, expect, vi } from 'vitest'
import { applyApiFieldErrors } from './formErrors'
import { ApiError } from './apiError'

const FIELDS = ['email', 'documentId', 'firstName'] as const

describe('applyApiFieldErrors', () => {
  it('mapea un 409 de email al campo email', () => {
    const setField = vi.fn()
    const mapped = applyApiFieldErrors(
      new ApiError('A caregiver with this email already exists', 409),
      FIELDS,
      setField,
    )
    expect(mapped).toBe(true)
    expect(setField).toHaveBeenCalledWith('email', 'Ya existe un registro con este email')
  })

  it('mapea un 409 de documento al campo documentId', () => {
    const setField = vi.fn()
    const mapped = applyApiFieldErrors(
      new ApiError('A patient with this document ID already exists', 409),
      FIELDS,
      setField,
    )
    expect(mapped).toBe(true)
    expect(setField).toHaveBeenCalledWith('documentId', 'Ya existe un registro con este documento')
  })

  it('mapea el array de validación "campo: mensaje"', () => {
    const setField = vi.fn()
    const mapped = applyApiFieldErrors(
      new ApiError('Validation error', 400, ['email: Invalid input', 'firstName: First name is required']),
      FIELDS,
      setField,
    )
    expect(mapped).toBe(true)
    expect(setField).toHaveBeenCalledWith('email', 'Invalid input')
    expect(setField).toHaveBeenCalledWith('firstName', 'First name is required')
  })

  it('ignora errores que no son ApiError', () => {
    const setField = vi.fn()
    expect(applyApiFieldErrors(new Error('boom'), FIELDS, setField)).toBe(false)
    expect(setField).not.toHaveBeenCalled()
  })

  it('no mapea campos fuera de la lista conocida', () => {
    const setField = vi.fn()
    const mapped = applyApiFieldErrors(
      new ApiError('Validation error', 400, ['unknownField: nope']),
      FIELDS,
      setField,
    )
    expect(mapped).toBe(false)
    expect(setField).not.toHaveBeenCalled()
  })
})
