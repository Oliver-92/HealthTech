import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/prisma.js'
import { env } from '../../config/env.js'
import { ApiError } from '../../utils/ApiError.js'
import type { LoginInput } from './auth.schema.js'

export async function login({ email, password }: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email } })

  // Use the same error message for both "not found" and "wrong password"
  // to avoid leaking which emails exist in the system
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Invalid credentials')
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash)
  if (!passwordValid) {
    throw ApiError.unauthorized('Invalid credentials')
  }

  const token = jwt.sign(
    { sub: String(user.id), email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  )

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  }
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, isActive: true, createdAt: true },
  })

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User not found or inactive')
  }

  return user
}
