import { useState } from 'react'
import { Modal, Button, Input } from '@/components/common'
import { createPeriodSchema } from '@/validations/billingSchema'
import type { CreatePayrollPeriodDto } from '@/types'

interface Props {
  open:     boolean
  onClose:  () => void
  onSubmit: (dto: CreatePayrollPeriodDto) => Promise<boolean>
}

interface FormState {
  month:     string   // input type="month" → YYYY-MM
  startDate: string
  endDate:   string
}

const EMPTY: FormState = { month: '', startDate: '', endDate: '' }

export function PeriodFormModal({ open, onClose, onSubmit }: Props) {
  const [form,    setForm]    = useState<FormState>(EMPTY)
  const [errors,  setErrors]  = useState<Partial<Record<keyof FormState, string>>>({})
  const [loading, setLoading] = useState(false)

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setForm((prev) => {
        const next = { ...prev, [field]: value }
        // Al cambiar el mes auto-rellenar startDate y endDate si están vacíos
        if (field === 'month' && value) {
          const [y, m] = value.split('-').map(Number)
          const lastDay = new Date(y, m, 0).getDate()
          if (!prev.startDate) next.startDate = `${value}-01`
          if (!prev.endDate)   next.endDate   = `${value}-${String(lastDay).padStart(2, '0')}`
        }
        return next
      })
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Convertir YYYY-MM → YYYY-MM-01 para el campo month
    const payload = {
      month:     form.month ? `${form.month}-01` : '',
      startDate: form.startDate,
      endDate:   form.endDate,
    }
    const result = createPeriodSchema.safeParse(payload)
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
    const ok = await onSubmit(result.data as CreatePayrollPeriodDto)
    setLoading(false)
    if (ok) { setForm(EMPTY); onClose() }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo período"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" form="period-form" isLoading={loading}>Crear período</Button>
        </>
      }
    >
      <form id="period-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Mes"
          type="month"
          value={form.month}
          onChange={set('month')}
          error={errors.month}
          disabled={loading}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Inicio del período"
            type="date"
            value={form.startDate}
            onChange={set('startDate')}
            error={errors.startDate}
            disabled={loading}
          />
          <Input
            label="Fin del período"
            type="date"
            value={form.endDate}
            onChange={set('endDate')}
            error={errors.endDate}
            disabled={loading}
          />
        </div>
      </form>
    </Modal>
  )
}
