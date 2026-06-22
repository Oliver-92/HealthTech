import { Request, Response } from 'express'
import * as service from './reports.service.js'
import { getCaregiverIdByUserId } from '../caregivers/caregivers.service.js'
import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import type {
  CreateReportInput,
  UpdateReportInput,
  RejectReportInput,
  ListReportsQuery,
} from './reports.schema.js'

// ── Admin ────────────────────────────────────────────────────────────────────

export async function list(req: Request, res: Response) {
  const reports = await service.listReports(req.validatedQuery as ListReportsQuery)
  res.json(reports)
}

export async function getById(req: Request, res: Response) {
  const report = await service.getReportById(Number(req.params.id))
  res.json(report)
}

export async function approve(req: Request, res: Response) {
  const report = await service.approveReport(Number(req.params.id), req.user!.id)
  res.json(report)
}

export async function reject(req: Request, res: Response) {
  const report = await service.rejectReport(
    Number(req.params.id),
    req.user!.id,
    req.body as RejectReportInput,
  )
  res.json(report)
}

// ── Caregiver ─────────────────────────────────────────────────────────────────

export async function createForShift(req: Request, res: Response) {
  const caregiverId = await getCaregiverIdByUserId(req.user!.id)
  const report = await service.createReport(
    Number(req.params.shiftId),
    caregiverId,
    req.body as CreateReportInput,
  )
  res.status(201).json(report)
}

export async function update(req: Request, res: Response) {
  const caregiverId = await getCaregiverIdByUserId(req.user!.id)
  const report = await service.updateReport(
    Number(req.params.id),
    caregiverId,
    req.body as UpdateReportInput,
  )
  res.json(report)
}

export async function submit(req: Request, res: Response) {
  const caregiverId = await getCaregiverIdByUserId(req.user!.id)
  const report = await service.submitReport(Number(req.params.id), caregiverId)
  res.json(report)
}

// ── Self-service: CAREGIVER or PATIENT ───────────────────────────────────────

export async function listMine(req: Request, res: Response) {
  const filters = req.validatedQuery as ListReportsQuery

  if (req.user!.role === 'CAREGIVER') {
    const caregiverId = await getCaregiverIdByUserId(req.user!.id)
    const reports = await service.listMyReports(caregiverId, filters)
    res.json(reports)
    return
  }

  // PATIENT role
  const patient = await prisma.patient.findUnique({
    where: { userId: req.user!.id },
    select: { id: true },
  })
  if (!patient) throw ApiError.notFound('Patient profile not found for this user')

  const reports = await service.listPatientReports(patient.id, filters)
  res.json(reports)
}
