import { Router } from 'express'
import { auth } from '../../middlewares/auth.js'
import { requireRole } from '../../middlewares/requireRole.js'
import { validate } from '../../middlewares/validate.js'
import { idParamSchema } from '../../utils/schemas.js'
import {
  createCaregiverSchema,
  updateCaregiverSchema,
  listCaregiversSchema,
} from './caregivers.schema.js'
import * as ctrl from './caregivers.controller.js'

const router = Router()

// All caregiver routes require authentication and ADMIN role
router.use(auth, requireRole('ADMIN'))

router.get('/', validate(listCaregiversSchema, 'query'), ctrl.list)
router.get('/:id', validate(idParamSchema, 'params'), ctrl.getById)
router.post('/', validate(createCaregiverSchema), ctrl.create)
router.put('/:id', validate(idParamSchema, 'params'), validate(updateCaregiverSchema), ctrl.update)
router.patch('/:id/deactivate', validate(idParamSchema, 'params'), ctrl.deactivate)

export default router
