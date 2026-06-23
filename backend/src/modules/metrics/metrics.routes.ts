import { Router } from 'express'
import { auth } from '../../middlewares/auth.js'
import { requireRole } from '../../middlewares/requireRole.js'
import * as ctrl from './metrics.controller.js'

const router = Router()

router.get('/metrics', auth, requireRole('ADMIN'), ctrl.getMetrics)

export default router
