import { Request, Response } from 'express'
import * as service from './patients.service.js'
import type {
  CreatePatientInput,
  UpdatePatientInput,
  ListPatientsQuery,
} from './patients.schema.js'

export async function list(req: Request, res: Response) {
  const patients = await service.listPatients(req.validatedQuery as ListPatientsQuery)
  res.json(patients)
}

export async function getById(req: Request, res: Response) {
  const patient = await service.getPatientById(Number(req.params.id))
  res.json(patient)
}

export async function create(req: Request, res: Response) {
  const patient = await service.createPatient(req.body as CreatePatientInput)
  res.status(201).json(patient)
}

export async function update(req: Request, res: Response) {
  const patient = await service.updatePatient(
    Number(req.params.id),
    req.body as UpdatePatientInput,
  )
  res.json(patient)
}

export async function deactivate(req: Request, res: Response) {
  const patient = await service.deactivatePatient(Number(req.params.id))
  res.json(patient)
}
