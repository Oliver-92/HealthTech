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
    }
  }
}

export {}
