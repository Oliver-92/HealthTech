import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import { Role } from '../generated/prisma/client.js'

interface JwtPayload {
  sub: string
  email: string
  role: Role
}

export function auth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed Authorization header')
  }

  const token = header.slice(7)

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.user = {
      id: Number(payload.sub),
      email: payload.email,
      role: payload.role,
    }
    next()
  } catch {
    throw ApiError.unauthorized('Invalid or expired token')
  }
}
