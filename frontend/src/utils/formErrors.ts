import { ApiError } from './apiError'

/**
 * Mapea un ApiError del backend a errores por campo del formulario.
 * Cubre dos formas que devuelve el backend:
 *   - 400 de validación: `errors: ["email: ...", "documentId: ..."]`
 *   - 409 de conflicto: el mensaje menciona "email" o "document".
 *
 * `setFieldError` recibe el nombre del campo y el mensaje en español.
 * Devuelve true si pudo mapear al menos un campo conocido.
 */
export function applyApiFieldErrors<F extends string>(
  err: unknown,
  fieldNames: readonly F[],
  setFieldError: (field: F, message: string) => void,
): boolean {
  if (!(err instanceof ApiError)) return false
  let mapped = false

  // 400 de validación: "campo: mensaje"
  for (const raw of err.errors) {
    const idx = raw.indexOf(':')
    if (idx === -1) continue
    const key = raw.slice(0, idx).trim() as F
    const message = raw.slice(idx + 1).trim()
    if (fieldNames.includes(key)) {
      setFieldError(key, message)
      mapped = true
    }
  }

  // 409 de conflicto: detectar el campo por el texto del mensaje
  if (err.status === 409) {
    const msg = err.message.toLowerCase()
    if (msg.includes('email') && fieldNames.includes('email' as F)) {
      setFieldError('email' as F, 'Ya existe un registro con este email')
      mapped = true
    } else if (msg.includes('document') && fieldNames.includes('documentId' as F)) {
      setFieldError('documentId' as F, 'Ya existe un registro con este documento')
      mapped = true
    }
  }

  return mapped
}
