import { Request, Response } from 'express'
import * as authService from './auth.service.js'
import type { LoginInput } from './auth.schema.js'

export async function loginHandler(req: Request<object, object, LoginInput>, res: Response) {
  const result = await authService.login(req.body)
  res.json(result)
}

export async function getMeHandler(req: Request, res: Response) {
  const user = await authService.getMe(req.user!.id)
  res.json(user)
}
