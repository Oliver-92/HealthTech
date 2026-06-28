import {
  Users, UserCheck, Clock, FileText, CreditCard, CheckCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { EmptyState, AsyncBoundary } from '@/components/common'
import { useMetrics } from '@/hooks/useMetrics'
import type { AdminMetrics } from '@/types'

// ─── MetricCard ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  hint?: string
  accent?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const ACCENT_CLASSES: Record<NonNullable<MetricCardProps['accent']>, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger:  'bg-danger/10 text-danger',
  info:    'bg-info/10 text-info',
}

function MetricCard({ label, value, icon: Icon, hint, accent = 'primary' }: MetricCardProps) {
  return (
    <div className="flex items-start gap-4 p-5 bg-surface border border-border rounded-(--radius) shadow-sm">
      <div className={`rounded-(--radius) p-2.5 shrink-0 ${ACCENT_CLASSES[accent]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
        <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
        {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
      </div>
    </div>
  )
}

// ─── Metrics config ───────────────────────────────────────────────────────────

function buildCards(m: AdminMetrics): MetricCardProps[] {
  return [
    { label: 'Cuidadores activos',  value: m.activeCaregivers,  icon: Users,       accent: 'primary' },
    { label: 'Pacientes activos',   value: m.activePatients,    icon: UserCheck,   accent: 'success' },
    { label: 'Horas del mes',       value: m.monthlyHours,      icon: Clock,       accent: 'info',
      hint: 'horas acumuladas en el período actual' },
    { label: 'Informes pendientes', value: m.pendingReports,    icon: FileText,    accent: 'warning' },
    { label: 'Pagos pendientes',    value: m.pendingPayments,   icon: CreditCard,  accent: 'danger' },
    { label: 'Pagos realizados',    value: m.completedPayments, icon: CheckCircle, accent: 'success' },
  ]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { metrics, loading, error, refetch } = useMetrics()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Resumen operativo del período actual</p>
      </div>

      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={refetch}
        isEmpty={!metrics}
        emptyState={
          <EmptyState
            title="No se pudieron cargar las métricas"
            description="Intentá de nuevo en unos momentos."
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {metrics &&
            buildCards(metrics).map((card) => <MetricCard key={card.label} {...card} />)}
        </div>
      </AsyncBoundary>
    </div>
  )
}
