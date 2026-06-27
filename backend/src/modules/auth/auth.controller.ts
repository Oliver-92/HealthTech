import { Request, Response } from 'express'
import * as authService from './auth.service.js'
import { env } from '../../config/env.js'
import type { LoginInput } from './auth.schema.js'

// ── Refresh cookie ──────────────────────────────────────────────────────────────
// httpOnly (no accesible a JS → mitiga XSS), Secure en prod, SameSite=Lax y acotada
// al prefijo /api/auth para no viajar en el resto de las requests.
const REFRESH_COOKIE = 'refreshToken'
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // alineado con JWT_REFRESH_EXPIRES_IN

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/auth',
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, { ...refreshCookieOptions, maxAge: REFRESH_MAX_AGE_MS })
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions)
}

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function loginHandler(req: Request<object, object, LoginInput>, res: Response) {
  const { token, refreshToken, user } = await authService.login(req.body)
  setRefreshCookie(res, refreshToken)
  res.json({ token, user })
}

export async function refreshHandler(req: Request, res: Response) {
  const { token, refreshToken, user } = await authService.refreshSession(
    req.cookies?.[REFRESH_COOKIE],
  )
  // Rotación: cada refresh emite (y reemplaza) el refresh token
  setRefreshCookie(res, refreshToken)
  res.json({ token, user })
}

export function logoutHandler(_req: Request, res: Response) {
  clearRefreshCookie(res)
  res.status(204).end()
}

export async function getMeHandler(req: Request, res: Response) {
  const user = await authService.getMe(req.user!.id)
  res.json(user)
}
