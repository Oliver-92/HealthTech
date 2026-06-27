import { useState } from 'react'
import { Table, Badge, Button, Select, LoadingSpinner, EmptyState, AsyncBoundary } from '@/components/common'
import { ReportDetailModal } from '@/pages/admin/ReportDetailModal'
import { useMyReports } from '@/hooks/useMyReports'
import { reportService } from '@/services/reportService'
import { handleError } from '@/utils/handleError'
import { formatDate, formatTime } from '@/utils/formatDate'
import { REPORT_STATUS } from '@/constants/statuses'
import type { Column } from '@/components/common'
import type { Report, ReportStatus } from '@/types'

const STATUS_OPTIONS = [
  { value: '',         label: 'Todos los estados' },
  { value: 'APPROVED', label: 'Aprobado' },
]

export function PatientReports() {
  const { items, loading, error, statusFilter, setStatusFilter, refetch } = useMyReports()

  const [selected,      setSelected]      = useState<Report | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const openDetail = async (id: number) => {
    setLoadingDetail(true)
    try {
      const report = await reportService.getById(id)
      setSelected(report)
    } catch (err) {
      handleError(err)
    } finally {
      setLoadingDetail(false)
    }
  }

  const columns: Column<Report>[] = [
    {
      key: 'date',
      header: 'Fecha',
      render: (r) => formatDate(r.shift.date),
    },
    {
      key: 'time',
      header: 'Horario',
      render: (r) => `${formatTime(r.shift.startTime)} – ${formatTime(r.shift.endTime)}`,
    },
    {
      key: 'caregiver',
      header: 'Cuidador/a',
      render: (r) => `${r.caregiver.firstName} ${r.caregiver.lastName}`,
    },
    {
      key: 'minutes',
      header: 'Duración',
      render: (r) => `${r.workedMinutes} min`,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (r) => {
        const cfg = REPORT_STATUS[r.status]
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (r) => (
        <Button size="sm" variant="ghost" onClick={() => openDetail(r.id)}>
          Ver
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis informes</h1>
        <p className="text-sm text-muted mt-1">Informes de las guardias realizadas</p>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter ?? ''}
          onChange={(e) => setStatusFilter((e.target.value || undefined) as ReportStatus | undefined)}
          className="w-44"
        />
        {loadingDetail && <LoadingSpinner size="sm" />}
      </div>

      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={refetch}
        isEmpty={items.length === 0}
        emptyState={
          <EmptyState
            title="Sin informes"
            description="Aún no hay informes disponibles para tu seguimiento."
          />
        }
      >
        <Table columns={columns} data={items} keyField="id" isLoading={false} emptyMessage="Sin informes" />
      </AsyncBoundary>

      <ReportDetailModal
        open={!!selected}
        report={selected}
        onClose={() => setSelected(null)}
        readOnly
      />
    </div>
  )
}
