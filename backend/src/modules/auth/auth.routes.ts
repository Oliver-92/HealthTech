import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { validate } from '../../middlewares/validate.js'
import { auth } from '../../middlewares/auth.js'
import { loginSchema } from './auth.schema.js'
import { loginHandler, getMeHandler } from './auth.controller.js'

const router = Router()

// Throttle login to mitigate brute-force / credential-stuffing attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later' },
})

router.post('/login', loginLimiter, validate(loginSchema), loginHandler)
router.get('/me', auth, getMeHandler)

export default router
