import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { errorHandler } from './middlewares/errorHandler.js'
import healthRouter from './modules/health/health.routes.js'
import authRouter from './modules/auth/auth.routes.js'
import caregiversRouter from './modules/caregivers/caregivers.routes.js'
import patientsRouter from './modules/patients/patients.routes.js'
import { adminRouter as shiftsRouter, meRouter as meShiftsRouter } from './modules/shifts/shifts.routes.js'
import {
  shiftReportRouter,
  reportsRouter,
  meReportsRouter,
} from './modules/reports/reports.routes.js'

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
// shiftReportRouter first: shiftsRouter uses router.use(requireRole('ADMIN')) which
// intercepts ALL paths before route-level auth on shiftReportRouter can run
app.use('/api/shifts', shiftReportRouter)
app.use('/api/shifts', shiftsRouter)
app.use('/api/me/shifts', meShiftsRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/me/reports', meReportsRouter)

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// ── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler)

export default app
