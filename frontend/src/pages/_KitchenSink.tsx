import { useState } from 'react'
import { toast } from 'react-toastify'
import { Inbox } from 'lucide-react'
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

// — Error thrower para probar ErrorBoundary —
function BrokenComponent(): React.ReactNode {
  throw new Error('Error de prueba desde BrokenComponent')
}

// — Datos dummy para Table —
interface User {
  id: number
  name: string
  role: string
  status: string
}

const DUMMY_DATA: User[] = [
  { id: 1, name: 'Ana García', role: 'Cuidadora', status: 'Activa' },
  { id: 2, name: 'Luis Pérez', role: 'Cuidador', status: 'Activo' },
  { id: 3, name: 'María López', role: 'Paciente', status: 'Activa' },
]

const COLUMNS: Column<User>[] = [
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

// — Sección auxiliar para separar bloques —
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">{title}</h2>
      {children}
    </section>
  )
}

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

        {/* 7 — Table con datos / loading / vacía */}
        <Section title="Table">
          <p className="text-sm text-muted -mt-2">Con datos + Pagination</p>
          <Table columns={COLUMNS} data={DUMMY_DATA} keyField="id" />
          <Pagination page={page} pageSize={2} total={7} onPageChange={setPage} />

          <p className="text-sm text-muted mt-4">Estado loading</p>
          <Table columns={COLUMNS} data={[]} keyField="id" isLoading />

          <p className="text-sm text-muted mt-4">Estado vacío</p>
          <Table
            columns={COLUMNS}
            data={[]}
            keyField="id"
            emptyMessage="No se encontraron resultados"
          />
        </Section>

        {/* 8 — EmptyState standalone */}
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
            <Button variant="primary" onClick={() => toast.success('Operación exitosa')}>
              Success
            </Button>
            <Button variant="danger" onClick={() => toast.error('Ocurrió un error')}>
              Error
            </Button>
            <Button variant="outline" onClick={() => toast.warning('Atención')}>
              Warning
            </Button>
            <Button variant="ghost" onClick={() => toast.info('Información')}>
              Info
            </Button>
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
