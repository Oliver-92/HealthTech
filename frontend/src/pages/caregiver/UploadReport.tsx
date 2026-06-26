import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeft } from 'lucide-react'
import { Button, Input, Textarea, LoadingSpinner, Badge } from '@/components/common'
import { shiftService } from '@/services/shiftService'
import { reportService } from '@/services/reportService'
import { handleError } from '@/utils/handleError'
import { reportSchema } from '@/validations/reportSchema'
import { formatDate, formatTime } from '@/utils/formatDate'
import { REPORT_STATUS } from '@/constants/statuses'
import type { Shift, Report } from '@/types'
import type { ReportForm } from '@/validations/reportSchema'

const EMPTY: ReportForm = { workedMinutes: 0, observations: '', medication: '', vitalSigns: '' }

function fromReport(r: Report): ReportForm {
  return {
    workedMinutes: r.workedMinutes,
    observations:  r.observations  ?? '',
    medication:    r.medication    ?? '',
    vitalSigns:    r.vitalSigns    ?? '',
  }
}

export function UploadReport() {
  const { shiftId } = useParams<{ shiftId: string }>()
  const navigate    = useNavigate()

  const [shift,   setShift]   = useState<Shift | null>(null)
  const [report,  setReport]  = useState<Report | null>(null)
  const [fetching, setFetching] = useState(true)

  const [form, setForm]       = useState<ReportForm>(EMPTY)
  const [errors, setErrors]   = useState<Partial<Record<keyof ReportForm, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!shiftId) return
    const id = Number(shiftId)
    shiftService
      .getById(id)
      .then(async (s) => {
        setShift(s)
        if (s.report) {
          const r = await reportService.getById(s.report.id)
          setReport(r)
          setForm(fromReport(r))
        }
      })
      .catch(handleError)
      .finally(() => setFetching(false))
  }, [shiftId])

  const set = (field: keyof ReportForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = field === 'workedMinutes' ? e.target.value : e.target.value
      setForm((prev) => ({ ...prev, [field]: value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

  const handleSave = async (submit: boolean) => {
    const result = reportSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ReportForm, string>> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ReportForm
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setSubmitting(true)
    try {
      await reportService.createForShift(Number(shiftId), { ...result.data, submit })
      toast.success(submit ? 'Informe enviado' : 'Borrador guardado')
      navigate('/caregiver/shifts')
    } catch (err) {
      handleError(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!shift) {
    return <p className="text-sm text-danger">No se pudo cargar la guardia.</p>
  }

  const reportStatus = report?.status
  const isReadOnly   = reportStatus === 'SUBMITTED' || reportStatus === 'APPROVED'
  const reportCfg    = reportStatus ? REPORT_STATUS[reportStatus] : null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/caregiver/shifts')}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {report ? 'Editar informe' : 'Cargar informe'}
          </h1>
          <p className="text-sm text-muted">
            {formatDate(shift.date)} · {formatTime(shift.startTime)} – {formatTime(shift.endTime)} ·{' '}
            {shift.patient.firstName} {shift.patient.lastName}
          </p>
        </div>
        {reportCfg && (
          <Badge variant={reportCfg.variant} className="ml-auto">
            {reportCfg.label}
          </Badge>
        )}
      </div>

      {/* Aviso si fue rechazado */}
      {reportStatus === 'REJECTED' && report?.rejectionReason && (
        <div className="bg-danger/10 border border-danger/30 rounded-(--radius) p-4">
          <p className="text-sm font-semibold text-danger mb-1">Informe rechazado</p>
          <p className="text-sm text-foreground">{report.rejectionReason}</p>
        </div>
      )}

      {/* Aviso si está en revisión/aprobado */}
      {isReadOnly && (
        <div className="bg-surface-2 border border-border rounded-(--radius) p-4 text-sm text-muted">
          {reportStatus === 'SUBMITTED'
            ? 'Este informe ya fue enviado y está en revisión. No podés modificarlo.'
            : 'Este informe fue aprobado.'}
        </div>
      )}

      {/* Formulario */}
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
        <Input
          label="Minutos trabajados"
          type="number"
          min="1"
          value={form.workedMinutes === 0 ? '' : String(form.workedMinutes)}
          onChange={set('workedMinutes')}
          error={errors.workedMinutes}
          disabled={isReadOnly || submitting}
        />
        <Textarea
          label="Observaciones (opcional)"
          value={form.observations}
          onChange={set('observations')}
          error={errors.observations}
          disabled={isReadOnly || submitting}
          rows={3}
        />
        <Textarea
          label="Medicación (opcional)"
          value={form.medication}
          onChange={set('medication')}
          error={errors.medication}
          disabled={isReadOnly || submitting}
          rows={2}
        />
        <Textarea
          label="Signos vitales (opcional)"
          value={form.vitalSigns}
          onChange={set('vitalSigns')}
          error={errors.vitalSigns}
          disabled={isReadOnly || submitting}
          rows={2}
        />

        {!isReadOnly && (
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              isLoading={submitting}
              className="flex-1"
            >
              Guardar borrador
            </Button>
            <Button
              onClick={() => handleSave(true)}
              isLoading={submitting}
              className="flex-1"
            >
              Enviar informe
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
