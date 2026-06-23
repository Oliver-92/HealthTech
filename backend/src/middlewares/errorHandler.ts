import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { ApiError } from '../utils/ApiError.js'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Response shape is always { message, errors } for a consistent client contract
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ message: err.message, errors: err.errors })
    return
  }

  if (err instanceof ZodError) {
    const errors = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
    res.status(400).json({ message: 'Validation error', errors })
    return
  }

  // Unexpected errors: log full detail, never leak it to the client in prod
  logger.error({ err }, 'Unhandled error')
  res.status(500).json({
    message: 'Internal server error',
    errors: [],
    ...(env.NODE_ENV === 'development' && { detail: String(err) }),
  })
}
