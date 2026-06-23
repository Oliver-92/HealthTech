import { Request, Response } from 'express'
import * as service from './metrics.service.js'

export async function getMetrics(_req: Request, res: Response) {
  res.json(await service.getAdminMetrics())
}
