import { Role } from '../generated/prisma/client.js'

// Augment Express Request with the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        email: string
        role: Role
      }
      // Validated & coerced query params. Express 5 makes req.query read-only,
      // so the `validate(schema, 'query')` middleware writes the parsed result here.
      validatedQuery?: unknown
    }
  }
}

export {}
