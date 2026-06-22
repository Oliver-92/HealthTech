import { Router } from 'express'
import { auth } from '../../middlewares/auth.js'
import { requireRole } from '../../middlewares/requireRole.js'
import { validate } from '../../middlewares/validate.js'
import { idParamSchema } from '../../utils/schemas.js'
import {
  createReportSchema,
  updateReportSchema,
  rejectReportSchema,
  listReportsSchema,
  shiftIdParamSchema,
} from './reports.schema.js'
import * as ctrl from './reports.controller.js'

// ── CAREGIVER: POST /api/shifts/:shiftId/report ───────────────────────────────
// Mounted at /api/shifts (before the admin shifts router) to avoid the blanket
// requireRole('ADMIN') middleware in the shifts admin router catching this path.
export const shiftReportRouter = Router()
shiftReportRouter.post(
  '/:shiftId/report',
  auth,
  requireRole('CAREGIVER'),
  validate(shiftIdParamSchema, 'params'),
  validate(createReportSchema),
  ctrl.createForShift,
)

// ── /api/reports — per-route auth so admin and caregiver can share the prefix ──
// Using router.use(requireRole) would block cross-role requests; per-route auth avoids this.
export const reportsRouter = Router()

// Admin only
reportsRouter.get('/', auth, requireRole('ADMIN'), validate(listReportsSchema, 'query'), ctrl.list)
reportsRouter.get('/:id', auth, requireRole('ADMIN'), validate(idParamSchema, 'params'), ctrl.getById)
reportsRouter.patch(
  '/:id/approve',
  auth,
  requireRole('ADMIN'),
  validate(idParamSchema, 'params'),
  ctrl.approve,
)
reportsRouter.patch(
  '/:id/reject',
  auth,
  requireRole('ADMIN'),
  validate(idParamSchema, 'params'),
  validate(rejectReportSchema),
  ctrl.reject,
)

// Caregiver only
reportsRouter.put(
  '/:id',
  auth,
  requireRole('CAREGIVER'),
  validate(idParamSchema, 'params'),
  validate(updateReportSchema),
  ctrl.update,
)
reportsRouter.patch(
  '/:id/submit',
  auth,
  requireRole('CAREGIVER'),
  validate(idParamSchema, 'params'),
  ctrl.submit,
)

// ── /api/me/reports — CAREGIVER (own) or PATIENT (about them, read-only) ──────
export const meReportsRouter = Router()
meReportsRouter.get(
  '/',
  auth,
  requireRole('CAREGIVER', 'PATIENT'),
  validate(listReportsSchema, 'query'),
  ctrl.listMine,
)
