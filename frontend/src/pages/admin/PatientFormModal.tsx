import { useState } from 'react'
import { Modal, Button, Input, Textarea } from '@/components/common'
import { createPatientSchema, updatePatientSchema } from '@/validations/patientSchema'
import { dateInput } from '@/utils/formatDate'
import type { Patient, CreatePatientDto, UpdatePatientDto } from '@/types'

interface Props {
  open: boolean
  mode: 'create' | 'edit'
  initial?: Patient
  onClose: () => void
  onSubmit: (dto: CreatePatientDto | UpdatePatientDto) => Promise<boolean>
}

interface FormState {
  firstName: string
  lastName: string
  documentId: string
  birthDate: string
  address: string
  phone: string
  emergencyContact: string
  notes: string
  email: string
  password: string
}

const EMPTY: FormState = {
  firstName: '', lastName: '', documentId: '',
  birthDate: '', address: '', phone: '',
  emergencyContact: '', notes: '', email: '', password: '',
}

function fromPatient(p: Patient): FormState {
  return {
    firstName:        p.firstName,
    lastName:         p.lastName,
    documentId:       p.documentId,
    birthDate:        p.birthDate ? dateInput(p.birthDate) : '',
    address:          p.address ?? '',
    phone:            p.phone ?? '',
    emergencyContact: p.emergencyContact ?? '',
    notes:            p.notes ?? '',
    email:            p.user?.email ?? '',
    password:         '',
  }
}

// Rendered with a key that changes on each open so useState initializes fresh.
export function PatientFormModal({ open, mode, initial, onClose, onSubmit }: Props) {
  const [form, setForm]       = useState<FormState>(() =>
    mode === 'edit' && initial ? fromPatient(initial) : EMPTY
  )
  const [errors, setErrors]   = useState<Partial<Record<keyof FormState, string>>>({})
  const [loading, setLoading] = useState(false)

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const schema = mode === 'create' ? createPatientSchema : updatePatientSchema
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

    // Strip empty optional strings
    const data = { ...result.data } as Record<string, unknown>
    const optionals: (keyof FormState)[] = ['birthDate', 'address', 'phone', 'emergencyContact', 'notes', 'email', 'password']
    for (const k of optionals) {
      if (data[k] === '') data[k] = undefined
    }

    setLoading(true)
    const ok = await onSubmit(data as CreatePatientDto | UpdatePatientDto)
    setLoading(false)
    if (ok) onClose()
  }

  const isEdit = mode === 'edit'
  const title  = isEdit ? 'Editar paciente' : 'Nuevo paciente'

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
          <Button type="submit" form="patient-form" isLoading={loading}>
            {isEdit ? 'Guardar cambios' : 'Crear paciente'}
          </Button>
        </>
      }
    >
      <form id="patient-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre"   value={form.firstName} onChange={set('firstName')} error={errors.firstName} disabled={loading} />
          <Input label="Apellido" value={form.lastName}  onChange={set('lastName')}  error={errors.lastName}  disabled={loading} />
        </div>

        {/* Documento (readonly en edit) */}
        <Input
          label="N° de documento"
          value={form.documentId}
          onChange={set('documentId')}
          error={errors.documentId}
          disabled={loading || isEdit}
        />

        {/* Fecha de nacimiento y Teléfono */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Fecha de nacimiento" type="date" value={form.birthDate} onChange={set('birthDate')} error={errors.birthDate} disabled={loading} />
          <Input label="Teléfono (opcional)"               value={form.phone}     onChange={set('phone')}     error={errors.phone}     disabled={loading} />
        </div>

        {/* Dirección */}
        <Input label="Dirección (opcional)" value={form.address} onChange={set('address')} error={errors.address} disabled={loading} />

        {/* Contacto de emergencia */}
        <Input label="Contacto de emergencia (opcional)" value={form.emergencyContact} onChange={set('emergencyContact')} error={errors.emergencyContact} disabled={loading} />

        {/* Notas */}
        <Textarea label="Notas (opcional)" value={form.notes} onChange={set('notes')} error={errors.notes} disabled={loading} rows={3} />

        {/* Acceso al sistema (solo create) */}
        {!isEdit && (
          <>
            <p className="text-xs text-muted">
              Acceso al sistema — opcional. Si se completa, el paciente/familiar podrá ver sus informes.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Email"      type="email"    value={form.email}    onChange={set('email')}    error={errors.email}    disabled={loading} />
              <Input label="Contraseña" type="password" value={form.password} onChange={set('password')} error={errors.password} disabled={loading} />
            </div>
          </>
        )}
      </form>
    </Modal>
  )
}
