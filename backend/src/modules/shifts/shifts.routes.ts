import { Router } from 'express'
import { auth } from '../../middlewares/auth.js'
import { requireRole } from '../../middlewares/requireRole.js'
import { validate } from '../../middlewares/validate.js'
import { idParamSchema } from '../../utils/schemas.js'
import {
  createShiftSchema,
  updateShiftSchema,
  updateShiftStatusSchema,
  listShiftsSchema,
  listMyShiftsSchema,
} from './shifts.schema.js'
import * as ctrl from './shifts.controller.js'

// ── Admin routes (/api/shifts) ────────────────────────────────────────────────
export const adminRouter = Router()
adminRouter.use(auth, requireRole('ADMIN'))

adminRouter.get('/', validate(listShiftsSchema, 'query'), ctrl.list)
adminRouter.get('/:id', validate(idParamSchema, 'params'), ctrl.getById)
adminRouter.post('/', validate(createShiftSchema), ctrl.create)
adminRouter.put('/:id', validate(idParamSchema, 'params'), validate(updateShiftSchema), ctrl.update)
adminRouter.patch('/:id/status', validate(idParamSchema, 'params'), validate(updateShiftStatusSchema), ctrl.updateStatus)
adminRouter.delete('/:id', validate(idParamSchema, 'params'), ctrl.remove)

// ── Caregiver self-service (/api/me/shifts) ────────────────────────────────────
export const meRouter = Router()
meRouter.use(auth, requireRole('CAREGIVER'))

meRouter.get('/', validate(listMyShiftsSchema, 'query'), ctrl.listMine)
