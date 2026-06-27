import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { Table, Badge, Button, Select, EmptyState, AsyncBoundary } from '@/components/common'
import { ReportDetailModal } from '@/pages/admin/ReportDetailModal'
import { useMyReports } from '@/hooks/useMyReports'
import { formatDate, formatTime } from '@/utils/formatDate'
import { REPORT_STATUS } from '@/constants/statuses'
import type { Column } from '@/components/common'
import type { Report, ReportStatus } from '@/types'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  ...Object.entries(REPORT_STATUS).map(([value, { label }]) => ({ value, label })),
]

// Borradores y rechazados pueden seguir editándose/reenviándose.
const isEditable = (s: ReportStatus) => s === 'DRAFT' || s === 'REJECTED'

export function MyReports() {
  const { items, loading, error, statusFilter, setStatusFilter, refetch } = useMyReports()
  const navigate = useNavigate()

  // El listado /me/reports ya trae el informe completo, así que el detalle se abre
  // con el objeto de la fila (sin pegarle a /reports/:id, que es admin-only).
  const [selected, setSelected] = useState<Report | null>(null)

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
      key: 'patient',
      header: 'Paciente',
      render: (r) => `${r.patient.firstName} ${r.patient.lastName}`,
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
      className: 'w-40',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>
            Ver
          </Button>
          {isEditable(r.status) && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Pencil size={14} />}
              onClick={() => navigate(`/caregiver/reports/${r.shiftId}`)}
            >
              Editar
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis informes</h1>
        <p className="text-sm text-muted mt-1">Informes cargados en tus guardias</p>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter ?? ''}
          onChange={(e) => setStatusFilter((e.target.value || undefined) as ReportStatus | undefined)}
          className="w-44"
        />
      </div>

      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={refetch}
        isEmpty={items.length === 0}
        emptyState={
          <EmptyState
            title="Sin informes"
            description="Todavía no cargaste informes. Hacelo desde tus guardias."
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
