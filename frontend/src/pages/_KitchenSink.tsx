import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Inbox, CheckCircle, XCircle } from 'lucide-react'
import {
  ThemeToggle,
  Button,
  Input,
  Textarea,
  Select,
  Card,
  Modal,
  Badge,
  LoadingSpinner,
  EmptyState,
  Table,
  Pagination,
  ErrorBoundary,
} from '@/components/common'
import type { Column } from '@/components/common'
import { authService } from '@/services/authService'
import { caregiverService } from '@/services/caregiverService'
import { useAuthStore } from '@/store/authStore'
import { handleError } from '@/utils/handleError'
import { formatDate, formatTime } from '@/utils/formatDate'
import { formatMoney, formatMinutes } from '@/utils/money'
import { unwrapList } from '@/utils/unwrapList'
import { SHIFT_STATUS, REPORT_STATUS } from '@/constants/statuses'
import type { Caregiver } from '@/types'

// ── Componente roto para ErrorBoundary ──────────────────────────────────────

function BrokenComponent(): React.ReactNode {
  throw new Error('Error de prueba desde BrokenComponent')
}

// ── Datos dummy para Table (Etapa 1) ────────────────────────────────────────

interface DummyUser {
  id: number
  name: string
  role: string
  status: string
}

const DUMMY_DATA: DummyUser[] = [
  { id: 1, name: 'Ana García', role: 'Cuidadora', status: 'Activa' },
  { id: 2, name: 'Luis Pérez', role: 'Cuidador', status: 'Activo' },
  { id: 3, name: 'María López', role: 'Paciente', status: 'Activa' },
]

const DUMMY_COLUMNS: Column<DummyUser>[] = [
  { key: 'id', header: '#', className: 'w-12' },
  { key: 'name', header: 'Nombre' },
  { key: 'role', header: 'Rol' },
  {
    key: 'status',
    header: 'Estado',
    render: (row) => <Badge variant="success">{row.status}</Badge>,
  },
]

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'caregiver', label: 'Cuidador' },
  { value: 'patient', label: 'Paciente' },
]

// ── Columnas de cuidadores para smoke test ───────────────────────────────────

const CAREGIVER_COLUMNS: Column<Caregiver>[] = [
  { key: 'id', header: '#', className: 'w-12' },
  {
    key: 'name',
    header: 'Nombre',
    render: (c) => `${c.firstName} ${c.lastName}`,
  },
  { key: 'documentId', header: 'Documento' },
  {
    key: 'hourlyRate',
    header: 'Tarifa/h',
    render: (c) => formatMoney(c.hourlyRate),
  },
  {
    key: 'hiredAt',
    header: 'Ingreso',
    render: (c) => formatDate(c.hiredAt),
  },
  {
    key: 'isActive',
    header: 'Estado',
    render: (c) => (
      <Badge variant={c.isActive ? 'success' : 'default'}>
        {c.isActive ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  },
]

// ── Sección auxiliar ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
        {title}
      </h2>
      {children}
    </section>
  )
}

// ── Check visual ─────────────────────────────────────────────────────────────

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok
        ? <CheckCircle size={16} className="text-success shrink-0" />
        : <XCircle size={16} className="text-danger shrink-0" />}
      <span className={ok ? 'text-foreground' : 'text-muted'}>{label}</span>
    </div>
  )
}

// ── Smoke test — Etapa 2 ─────────────────────────────────────────────────────

