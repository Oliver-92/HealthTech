import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { ApiError } from '../utils/ApiError.js'
import { env } from '../config/env.js'

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      message: err.message,
      ...(err.errors.length > 0 && { errors: err.errors }),
    })
    return
  }

  if (err instanceof ZodError) {
    const errors = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
    res.status(400).json({ message: 'Validation error', errors })
    return
  }

  // Unexpected errors: log the stack in dev, hide details in prod
  console.error(err)
  res.status(500).json({
    message: 'Internal server error',
    ...(env.NODE_ENV === 'development' && { detail: String(err) }),
  })
}
