import { Link } from 'react-router-dom'
import {
  Users, UserRound, CalendarDays, ClipboardList, CreditCard, BarChart3,
  ShieldCheck, HeartHandshake, Eye, ArrowRight, Check,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ThemeToggle } from '@/components/common'

// ── Datos ──────────────────────────────────────────────────────────────────────

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const FEATURES: Feature[] = [
  { icon: Users,        title: 'Gestión de cuidadores', description: 'Alta, edición y baja del equipo, con tarifas por hora y documentación requerida.' },
  { icon: UserRound,    title: 'Gestión de pacientes',  description: 'Fichas completas de cada paciente y su asociación con los cuidadores asignados.' },
  { icon: CalendarDays, title: 'Guardias',              description: 'Asignación por fecha y horario, control de estados y validación de solapamientos.' },
  { icon: ClipboardList, title: 'Informes por guardia', description: 'Carga de horas, observaciones, medicación y signos vitales en cada visita.' },
  { icon: CreditCard,   title: 'Facturación y pagos',   description: 'Liquidaciones por período, cálculo de horas y ejecución de pagos a cuidadores.' },
  { icon: BarChart3,    title: 'Métricas',              description: 'Panel administrativo con indicadores operativos del período en tiempo real.' },
]

interface RoleInfo {
  icon: LucideIcon
  title: string
  description: string
  points: string[]
}

const ROLES: RoleInfo[] = [
  {
    icon: ShieldCheck,
    title: 'Administrador',
    description: 'Controla toda la operación desde un único panel.',
    points: ['Equipo, pacientes y guardias', 'Revisión de informes', 'Pagos y métricas'],
  },
  {
    icon: HeartHandshake,
    title: 'Cuidador',
    description: 'Acompaña al paciente y deja registro de cada visita.',
    points: ['Sus guardias asignadas', 'Carga de informes', 'Estado de sus reportes'],
  },
  {
    icon: Eye,
    title: 'Familiar / Paciente',
    description: 'Sigue de cerca el cuidado, en modo solo lectura.',
    points: ['Informes aprobados', 'Detalle de cada guardia', 'Acceso seguro por rol'],
  },
]

const BENEFITS = [
  { title: 'Trazabilidad total', description: 'Cada guardia, informe y pago queda registrado y auditable.' },
  { title: 'Acceso por rol',     description: 'Cada persona ve solo la información que le corresponde.' },
  { title: 'Multidispositivo',   description: 'Funciona en el navegador, sin instalar nada, en cualquier pantalla.' },
]

// ── Subcomponentes ──────────────────────────────────────────────────────────────

const primaryCta =
  'inline-flex items-center justify-center gap-2 rounded-(--radius) bg-primary px-5 h-11 ' +
  'font-medium text-primary-foreground hover:opacity-90 transition-opacity'

const secondaryCta =
  'inline-flex items-center justify-center gap-2 rounded-(--radius) border border-border bg-surface px-5 h-11 ' +
  'font-medium text-foreground hover:bg-surface-2 transition-colors'

function FeatureCard({ icon: Icon, title, description }: Feature) {
  return (
    <article className="rounded-(--radius) border border-border bg-surface p-6 transition-colors hover:border-primary/50">
      <div
        aria-hidden="true"
        className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-(--radius) bg-primary/10 text-primary"
      >
        <Icon size={22} />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted">{description}</p>
    </article>
  )
}

function RoleCard({ icon: Icon, title, description, points }: RoleInfo) {
  return (
    <article className="flex flex-col rounded-(--radius) border border-border bg-surface p-6">
      <div
        aria-hidden="true"
        className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-(--radius) bg-primary/10 text-primary"
      >
        <Icon size={22} />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted">{description}</p>
      <ul className="mt-4 space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm text-foreground">
            <Check size={16} className="shrink-0 text-primary" aria-hidden="true" />
            {p}
          </li>
        ))}
      </ul>
    </article>
  )
}

