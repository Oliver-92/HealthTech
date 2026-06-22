import { Request, Response } from 'express'
import * as service from './shifts.service.js'
import type {
  CreateShiftInput,
  UpdateShiftInput,
  UpdateShiftStatusInput,
  ListShiftsQuery,
  ListMyShiftsQuery,
} from './shifts.schema.js'

export async function list(req: Request, res: Response) {
  const shifts = await service.listShifts(req.query as ListShiftsQuery)
  res.json(shifts)
}

export async function getById(req: Request, res: Response) {
  const shift = await service.getShiftById(Number(req.params.id))
  res.json(shift)
}

export async function create(req: Request, res: Response) {
  const shift = await service.createShift(req.body as CreateShiftInput)
  res.status(201).json(shift)
}

export async function update(req: Request, res: Response) {
  const shift = await service.updateShift(Number(req.params.id), req.body as UpdateShiftInput)
  res.json(shift)
}

export async function updateStatus(req: Request, res: Response) {
  const shift = await service.updateShiftStatus(
    Number(req.params.id),
    req.body as UpdateShiftStatusInput,
  )
  res.json(shift)
}

export async function remove(req: Request, res: Response) {
  await service.deleteShift(Number(req.params.id))
  res.status(204).send()
}

// CAREGIVER: own shifts derived from the JWT token
export async function listMine(req: Request, res: Response) {
  const caregiver = await import('../../config/prisma.js').then(({ prisma }) =>
    prisma.caregiver.findUnique({
      where: { userId: req.user!.id },
      select: { id: true },
    }),
  )

  if (!caregiver) {
    res.status(404).json({ message: 'Caregiver profile not found for this user' })
    return
  }

  const shifts = await service.listMyShifts(caregiver.id, req.query as ListMyShiftsQuery)
  res.json(shifts)
}
