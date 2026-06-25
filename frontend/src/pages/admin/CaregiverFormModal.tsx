import { useState } from 'react'
import { Modal, Button, Input } from '@/components/common'
import { createCaregiverSchema, updateCaregiverSchema } from '@/validations/caregiverSchema'
import { dateInput } from '@/utils/formatDate'
import type { Caregiver, CreateCaregiverDto, UpdateCaregiverDto } from '@/types'

interface Props {
  open: boolean
  mode: 'create' | 'edit'
  initial?: Caregiver
  onClose: () => void
  onSubmit: (dto: CreateCaregiverDto | UpdateCaregiverDto) => Promise<boolean>
}

interface FormState {
  email: string
  password: string
  firstName: string
  lastName: string
  documentId: string
  phone: string
  hourlyRate: string
  hiredAt: string
}

const EMPTY: FormState = {
  email: '', password: '', firstName: '', lastName: '',
  documentId: '', phone: '', hourlyRate: '', hiredAt: '',
}

function fromCaregiver(c: Caregiver): FormState {
  return {
    email:      c.user.email,
    password:   '',
    firstName:  c.firstName,
    lastName:   c.lastName,
    documentId: c.documentId,
    phone:      c.phone ?? '',
    hourlyRate: String(c.hourlyRate),
    hiredAt:    dateInput(c.hiredAt),
  }
}

// Rendered with a key that changes on each open so useState initializes fresh.
export function CaregiverFormModal({ open, mode, initial, onClose, onSubmit }: Props) {
  const [form, setForm]       = useState<FormState>(() =>
    mode === 'edit' && initial ? fromCaregiver(initial) : EMPTY
  )
  const [errors, setErrors]   = useState<Partial<Record<keyof FormState, string>>>({})
  const [loading, setLoading] = useState(false)

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const schema = mode === 'create' ? createCaregiverSchema : updateCaregiverSchema
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

    const data = result.data as Record<string, unknown>
    // Strip empty optional strings before sending
    if ('phone' in data && data.phone === '') data.phone = undefined

    setLoading(true)
    const ok = await onSubmit(data as CreateCaregiverDto | UpdateCaregiverDto)
    setLoading(false)
    if (ok) onClose()
  }

  const isEdit = mode === 'edit'
  const title  = isEdit ? 'Editar cuidador' : 'Nuevo cuidador'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="caregiver-form" isLoading={loading}>
            {isEdit ? 'Guardar cambios' : 'Crear cuidador'}
          </Button>
        </>
      }
    >
      <form id="caregiver-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre"   value={form.firstName} onChange={set('firstName')} error={errors.firstName} disabled={loading} />
          <Input label="Apellido" value={form.lastName}  onChange={set('lastName')}  error={errors.lastName}  disabled={loading} />
        </div>

        {/* Email y Contraseña (solo create) */}
        {!isEdit && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email"       type="email"    value={form.email}    onChange={set('email')}    error={errors.email}    disabled={loading} />
            <Input label="Contraseña"  type="password" value={form.password} onChange={set('password')} error={errors.password} disabled={loading} />
          </div>
        )}

        {/* Documento (edit: solo lectura) */}
        <Input
          label="N° de documento"
          value={form.documentId}
          onChange={set('documentId')}
          error={errors.documentId}
          disabled={loading || isEdit}
        />

        {/* Teléfono */}
        <Input label="Teléfono (opcional)" value={form.phone} onChange={set('phone')} error={errors.phone} disabled={loading} />

        {/* Tarifa y Fecha de ingreso */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Valor hora ($)"
            type="number"
            min="0"
            step="0.01"
            value={form.hourlyRate}
            onChange={set('hourlyRate')}
            error={errors.hourlyRate}
            disabled={loading}
          />
          <Input
            label="Fecha de ingreso"
            type="date"
            value={form.hiredAt}
            onChange={set('hiredAt')}
            error={errors.hiredAt}
            disabled={loading}
          />
        </div>
      </form>
    </Modal>
  )
}
