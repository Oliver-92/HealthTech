import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/prisma.js'
import { env } from '../../config/env.js'
import { ApiError } from '../../utils/ApiError.js'
import type { Role } from '../../generated/prisma/client.js'
import type { LoginInput } from './auth.schema.js'

interface TokenUser {
  id: number
  email: string
  role: Role
}

// ── Token helpers ───────────────────────────────────────────────────────────────

function signAccessToken(user: TokenUser): string {
  return jwt.sign(
    { sub: String(user.id), email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  )
}

function signRefreshToken(user: TokenUser): string {
  // Minimal payload: solo el subject. El refresh re-consulta al usuario en cada uso.
  return jwt.sign({ sub: String(user.id) }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

const publicUser = (u: TokenUser) => ({ id: u.id, email: u.email, role: u.role })

// ── Casos de uso ────────────────────────────────────────────────────────────────

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

  return {
    token: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    user: publicUser(user),
  }
}

/**
 * Valida el refresh token, re-consulta al usuario (para que una cuenta desactivada
 * no pueda renovar la sesión) y emite un nuevo par de tokens (rotación).
 */
export async function refreshSession(refreshToken: string | undefined) {
  if (!refreshToken) throw ApiError.unauthorized('Missing refresh token')

  let payload: { sub: string }
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string }
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token')
  }

  const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } })
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User not found or inactive')
  }

  return {
    token: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    user: publicUser(user),
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
