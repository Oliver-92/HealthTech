import { Request, Response } from 'express'
import * as service from './caregivers.service.js'
import type {
  CreateCaregiverInput,
  UpdateCaregiverInput,
  ListCaregiversQuery,
} from './caregivers.schema.js'

export async function list(req: Request, res: Response) {
  const caregivers = await service.listCaregivers(req.query as ListCaregiversQuery)
  res.json(caregivers)
}

export async function getById(req: Request, res: Response) {
  // req.params.id is validated and coerced to number by the validate middleware
  const caregiver = await service.getCaregiverById(Number(req.params.id))
  res.json(caregiver)
}

export async function create(req: Request, res: Response) {
  const caregiver = await service.createCaregiver(req.body as CreateCaregiverInput)
  res.status(201).json(caregiver)
}

export async function update(req: Request, res: Response) {
  const caregiver = await service.updateCaregiver(
    Number(req.params.id),
    req.body as UpdateCaregiverInput,
  )
  res.json(caregiver)
}

export async function deactivate(req: Request, res: Response) {
  const caregiver = await service.deactivateCaregiver(Number(req.params.id))
  res.json(caregiver)
}
