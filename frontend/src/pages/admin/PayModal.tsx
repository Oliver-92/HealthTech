import { useState } from 'react'
import { Modal, Button, Select } from '@/components/common'
import { paySchema } from '@/validations/billingSchema'
import { formatMoney, formatMinutes } from '@/utils/money'
import type { PaymentReport, PaymentMethod } from '@/types'

interface Props {
  open:    boolean
  report:  PaymentReport | null
  onClose: () => void
  onPay:   (id: number, method: PaymentMethod) => Promise<boolean>
}

const METHOD_OPTIONS = [
  { value: '',               label: 'Seleccionar método…' },
  { value: 'BANK_TRANSFER',  label: 'Transferencia bancaria' },
  { value: 'MERCADO_PAGO',   label: 'Mercado Pago' },
]

export function PayModal({ open, report, onClose, onPay }: Props) {
  const [method,  setMethod]  = useState<string>('')
  const [error,   setError]   = useState<string | undefined>()
  const [loading, setLoading] = useState(false)

  if (!report) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = paySchema.safeParse({ paymentMethod: method })
    if (!result.success) {
      setError(result.error.issues[0]?.message)
      return
    }
    setLoading(true)
    const ok = await onPay(report.id, result.data.paymentMethod)
    setLoading(false)
    if (ok) { setMethod(''); onClose() }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ejecutar pago"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" form="pay-form" isLoading={loading}>Pagar</Button>
        </>
      }
    >
      <form id="pay-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Resumen de la liquidación */}
        <div className="bg-surface-2 rounded-(--radius) p-3 text-sm space-y-1">
          <p className="font-semibold text-foreground">
            {report.caregiver.firstName} {report.caregiver.lastName}
          </p>
          <p className="text-muted">{formatMinutes(report.totalTimeMins)} trabajados</p>
          <p className="text-lg font-bold text-foreground">{formatMoney(report.totalAmount)}</p>
        </div>

        <Select
          label="Método de pago"
          options={METHOD_OPTIONS}
          value={method}
          onChange={(e) => { setMethod(e.target.value); setError(undefined) }}
          error={error}
          disabled={loading}
        />
      </form>
    </Modal>
  )
}
