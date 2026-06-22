import { Router } from 'express'
import { validate } from '../../middlewares/validate.js'
import { auth } from '../../middlewares/auth.js'
import { loginSchema } from './auth.schema.js'
import { loginHandler, getMeHandler } from './auth.controller.js'

const router = Router()

router.post('/login', validate(loginSchema), loginHandler)
router.get('/me', auth, getMeHandler)

export default router
