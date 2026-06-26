import { useState, useEffect } from 'react'
import { Modal, Button, Input, Select } from '@/components/common'
import { createShiftSchema, updateShiftSchema } from '@/validations/shiftSchema'
import { caregiverService } from '@/services/caregiverService'
import { patientService } from '@/services/patientService'
import { unwrapList } from '@/utils/unwrapList'
import { dateInput } from '@/utils/formatDate'
import type { Shift, CreateShiftDto, UpdateShiftDto } from '@/types'
import type { Caregiver } from '@/types'
import type { Patient } from '@/types'

interface Props {
  open: boolean
  mode: 'create' | 'edit'
  initial?: Shift
  onClose: () => void
  onSubmit: (dto: CreateShiftDto | UpdateShiftDto) => Promise<boolean>
}

interface FormState {
  patientId:   string
  caregiverId: string
  date:        string
  startTime:   string
  endTime:     string
}

const EMPTY: FormState = { patientId: '', caregiverId: '', date: '', startTime: '', endTime: '' }

function fromShift(s: Shift): FormState {
  return {
    patientId:   String(s.patientId),
    caregiverId: String(s.caregiverId),
    date:        dateInput(s.date),
    startTime:   s.startTime,
    endTime:     s.endTime,
  }
}

export function ShiftFormModal({ open, mode, initial, onClose, onSubmit }: Props) {
  const [form, setForm]       = useState<FormState>(() => mode === 'edit' && initial ? fromShift(initial) : EMPTY)
  const [errors, setErrors]   = useState<Partial<Record<keyof FormState, string>>>({})
  const [loading, setLoading] = useState(false)

  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [patients,   setPatients]   = useState<Patient[]>([])

  useEffect(() => {
    if (!open) return
    Promise.all([
      caregiverService.list({ isActive: 'true' }),
      patientService.list({ isActive: 'true' }),
    ]).then(([cRes, pRes]) => {
      setCaregivers(unwrapList(cRes).data)
      setPatients(unwrapList(pRes).data)
    })
  }, [open])

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const schema = mode === 'create' ? createShiftSchema : updateShiftSchema
    const result = schema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormState
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setLoading(true)
    const ok = await onSubmit(result.data as CreateShiftDto | UpdateShiftDto)
    setLoading(false)
    if (ok) onClose()
  }

  const caregiverOptions = [
    { value: '', label: 'Seleccionar cuidador…' },
    ...caregivers.map((c) => ({ value: String(c.id), label: `${c.firstName} ${c.lastName}` })),
  ]
  const patientOptions = [
    { value: '', label: 'Seleccionar paciente…' },
    ...patients.map((p) => ({ value: String(p.id), label: `${p.firstName} ${p.lastName}` })),
  ]

  const title = mode === 'edit' ? 'Editar guardia' : 'Asignar guardia'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" form="shift-form" isLoading={loading}>
            {mode === 'edit' ? 'Guardar cambios' : 'Asignar'}
          </Button>
        </>
      }
    >
      <form id="shift-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <Select
          label="Cuidador"
          options={caregiverOptions}
          value={form.caregiverId}
          onChange={set('caregiverId')}
          error={errors.caregiverId}
          disabled={loading}
        />
        <Select
          label="Paciente"
          options={patientOptions}
          value={form.patientId}
          onChange={set('patientId')}
          error={errors.patientId}
          disabled={loading}
        />
        <Input
          label="Fecha"
          type="date"
          value={form.date}
          onChange={set('date')}
          error={errors.date}
          disabled={loading}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Inicio (HH:MM)"
            type="time"
            value={form.startTime}
            onChange={set('startTime')}
            error={errors.startTime}
            disabled={loading}
          />
          <Input
            label="Fin (HH:MM)"
            type="time"
            value={form.endTime}
            onChange={set('endTime')}
            error={errors.endTime}
            disabled={loading}
          />
        </div>
      </form>
    </Modal>
  )
}
