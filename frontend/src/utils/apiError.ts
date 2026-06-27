/**
 * Error normalizado de la capa de API. Extiende Error para seguir funcionando con
 * `handleError` (que muestra `.message`), pero agrega `status` y el array `errors`
 * de validación del backend para que los formularios puedan mapear errores por campo.
 */
export class ApiError extends Error {
  readonly status: number
  readonly errors: string[]

  constructor(message: string, status: number, errors: string[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}
