import { useState, useEffect } from 'react'
import { CalendarClock, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import {
  Table, Badge, Button, Pagination,
  Select, ConfirmDialog, AsyncBoundary,
} from '@/components/common'
import { useShifts } from '@/hooks/useShifts'
import { formatDate, formatTime } from '@/utils/formatDate'
import { SHIFT_STATUS, SHIFT_TRANSITIONS, REPORT_STATUS } from '@/constants/statuses'
import { caregiverService } from '@/services/caregiverService'
import { patientService } from '@/services/patientService'
import { unwrapList } from '@/utils/unwrapList'
import { ShiftFormModal } from './ShiftFormModal'
import type { Column } from '@/components/common'
import type { Shift, ShiftStatus, CreateShiftDto, UpdateShiftDto } from '@/types'
import type { Caregiver } from '@/types'
import type { Patient } from '@/types'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  ...Object.entries(SHIFT_STATUS).map(([v, { label }]) => ({ value: v, label })),
]

export function Shifts() {
  const {
    items, total, loading, error,
    caregiverFilter, patientFilter, statusFilter, fromFilter, toFilter,
    page, pageSize,
    setCaregiverFilter, setPatientFilter, setStatusFilter,
    setFromFilter, setToFilter, setPage,
    create, update, updateStatus, remove, refetch,
  } = useShifts()

  // Listas para selects de filtros y modal
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [patients,   setPatients]   = useState<Patient[]>([])

  useEffect(() => {
    Promise.all([
      caregiverService.list({ isActive: 'true' }),
      patientService.list({ isActive: 'true' }),
    ]).then(([cRes, pRes]) => {
      setCaregivers(unwrapList(cRes).data)
      setPatients(unwrapList(pRes).data)
    })
  }, [])

  const caregiverOptions = [
    { value: '', label: 'Todos los cuidadores' },
    ...caregivers.map((c) => ({ value: String(c.id), label: `${c.firstName} ${c.lastName}` })),
  ]
  const patientOptions = [
    { value: '', label: 'Todos los pacientes' },
    ...patients.map((p) => ({ value: String(p.id), label: `${p.firstName} ${p.lastName}` })),
  ]

  // Modal crear/editar
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selected,  setSelected]  = useState<Shift | undefined>()

  // Menú de cambio de estado
  const [statusMenuId, setStatusMenuId] = useState<number | null>(null)

  // Confirm eliminar
  const [confirmOpen,   setConfirmOpen]   = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<Shift | undefined>()
  const [deleting,      setDeleting]      = useState(false)

  const openCreate = () => { setModalMode('create'); setSelected(undefined); setModalOpen(true) }
  const openEdit   = (s: Shift) => { setModalMode('edit'); setSelected(s); setModalOpen(true) }
  const openConfirm = (s: Shift) => { setConfirmTarget(s); setConfirmOpen(true) }

  const handleSubmit = async (dto: CreateShiftDto | UpdateShiftDto): Promise<boolean> => {
    if (modalMode === 'create') return create(dto as CreateShiftDto)
    if (!selected) return false
    return update(selected.id, dto as UpdateShiftDto)
  }

  const handleDelete = async () => {
    if (!confirmTarget) return
    setDeleting(true)
    await remove(confirmTarget.id)
    setDeleting(false)
    setConfirmOpen(false)
  }

  const handleStatusChange = async (id: number, status: ShiftStatus) => {
    setStatusMenuId(null)
    await updateStatus(id, status)
  }

  const canEdit   = (s: Shift) => s.status !== 'COMPLETED' && s.status !== 'CANCELLED'
  const canDelete = (s: Shift) => s.status === 'SCHEDULED' && !s.report

  const columns: Column<Shift>[] = [
    {
      key: 'date',
      header: 'Fecha',
      render: (s) => formatDate(s.date),
    },
    {
      key: 'time',
      header: 'Horario',
      render: (s) => `${formatTime(s.startTime)} – ${formatTime(s.endTime)}`,
    },
    {
      key: 'patient',
      header: 'Paciente',
      render: (s) => `${s.patient.firstName} ${s.patient.lastName}`,
    },
    {
      key: 'caregiver',
      header: 'Cuidador',
      render: (s) => `${s.caregiver.firstName} ${s.caregiver.lastName}`,
    },
    {
      key: 'status',
      header: 'Estado guardia',
      render: (s) => {
        const cfg = SHIFT_STATUS[s.status]
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>
      },
    },
    {
      key: 'report',
      header: 'Informe',
      render: (s) => {
        if (!s.report) return <span className="text-muted text-sm">—</span>
        const cfg = REPORT_STATUS[s.report.status]
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-36',
      render: (s) => {
        const transitions = SHIFT_TRANSITIONS[s.status]
        return (
          <div className="flex items-center gap-1">
            {canEdit(s) && (
              <Button variant="ghost" size="sm" onClick={() => openEdit(s)} aria-label="Editar">
                <Pencil size={15} />
              </Button>
            )}

            {transitions.length > 0 && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStatusMenuId(statusMenuId === s.id ? null : s.id)}
                  aria-label="Cambiar estado"
                >
                  <ChevronDown size={15} />
                </Button>
                {statusMenuId === s.id && (
                  <div className="absolute right-0 top-full mt-1 z-20 bg-surface border border-border rounded-(--radius) shadow-lg py-1 min-w-36">
                    {transitions.map((st) => (
                      <button
                        key={st}
                        type="button"
                        className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-surface-2 transition-colors"
                        onClick={() => handleStatusChange(s.id, st)}
                      >
                        {SHIFT_STATUS[st].label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {canDelete(s) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openConfirm(s)}
                aria-label="Eliminar"
                className="text-danger hover:text-danger"
              >
                <Trash2 size={15} />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-4" onClick={() => statusMenuId && setStatusMenuId(null)}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Guardias</h1>
        <p className="text-sm text-muted mt-1">Gestión de guardias y asignaciones</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3">
        <Select
          options={caregiverOptions}
          value={caregiverFilter ? String(caregiverFilter) : ''}
          onChange={(e) => setCaregiverFilter(e.target.value ? Number(e.target.value) : undefined)}
          className="w-48"
        />
        <Select
          options={patientOptions}
          value={patientFilter ? String(patientFilter) : ''}
          onChange={(e) => setPatientFilter(e.target.value ? Number(e.target.value) : undefined)}
          className="w-48"
        />
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter ?? ''}
          onChange={(e) => setStatusFilter(e.target.value ? (e.target.value as ShiftStatus) : undefined)}
          className="w-44"
        />
        <input
          type="date"
          value={fromFilter ?? ''}
          onChange={(e) => setFromFilter(e.target.value || undefined)}
          className="bg-surface border border-border rounded-(--radius) px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Desde"
          title="Desde"
        />
        <input
          type="date"
          value={toFilter ?? ''}
          onChange={(e) => setToFilter(e.target.value || undefined)}
          className="bg-surface border border-border rounded-(--radius) px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Hasta"
          title="Hasta"
        />
        <div className="ml-auto">
          <Button leftIcon={<CalendarClock size={16} />} onClick={openCreate}>
            Asignar guardia
          </Button>
        </div>
      </div>

      <AsyncBoundary loading={false} error={error} onRetry={refetch}>
        <Table
          columns={columns}
          data={items}
          keyField="id"
          isLoading={loading}
          emptyMessage="No se encontraron guardias"
        />
        {total > pageSize && (
          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        )}
      </AsyncBoundary>

      <ShiftFormModal
        key={modalOpen ? `${modalMode}-${selected?.id ?? 'new'}` : 'closed'}
        open={modalOpen}
        mode={modalMode}
        initial={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar guardia"
        message={`¿Eliminar la guardia del ${formatDate(confirmTarget?.date ?? '')}? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
        danger
        isLoading={deleting}
      />
    </div>
  )
}