// Mock visual del panel (decorativo)
function DashboardPreview() {
  const tiles = [
    { icon: Users, label: 'Cuidadores', value: '12' },
    { icon: UserRound, label: 'Pacientes', value: '48' },
    { icon: CalendarDays, label: 'Horas del mes', value: '320' },
    { icon: CreditCard, label: 'Pagos', value: '8' },
  ]
  return (
    <div aria-hidden="true" className="relative">
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Panel administrativo</span>
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {tiles.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-(--radius) border border-border bg-surface-2 p-3">
              <Icon size={18} className="text-primary" />
              <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex h-24 items-end gap-2 rounded-(--radius) border border-border bg-surface-2 p-3">
          {[40, 65, 50, 80, 60, 95, 70].map((h, i) => (
            <span key={i} className="flex-1 rounded-sm bg-primary/70" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export function Landing() {
  const year = new Date().getFullYear()

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Skip link */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-(--radius) focus:border focus:border-border focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        Saltar al contenido
      </a>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <a href="#inicio" className="text-lg font-bold tracking-tight">
            Health<span className="text-primary">Tech</span>
          </a>
          <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-2">
            <a href="#funcionalidades" className="hidden rounded-(--radius) px-3 py-2 text-sm text-muted transition-colors hover:text-foreground sm:inline">
              Funcionalidades
            </a>
            <a href="#roles" className="hidden rounded-(--radius) px-3 py-2 text-sm text-muted transition-colors hover:text-foreground sm:inline">
              Roles
            </a>
            <ThemeToggle />
            <Link
              to="/login"
              className="inline-flex h-9 items-center justify-center rounded-(--radius) bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ingresar
            </Link>
          </nav>
        </div>
      </header>

      <main id="contenido">
        {/* Hero */}
        <section id="inicio" className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          </div>
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:py-28 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                Demo interactiva
              </span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                El cuidado domiciliario, digitalizado de punta a punta
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted">
                Centralizá cuidadores, pacientes, guardias, informes y pagos en una sola
                plataforma. Dejá atrás las planillas de Excel y los grupos de WhatsApp.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/login" className={primaryCta}>
                  Probar la demo
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <a href="#funcionalidades" className={secondaryCta}>
                  Conocer más
                </a>
              </div>
              <p className="mt-4 text-sm text-muted">Sin registro · datos de ejemplo</p>
            </div>
            <DashboardPreview />
          </div>
        </section>

        {/* Funcionalidades */}
        <section
          id="funcionalidades"
          aria-labelledby="funcionalidades-titulo"
          className="scroll-mt-20 border-y border-border bg-surface-2/40 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="funcionalidades-titulo" className="text-3xl font-bold tracking-tight text-foreground">
                Todo lo que tu operación necesita
              </h2>
              <p className="mt-3 text-muted">
                Módulos pensados para digitalizar y ordenar cada etapa del servicio de acompañamiento.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* Roles */}
        <section id="roles" aria-labelledby="roles-titulo" className="scroll-mt-20 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="roles-titulo" className="text-3xl font-bold tracking-tight text-foreground">
                Una experiencia para cada rol
              </h2>
              <p className="mt-3 text-muted">
                El sistema se adapta a quién lo usa: cada rol ve y hace exactamente lo que necesita.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {ROLES.map((r) => (
                <RoleCard key={r.title} {...r} />
              ))}
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section aria-labelledby="beneficios-titulo" className="border-y border-border bg-surface-2/40 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 id="beneficios-titulo" className="sr-only">Beneficios</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {BENEFITS.map((b) => (
                <div key={b.title} className="flex gap-3">
                  <Check size={22} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-foreground">{b.title}</h3>
                    <p className="mt-1 text-sm text-muted">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-4">
            <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-surface p-8 text-center sm:p-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Explorá la demo con datos de ejemplo
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-muted">
                Ingresá con un usuario de prueba y recorré la plataforma desde cada rol.
                No necesitás registrarte.
              </p>
              <div className="mt-8 flex justify-center">
                <Link to="/login" className={primaryCta}>
                  Ingresar a la demo
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm sm:flex-row">
          <span className="font-bold">
            Health<span className="text-primary">Tech</span>
          </span>
          <span className="text-muted">Demo con datos ficticios · {year}</span>
        </div>
      </footer>
    </div>
  )
}
