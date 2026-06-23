import { Router } from 'express'
import { auth } from '../../middlewares/auth.js'
import { requireRole } from '../../middlewares/requireRole.js'
import { validate } from '../../middlewares/validate.js'
import { idParamSchema } from '../../utils/schemas.js'
import {
  createPayrollPeriodSchema,
  paySchema,
  listPaymentsSchema,
  payrollPeriodParamSchema,
  caregiverParamSchema,
} from './billing.schema.js'
import * as ctrl from './billing.controller.js'

const router = Router()

// All billing routes are ADMIN-only — financial logic lives entirely in the backend
router.use(auth, requireRole('ADMIN'))

// ── Payroll periods ────────────────────────────────────────────────────────────
router.get('/payroll-periods', ctrl.listPeriods)
router.post('/payroll-periods', validate(createPayrollPeriodSchema), ctrl.createPeriod)
router.get('/payroll-periods/:id', validate(idParamSchema, 'params'), ctrl.getPeriod)
router.patch('/payroll-periods/:id/close', validate(idParamSchema, 'params'), ctrl.closePeriod)
router.post(
  '/payroll-periods/:id/generate-reports',
  validate(idParamSchema, 'params'),
  ctrl.generateReports,
)

// ── Payment reports (specific paths before the :id catch-all) ───────────────────
router.get(
  '/payment-reports/payroll/:payrollPeriodId',
  validate(payrollPeriodParamSchema, 'params'),
  ctrl.listReportsByPayroll,
)
router.get(
  '/payment-reports/caregiver/:caregiverId',
  validate(caregiverParamSchema, 'params'),
  ctrl.listReportsByCaregiver,
)
router.get('/payment-reports/:id', validate(idParamSchema, 'params'), ctrl.getReport)
router.post(
  '/payment-reports/:id/pay',
  validate(idParamSchema, 'params'),
  validate(paySchema),
  ctrl.pay,
)

// ── Payments ─────────────────────────────────────────────────────────────────
router.get('/payments', validate(listPaymentsSchema, 'query'), ctrl.listPayments)
router.get('/payments/:id', validate(idParamSchema, 'params'), ctrl.getPayment)

export default router
