import { Select, EmptyState, AsyncBoundary } from '@/components/common'
import { useMyShifts } from '@/hooks/useMyShifts'
import { SHIFT_STATUS } from '@/constants/statuses'
import { ShiftCard } from './ShiftCard'
import type { ShiftStatus } from '@/types'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  ...Object.entries(SHIFT_STATUS).map(([v, { label }]) => ({ value: v, label })),
]

export function MyShifts() {
  const {
    items, loading, error,
    statusFilter, fromFilter, toFilter,
    setStatusFilter, setFromFilter, setToFilter, refetch,
  } = useMyShifts()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis guardias</h1>
        <p className="text-sm text-muted mt-1">Tus guardias asignadas</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
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
          title="Desde"
        />
        <input
          type="date"
          value={toFilter ?? ''}
          onChange={(e) => setToFilter(e.target.value || undefined)}
          className="bg-surface border border-border rounded-(--radius) px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          title="Hasta"
        />
      </div>

      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={refetch}
        isEmpty={items.length === 0}
        emptyState={
          <EmptyState
            title="Sin guardias"
            description="No tenés guardias asignadas con los filtros actuales."
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} />
          ))}
        </div>
      </AsyncBoundary>
    </div>
  )
}
