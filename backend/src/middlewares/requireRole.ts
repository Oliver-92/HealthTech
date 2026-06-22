import { Request, Response, NextFunction } from 'express'
import { Role } from '../generated/prisma/client.js'
import { ApiError } from '../utils/ApiError.js'

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized()
    }
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(`Access restricted to: ${roles.join(', ')}`)
    }
    next()
  }
}
