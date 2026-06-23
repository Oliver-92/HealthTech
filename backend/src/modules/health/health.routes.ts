import { Router } from 'express'
import { prisma } from '../../config/prisma.js'

const router = Router()

// Readiness check: also verifies the database is reachable
router.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', db: 'up', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: 'error', db: 'down', timestamp: new Date().toISOString() })
  }
})

export default router
