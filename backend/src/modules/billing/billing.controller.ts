import { Request, Response } from 'express'
import * as periods from './payrollPeriod.service.js'
import * as paymentReports from './paymentReport.service.js'
import * as payments from './payment.service.js'
import type { CreatePayrollPeriodInput, PayInput, ListPaymentsQuery } from './billing.schema.js'

// ── Payroll periods ───────────────────────────────────────────────────────────

export async function listPeriods(_req: Request, res: Response) {
  res.json(await periods.listPayrollPeriods())
}

export async function getPeriod(req: Request, res: Response) {
  res.json(await periods.getPayrollPeriodById(Number(req.params.id)))
}

export async function createPeriod(req: Request, res: Response) {
  res.status(201).json(await periods.createPayrollPeriod(req.body as CreatePayrollPeriodInput))
}

export async function closePeriod(req: Request, res: Response) {
  res.json(await periods.closePayrollPeriod(Number(req.params.id)))
}

export async function generateReports(req: Request, res: Response) {
  res.status(201).json(await paymentReports.generatePaymentReports(Number(req.params.id)))
}

// ── Payment reports (liquidations) ─────────────────────────────────────────────

export async function listReportsByPayroll(req: Request, res: Response) {
  res.json(await paymentReports.listByPayroll(Number(req.params.payrollPeriodId)))
}

export async function listReportsByCaregiver(req: Request, res: Response) {
  res.json(await paymentReports.listByCaregiver(Number(req.params.caregiverId)))
}

export async function getReport(req: Request, res: Response) {
  res.json(await paymentReports.getPaymentReportById(Number(req.params.id)))
}

export async function pay(req: Request, res: Response) {
  res.json(await paymentReports.payPaymentReport(Number(req.params.id), req.body as PayInput))
}

// ── Payments ───────────────────────────────────────────────────────────────────

export async function listPayments(req: Request, res: Response) {
  res.json(await payments.listPayments(req.validatedQuery as ListPaymentsQuery))
}

export async function getPayment(req: Request, res: Response) {
  res.json(await payments.getPaymentById(Number(req.params.id)))
}