function SmokeTest() {
  const { user, token, role, isAuthenticated, login, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [caregiversTotal, setCaregiversTotal] = useState(0)
  const [caregiversLoading, setCaregiversLoading] = useState(false)

  const persistedRaw = (() => {
    try { return localStorage.getItem('healthtech-auth') ?? '—' } catch { return '—' }
  })()

  const doLogin = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await authService.login({ email, password })
      login(res.token, res.user)
      toast.success(`Sesión iniciada como ${res.user.role}`)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const doLoginBad = async () => {
    setLoading(true)
    try {
      await authService.login({ email: 'x@x.com', password: 'wrong' })
    } catch (err) {
      handleError(err, 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  const loadCaregivers = async () => {
    setCaregiversLoading(true)
    try {
      const res = await caregiverService.list({ page: 1, pageSize: 10 })
      const { data, total } = unwrapList(res)
      setCaregivers(data)
      setCaregiversTotal(total)
    } catch (err) {
      handleError(err)
    } finally {
      setCaregiversLoading(false)
    }
  }

  // Carga cuidadores automáticamente al montar
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadCaregivers() }, [])

  return (
    <Section title="Smoke Test — Etapa 2 (infraestructura)">

      {/* Auth store */}
      <Card title="authService + authStore + persist">
        <div className="space-y-4">

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              isLoading={loading}
              onClick={() => doLogin('admin@healthtech.com', 'Admin1234!')}
            >
              Login ADMIN
            </Button>
            <Button
              size="sm"
              variant="secondary"
              isLoading={loading}
              onClick={() => doLogin('maria.lopez@healthtech.com', 'Caregiver1234!')}
            >
              Login CAREGIVER
            </Button>
            <Button
              size="sm"
              variant="secondary"
              isLoading={loading}
              onClick={() => doLogin('familia.garcia@healthtech.com', 'Patient1234!')}
            >
              Login PATIENT
            </Button>
            <Button
              size="sm"
              variant="danger"
              isLoading={loading}
              onClick={doLoginBad}
            >
              Login inválido
            </Button>
            <Button size="sm" variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>

          <div className="space-y-1.5">
            <Check ok={isAuthenticated} label={`isAuthenticated: ${String(isAuthenticated)}`} />
            <Check ok={!!token} label={`token: ${token ?? '—'}`} />
            <Check ok={!!role} label={`role: ${role ?? '—'}`} />
            <Check ok={!!user} label={`user: ${user ? `${user.email} (id ${user.id})` : '—'}`} />
          </div>

          <div className="rounded-[--radius] border border-border bg-surface-2 p-3">
            <p className="text-xs text-muted mb-1 font-medium">localStorage['healthtech-auth']</p>
            <p className="text-xs text-foreground font-mono break-all">{persistedRaw}</p>
          </div>

          <p className="text-xs text-muted">
            Recargá la página después de hacer login — la sesión debe persistir (isAuthenticated y role
            recalculados via onRehydrateStorage).
          </p>
        </div>
      </Card>

      {/* Servicios + unwrapList */}
      <Card title="caregiverService.list + unwrapList">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={loadCaregivers} isLoading={caregiversLoading}>
              Recargar
            </Button>
            <span className="text-sm text-muted">
              Total: <span className="text-foreground font-medium">{caregiversTotal}</span>
            </span>
          </div>
          <Table
            columns={CAREGIVER_COLUMNS}
            data={caregivers}
            keyField="id"
            isLoading={caregiversLoading}
          />
        </div>
      </Card>

      {/* Utilidades */}
      <Card title="Utilidades (formatDate, money, unwrapList)">
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted font-medium">formatDate</p>
            <p>{formatDate('2026-06-25T00:00:00.000Z')} — ISO completo</p>
            <p>{formatDate(null)} — null</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted font-medium">formatTime</p>
            <p>{formatTime('08:00')} — inicio turno</p>
            <p>{formatTime('22:00')} — turno nocturno</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted font-medium">formatMoney</p>
            <p>{formatMoney(1500)} — tarifa/h</p>
            <p>{formatMoney(18000)} — liquidación</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted font-medium">formatMinutes</p>
            <p>{formatMinutes(360)} — 6 horas exactas</p>
            <p>{formatMinutes(90)} — 1h 30m</p>
            <p>{formatMinutes(45)} — solo minutos</p>
          </div>
        </div>
      </Card>

      {/* Constantes de estado */}
      <Card title="Constantes statuses → Badge">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted mb-2 font-medium">SHIFT_STATUS</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(SHIFT_STATUS) as [string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }][]).map(([key, { label, variant }]) => (
                <div key={key} className="flex flex-col items-center gap-1">
                  <Badge variant={variant}>{label}</Badge>
                  <span className="text-xs text-muted">{key}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted mb-2 font-medium">REPORT_STATUS</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(REPORT_STATUS) as [string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }][]).map(([key, { label, variant }]) => (
                <div key={key} className="flex flex-col items-center gap-1">
                  <Badge variant={variant}>{label}</Badge>
                  <span className="text-xs text-muted">{key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

    </Section>
  )
}

// ── KitchenSink principal ────────────────────────────────────────────────────

export function KitchenSink() {
  const [modalOpen, setModalOpen] = useState(false)
  const [showError, setShowError] = useState(false)
  const [page, setPage] = useState(1)

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 bg-surface border-b border-border shadow-sm">
        <h1 className="text-base font-semibold">HealthTech — Kitchen Sink</h1>
        <ThemeToggle />
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-12">

        {/* 0 — Smoke test Etapa 2 */}
        <SmokeTest />

        {/* 1 — Badges */}
        <Section title="Badge">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Activo</Badge>
            <Badge variant="warning">Pendiente</Badge>
            <Badge variant="danger">Rechazado</Badge>
            <Badge variant="info">En progreso</Badge>
          </div>
        </Section>

        {/* 2 — LoadingSpinner */}
        <Section title="LoadingSpinner">
          <div className="flex items-center gap-6">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
          </div>
        </Section>

        {/* 3 — Buttons */}
        <Section title="Button — variantes × tamaños">
          {(['primary', 'secondary', 'outline', 'ghost', 'danger'] as const).map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-2">
              {(['sm', 'md', 'lg'] as const).map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {variant} {size}
                </Button>
              ))}
              <Button variant={variant} isLoading>
                Loading
              </Button>
            </div>
          ))}
        </Section>

        {/* 4 — Formularios */}
        <Section title="Input / Textarea / Select">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nombre" placeholder="Ej. Ana García" />
            <Input label="Email con error" placeholder="email@ejemplo.com" error="El email no es válido" />
            <Input label="Con hint" placeholder="Escribí algo" hint="Máximo 100 caracteres" />
            <Input label="Con ícono" placeholder="Buscar..." leftIcon={<span className="text-xs">🔍</span>} />
            <Select label="Rol" options={ROLE_OPTIONS} placeholder="Seleccioná un rol" />
            <Select label="Rol con error" options={ROLE_OPTIONS} error="Debés seleccionar un rol" />
            <div className="sm:col-span-2">
              <Textarea label="Observaciones" placeholder="Escribí tus observaciones aquí..." rows={3} />
            </div>
            <div className="sm:col-span-2">
              <Textarea label="Con error" placeholder="..." error="Este campo es obligatorio" />
            </div>
          </div>
        </Section>

        {/* 5 — Card */}
        <Section title="Card">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Tarjeta con título">
              <p className="text-sm text-muted">Contenido del cuerpo de la tarjeta.</p>
            </Card>
            <Card
              title="Con footer"
              footer={
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Cancelar</Button>
                  <Button size="sm">Guardar</Button>
                </div>
              }
            >
              <p className="text-sm text-muted">Tarjeta con footer con acciones.</p>
            </Card>
          </div>
        </Section>

        {/* 6 — Modal */}
        <Section title="Modal">
          <div className="flex gap-2">
            <Button onClick={() => setModalOpen(true)}>Abrir modal</Button>
          </div>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Modal de ejemplo"
            footer={
              <>
                <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
                <Button onClick={() => { toast.success('Acción confirmada'); setModalOpen(false) }}>
                  Confirmar
                </Button>
              </>
            }
          >
            <p className="text-sm text-muted">
              Probá cerrar con <strong className="text-foreground">Escape</strong>, haciendo click
              en el backdrop, o con el botón X. El scroll del body está bloqueado mientras está abierto.
            </p>
          </Modal>
        </Section>

        {/* 7 — Table */}
        <Section title="Table">
          <p className="text-sm text-muted -mt-2">Con datos + Pagination</p>
          <Table columns={DUMMY_COLUMNS} data={DUMMY_DATA} keyField="id" />
          <Pagination page={page} pageSize={2} total={7} onPageChange={setPage} />

          <p className="text-sm text-muted mt-4">Estado loading</p>
          <Table columns={DUMMY_COLUMNS} data={[]} keyField="id" isLoading />

          <p className="text-sm text-muted mt-4">Estado vacío</p>
          <Table columns={DUMMY_COLUMNS} data={[]} keyField="id" emptyMessage="No se encontraron resultados" />
        </Section>

        {/* 8 — EmptyState */}
        <Section title="EmptyState">
          <Card>
            <EmptyState
              icon={<Inbox />}
              title="Sin notificaciones"
              description="Cuando haya actividad nueva, aparecerá aquí."
              action={<Button size="sm" variant="outline">Actualizar</Button>}
            />
          </Card>
        </Section>

        {/* 9 — Toast */}
        <Section title="Notificaciones (Toast)">
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => toast.success('Operación exitosa')}>Success</Button>
            <Button variant="danger" onClick={() => toast.error('Ocurrió un error')}>Error</Button>
            <Button variant="outline" onClick={() => toast.warning('Atención')}>Warning</Button>
            <Button variant="ghost" onClick={() => toast.info('Información')}>Info</Button>
          </div>
        </Section>

        {/* 10 — ErrorBoundary */}
        <Section title="ErrorBoundary">
          <p className="text-sm text-muted -mt-2">
            Activá el toggle para montar un componente que lanza un error.
          </p>
          <Button
            variant={showError ? 'danger' : 'outline'}
            onClick={() => setShowError((v) => !v)}
          >
            {showError ? 'Desactivar error' : 'Activar error'}
          </Button>
          {showError && (
            <ErrorBoundary>
              <BrokenComponent />
            </ErrorBoundary>
          )}
        </Section>

      </main>
    </div>
  )
}
