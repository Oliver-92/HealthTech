import { Modal, Button, Badge } from '@/components/common'
import { formatDate, formatTime } from '@/utils/formatDate'
import { REPORT_STATUS } from '@/constants/statuses'
import type { Report } from '@/types'

interface Props {
  open:      boolean
  report:    Report | null
  onClose:   () => void
  onApprove?: (id: number) => void
  onReject?:  (id: number) => void
  readOnly?:  boolean
}

export function ReportDetailModal({ open, report, onClose, onApprove, onReject, readOnly = false }: Props) {
  if (!report) return null
  const cfg = REPORT_STATUS[report.status]
  const canAct = !readOnly && report.status === 'SUBMITTED' && !!onApprove && !!onReject

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detalle del informe"
      size="lg"
      footer={
        <div className="flex gap-2 w-full justify-between">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          {canAct && (
            <div className="flex gap-2">
              <Button variant="danger" onClick={() => onReject!(report.id)}>Rechazar</Button>
              <Button onClick={() => onApprove!(report.id)}>Aprobar</Button>
            </div>
          )}
        </div>
      }
    >
      <div className="space-y-4 text-sm">
        {/* Guardia */}
        <div className="bg-surface-2 rounded-(--radius) p-3 space-y-1">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide">Guardia</p>
          <p className="text-foreground">
            {formatDate(report.shift.date)} · {formatTime(report.shift.startTime)} – {formatTime(report.shift.endTime)}
          </p>
          <p className="text-muted">
            {report.caregiver.firstName} {report.caregiver.lastName} →{' '}
            {report.patient.firstName} {report.patient.lastName}
          </p>
        </div>

        {/* Estado */}
        <div className="flex items-center gap-2">
          <span className="text-muted">Estado:</span>
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
        </div>

        {/* Rechazo previo */}
        {report.status === 'REJECTED' && report.rejectionReason && (
          <div className="bg-danger/10 border border-danger/30 rounded-(--radius) p-3">
            <p className="text-xs font-semibold text-danger uppercase tracking-wide mb-1">Motivo de rechazo</p>
            <p className="text-foreground">{report.rejectionReason}</p>
          </div>
        )}

        {/* Minutos */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Minutos trabajados</p>
          <p className="text-foreground font-medium">{report.workedMinutes} min</p>
        </div>

        {/* Observaciones */}
        {report.observations && (
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Observaciones</p>
            <p className="text-foreground whitespace-pre-wrap">{report.observations}</p>
          </div>
        )}

        {/* Medicación */}
        {report.medication && (
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Medicación</p>
            <p className="text-foreground whitespace-pre-wrap">{report.medication}</p>
          </div>
        )}

        {/* Signos vitales */}
        {report.vitalSigns && (
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Signos vitales</p>
            <p className="text-foreground whitespace-pre-wrap">{report.vitalSigns}</p>
          </div>
        )}

        {/* Revisado por */}
        {report.reviewedBy && (
          <p className="text-muted text-xs">
            Revisado por {report.reviewedBy.email} el {formatDate(report.reviewedAt)}
          </p>
        )}
      </div>
    </Modal>
  )
}
