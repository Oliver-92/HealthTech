import { useNavigate } from 'react-router-dom'
import { Card, Badge, Button } from '@/components/common'
import { formatDate, formatTime } from '@/utils/formatDate'
import { SHIFT_STATUS, REPORT_STATUS } from '@/constants/statuses'
import type { Shift } from '@/types'

interface Props {
  shift: Shift
}

export function ShiftCard({ shift }: Props) {
  const navigate = useNavigate()
  const shiftCfg = SHIFT_STATUS[shift.status]

  const report = shift.report
  const reportCfg = report ? REPORT_STATUS[report.status] : null

  const canUpload =
    !report ||
    report.status === 'DRAFT' ||
    report.status === 'REJECTED'

  const ctaLabel = () => {
    if (!report)              return 'Cargar informe'
    if (report.status === 'DRAFT' || report.status === 'REJECTED') return 'Editar informe'
    if (report.status === 'SUBMITTED') return 'En revisión'
    return 'Aprobado'
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">
            {shift.patient.firstName} {shift.patient.lastName}
          </p>
          <p className="text-sm text-muted">{formatDate(shift.date)}</p>
          <p className="text-sm text-muted">
            {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={shiftCfg.variant}>{shiftCfg.label}</Badge>
          {reportCfg && (
            <Badge variant={reportCfg.variant}>{reportCfg.label}</Badge>
          )}
        </div>
      </div>

      <div className="pt-1">
        {canUpload ? (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => navigate(`/caregiver/reports/${shift.id}`)}
          >
            {ctaLabel()}
          </Button>
        ) : (
          <p className="text-xs text-center text-muted">{ctaLabel()}</p>
        )}
      </div>
    </Card>
  )
}
