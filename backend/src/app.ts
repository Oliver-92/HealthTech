import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { errorHandler } from './middlewares/errorHandler.js'
import healthRouter from './modules/health/health.routes.js'
import authRouter from './modules/auth/auth.routes.js'
import caregiversRouter from './modules/caregivers/caregivers.routes.js'
import patientsRouter from './modules/patients/patients.routes.js'

const app = express()

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
)
app.use(express.json())

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/caregivers', caregiversRouter)
app.use('/api/patients', patientsRouter)

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// ── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler)

export default app
