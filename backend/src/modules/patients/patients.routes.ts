import { Router } from 'express'
import { auth } from '../../middlewares/auth.js'
import { requireRole } from '../../middlewares/requireRole.js'
import { validate } from '../../middlewares/validate.js'
import { idParamSchema } from '../../utils/schemas.js'
import {
  createPatientSchema,
  updatePatientSchema,
  listPatientsSchema,
} from './patients.schema.js'
import * as ctrl from './patients.controller.js'

const router = Router()

// All patient routes require authentication and ADMIN role
router.use(auth, requireRole('ADMIN'))

router.get('/', validate(listPatientsSchema, 'query'), ctrl.list)
router.get('/:id', validate(idParamSchema, 'params'), ctrl.getById)
router.post('/', validate(createPatientSchema), ctrl.create)
router.put('/:id', validate(idParamSchema, 'params'), validate(updatePatientSchema), ctrl.update)
router.patch('/:id/deactivate', validate(idParamSchema, 'params'), ctrl.deactivate)

export default router
