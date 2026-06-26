import { CalendarDays, FileText, Clock, CheckCircle } from 'lucide-react'
import { Card, Badge, LoadingSpinner } from '@/components/common'
import { useMyShifts } from '@/hooks/useMyShifts'
import { useMyReports } from '@/hooks/useMyReports'
import { ShiftCard } from './ShiftCard'

function StatCard({ icon, label, value, variant = 'default' }: {
  icon: React.ReactNode
  label: string
  value: number
  variant?: 'default' | 'info' | 'success' | 'warning' | 'danger'
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className="shrink-0 text-muted">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
      <Badge variant={variant} className="ml-auto sr-only">{label}</Badge>
    </Card>
  )
}

export function CaregiverDashboard() {
  const { items: shifts, loading: loadingShifts } = useMyShifts()
  const { items: reports, loading: loadingReports } = useMyReports()

  const upcoming = shifts.filter((s) => s.status === 'SCHEDULED').slice(0, 3)

  const submitted = reports.filter((r) => r.status === 'SUBMITTED').length
  const approved  = reports.filter((r) => r.status === 'APPROVED').length
  const rejected  = reports.filter((r) => r.status === 'REJECTED').length
  const drafts    = reports.filter((r) => r.status === 'DRAFT').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi panel</h1>
        <p className="text-sm text-muted mt-1">Resumen de tu actividad</p>
      </div>

      {/* Stats */}
      {loadingReports || loadingShifts ? (
        <div className="flex justify-center py-6">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<CalendarDays size={24} />} label="Guardias prog." value={shifts.filter((s) => s.status === 'SCHEDULED').length} />
          <StatCard icon={<Clock size={24} />} label="Borradores" value={drafts} variant="default" />
          <StatCard icon={<FileText size={24} />} label="En revisión" value={submitted} variant="info" />
          <StatCard icon={<CheckCircle size={24} />} label="Aprobados" value={approved} variant="success" />
        </div>
      )}

      {/* Rechazados — alerta */}
      {!loadingReports && rejected > 0 && (
        <div className="bg-danger/10 border border-danger/30 rounded-(--radius) px-4 py-3 text-sm text-danger font-medium">
          Tenés {rejected} informe{rejected > 1 ? 's' : ''} rechazado{rejected > 1 ? 's' : ''} — revisá y reenviá desde "Mis guardias".
        </div>
      )}

      {/* Próximas guardias */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Próximas guardias</h2>
        {loadingShifts ? (
          <LoadingSpinner />
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-muted">No tenés guardias programadas próximamente.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((s) => (
              <ShiftCard key={s.id} shift={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
