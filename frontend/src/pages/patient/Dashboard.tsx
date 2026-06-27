import { useNavigate } from 'react-router-dom'
import { FileText, ClipboardCheck, CalendarDays } from 'lucide-react'
import { Card, Button, EmptyState, AsyncBoundary } from '@/components/common'
import { useAuthStore } from '@/store/authStore'
import { useMyReports } from '@/hooks/useMyReports'
import { formatDate, formatTime } from '@/utils/formatDate'

export function PatientDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { items: reports, loading, error, refetch } = useMyReports()

  const latest = reports[0] ?? null
  const total  = reports.length

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bienvenido/a</h1>
        <p className="text-sm text-muted mt-1">{user?.email}</p>
      </div>

      <AsyncBoundary loading={loading} error={error} onRetry={refetch}>
        <>
          {/* Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="flex items-center gap-4">
              <ClipboardCheck size={28} className="text-success shrink-0" />
              <div>
                <p className="text-2xl font-bold text-foreground">{total}</p>
                <p className="text-sm text-muted">
                  {total === 1 ? 'Informe disponible' : 'Informes disponibles'}
                </p>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <CalendarDays size={28} className="text-primary shrink-0" />
              <div>
                {latest ? (
                  <>
                    <p className="text-sm font-semibold text-foreground">
                      Última guardia
                    </p>
                    <p className="text-sm text-muted">
                      {formatDate(latest.shift.date)} · {formatTime(latest.shift.startTime)}–{formatTime(latest.shift.endTime)}
                    </p>
                    <p className="text-xs text-muted">
                      {latest.caregiver.firstName} {latest.caregiver.lastName}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted">Sin guardias registradas</p>
                )}
              </div>
            </Card>
          </div>

          {/* Acceso rápido */}
          {total === 0 ? (
            <EmptyState
              title="Sin informes disponibles"
              description="Cuando el equipo de cuidadores cargue y apruebe informes, aparecerán aquí."
              icon={<FileText size={32} className="text-muted" />}
            />
          ) : (
            <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">Mis informes</p>
                <p className="text-sm text-muted">
                  Consultá el detalle de cada guardia realizada por tu cuidador.
                </p>
              </div>
              <Button
                leftIcon={<FileText size={16} />}
                onClick={() => navigate('/patient/reports')}
                className="shrink-0"
              >
                Ver informes
              </Button>
            </Card>
          )}
        </>
      </AsyncBoundary>
    </div>
  )
}
