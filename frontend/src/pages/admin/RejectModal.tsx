import { useState } from 'react'
import { Modal, Button, Textarea } from '@/components/common'
import { rejectSchema } from '@/validations/reportSchema'

interface Props {
  open:     boolean
  reportId: number | null
  onClose:  () => void
  onReject: (id: number, reason: string) => Promise<boolean>
}

export function RejectModal({ open, reportId, onClose, onReject }: Props) {
  const [reason,  setReason]  = useState('')
  const [error,   setError]   = useState<string | undefined>()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = rejectSchema.safeParse({ reason })
    if (!result.success) {
      setError(result.error.issues[0]?.message)
      return
    }
    if (!reportId) return
    setLoading(true)
    const ok = await onReject(reportId, reason)
    setLoading(false)
    if (ok) { setReason(''); onClose() }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rechazar informe"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="danger" type="submit" form="reject-form" isLoading={loading}>
            Rechazar
          </Button>
        </>
      }
    >
      <form id="reject-form" onSubmit={handleSubmit} noValidate>
        <Textarea
          label="Motivo del rechazo"
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError(undefined) }}
          error={error}
          disabled={loading}
          placeholder="Explique por qué se rechaza el informe…"
          rows={4}
        />
      </form>
    </Modal>
  )
}
