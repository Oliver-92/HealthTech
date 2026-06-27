import { useState } from 'react'
import { Plus, RefreshCw, Lock, Eye, CreditCard } from 'lucide-react'
import {
  Table, Badge, Button, Pagination,
  Select, LoadingSpinner, EmptyState, ConfirmDialog,
} from '@/components/common'
import { useBilling } from '@/hooks/useBilling'
import { usePaymentReports } from '@/hooks/usePaymentReports'
import { usePayments } from '@/hooks/usePayments'
import { formatDate } from '@/utils/formatDate'
import { formatMoney, formatMinutes } from '@/utils/money'
import { PAYMENT_REPORT_STATUS } from '@/constants/statuses'
import { PeriodFormModal } from './PeriodFormModal'
import { PayModal } from './PayModal'
import type { Column } from '@/components/common'
import type { PayrollPeriod, PaymentReport, Payment, PaymentStatus } from '@/types'

// ── Helpers ──────────────────────────────────────────────────────────────────

const PAYMENT_STATUS_OPTIONS = [
  { value: '',          label: 'Todos los estados' },
  { value: 'CREATED',   label: 'Creado' },
  { value: 'INITIATED', label: 'Iniciado' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'FAILED',    label: 'Fallido' },
]

function formatMonth(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

const canPay = (s: PaymentReport['status']) => s === 'GENERATED' || s === 'PAYMENT_FAILED'

// ── Componente ────────────────────────────────────────────────────────────────

export function Billing() {
  const [activeTab, setActiveTab] = useState<'periods' | 'payments'>('periods')

  // ── Panel A: Períodos ──
  const { periods, loading: loadingPeriods, error: errorPeriods, createPeriod, closePeriod, generateReports } = useBilling()

  const [periodModalOpen, setPeriodModalOpen] = useState(false)
  const [confirmClose,    setConfirmClose]    = useState<PayrollPeriod | null>(null)
  const [closingPeriod,   setClosingPeriod]   = useState(false)
  const [selectedPeriod,  setSelectedPeriod]  = useState<PayrollPeriod | null>(null)
  const [generating,      setGenerating]      = useState<number | null>(null)

  const handleClose = async () => {
    if (!confirmClose) return
    setClosingPeriod(true)
    await closePeriod(confirmClose.id)
    setClosingPeriod(false)
    setConfirmClose(null)
    if (selectedPeriod?.id === confirmClose.id) setSelectedPeriod(null)
  }

  const handleGenerate = async (p: PayrollPeriod) => {
    setGenerating(p.id)
    await generateReports(p.id)
    setGenerating(null)
    setSelectedPeriod(p)
  }

  const periodColumns: Column<PayrollPeriod>[] = [
    {
      key: 'month',
      header: 'Mes',
      render: (p) => <span className="capitalize">{formatMonth(p.month)}</span>,
    },
    {
      key: 'range',
      header: 'Rango',
      render: (p) => `${formatDate(p.startDate)} – ${formatDate(p.endDate)}`,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (p) => (
        <Badge variant={p.isOpen ? 'info' : 'default'}>
          {p.isOpen ? 'Abierto' : 'Cerrado'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-52',
      render: (p) => (
        <div className="flex items-center gap-1">
          {p.isOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleGenerate(p)}
              isLoading={generating === p.id}
              aria-label="Generar liquidaciones"
            >
              <RefreshCw size={15} />
            </Button>
          )}
          {p.isOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmClose(p)}
              aria-label="Cerrar período"
              className="text-warning hover:text-warning"
            >
              <Lock size={15} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPeriod(selectedPeriod?.id === p.id ? null : p)}
            aria-label="Ver liquidaciones"
            className={selectedPeriod?.id === p.id ? 'text-primary' : ''}
          >
            <Eye size={15} />
          </Button>
        </div>
      ),
    },
  ]

  // ── Panel B: Liquidaciones del período seleccionado ──
  const { items: payReports, loading: loadingReports, error: errorReports, pay } = usePaymentReports(
    selectedPeriod?.id ?? null,
  )

  const [payModal, setPayModal] = useState<PaymentReport | null>(null)

  const totalAmount = payReports.reduce((s, r) => s + r.totalAmount, 0)

  const reportColumns: Column<PaymentReport>[] = [
    {
      key: 'caregiver',
      header: 'Cuidador',
      render: (r) => `${r.caregiver.firstName} ${r.caregiver.lastName}`,
    },
    {
      key: 'hours',
      header: 'Tiempo',
      render: (r) => formatMinutes(r.totalTimeMins),
    },
    {
      key: 'amount',
      header: 'Monto',
      render: (r) => <span className="font-medium">{formatMoney(r.totalAmount)}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (r) => {
        const cfg = PAYMENT_REPORT_STATUS[r.status]
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>
      },
    },
    {
      key: 'actions',
      header: 'Acción',
      className: 'w-24',
      render: (r) =>
        canPay(r.status) ? (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<CreditCard size={14} />}
            onClick={() => setPayModal(r)}
          >
            Pagar
          </Button>
        ) : null,
    },
  ]

  // ── Panel C: Pagos ──
  const { items: payments, total: totalPayments, loading: loadingPayments, error: errorPayments,
          statusFilter, page, pageSize, setStatusFilter, setPage } = usePayments()

  const paymentColumns: Column<Payment>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (p) => `#${p.id}`,
    },
    {
      key: 'method',
      header: 'Método',
      render: (p) => p.paymentMethod === 'BANK_TRANSFER' ? 'Transferencia' : 'Mercado Pago',
    },
    {
      key: 'reference',
      header: 'Referencia',
      render: (p) => p.transactionReference ?? '—',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (p) => {
        const variants: Record<string, 'default' | 'info' | 'success' | 'danger'> = {
          CREATED: 'default', INITIATED: 'info', COMPLETED: 'success', FAILED: 'danger',
        }
        const labels: Record<string, string> = {
          CREATED: 'Creado', INITIATED: 'Iniciado', COMPLETED: 'Completado', FAILED: 'Fallido',
        }
        return <Badge variant={variants[p.paymentStatus] ?? 'default'}>{labels[p.paymentStatus] ?? p.paymentStatus}</Badge>
      },
    },
    {
      key: 'completedAt',
      header: 'Fecha',
      render: (p) => formatDate(p.completedAt),
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Facturación</h1>
        <p className="text-sm text-muted mt-1">Períodos, liquidaciones y pagos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['periods', 'payments'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={[
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground',
            ].join(' ')}
          >
            {tab === 'periods' ? 'Períodos' : 'Pagos'}
          </button>
        ))}
      </div>

      {/* ── Panel A + B: Períodos ── */}
      {activeTab === 'periods' && (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex justify-end">
            <Button leftIcon={<Plus size={16} />} onClick={() => setPeriodModalOpen(true)}>
              Nuevo período
            </Button>
          </div>

          {errorPeriods ? (
            <p className="text-sm text-danger">{errorPeriods}</p>
          ) : (
            <Table
              columns={periodColumns}
              data={periods}
              keyField="id"
              isLoading={loadingPeriods}
              emptyMessage="No hay períodos creados"
            />
          )}

          {/* Panel B: Liquidaciones */}
          {selectedPeriod && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground capitalize">
                  Liquidaciones — {formatMonth(selectedPeriod.month)}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedPeriod(null)}
                  className="text-xs text-muted hover:text-foreground ml-auto"
                >
                  Cerrar
                </button>
              </div>

              {loadingReports ? (
                <div className="flex justify-center py-8"><LoadingSpinner /></div>
              ) : errorReports ? (
                <p className="text-sm text-danger">{errorReports}</p>
              ) : payReports.length === 0 ? (
                <EmptyState
                  title="Sin liquidaciones"
                  description="Generá las liquidaciones desde el período para ver los montos."
                />
              ) : (
                <>
                  <Table
                    columns={reportColumns}
                    data={payReports}
                    keyField="id"
                    isLoading={false}
                    emptyMessage="Sin liquidaciones"
                  />
                  <div className="flex justify-end pt-1">
                    <p className="text-sm text-muted">
                      Total período:{' '}
                      <span className="font-semibold text-foreground">{formatMoney(totalAmount)}</span>
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Panel C: Pagos ── */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <Select
            options={PAYMENT_STATUS_OPTIONS}
            value={statusFilter ?? ''}
            onChange={(e) => setStatusFilter(e.target.value ? (e.target.value as PaymentStatus) : undefined)}
            className="w-44"
          />

          {errorPayments ? (
            <p className="text-sm text-danger">{errorPayments}</p>
          ) : loadingPayments ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : (
            <>
              <Table
                columns={paymentColumns}
                data={payments}
                keyField="id"
                isLoading={false}
                emptyMessage="No hay pagos registrados"
              />
              {totalPayments > pageSize && (
                <Pagination page={page} pageSize={pageSize} total={totalPayments} onPageChange={setPage} />
              )}
            </>
          )}
        </div>
      )}

      {/* Modales */}
      <PeriodFormModal
        key={periodModalOpen ? 'period-open' : 'period-closed'}
        open={periodModalOpen}
        onClose={() => setPeriodModalOpen(false)}
        onSubmit={createPeriod}
      />

      <ConfirmDialog
        open={!!confirmClose}
        title="Cerrar período"
        message={`¿Cerrar el período ${confirmClose ? formatMonth(confirmClose.month) : ''}? No se podrán generar más liquidaciones.`}
        onConfirm={handleClose}
        onClose={() => setConfirmClose(null)}
        danger
        isLoading={closingPeriod}
      />

      <PayModal
        key={payModal ? `pay-${payModal.id}` : 'pay-closed'}
        open={!!payModal}
        report={payModal}
        onClose={() => setPayModal(null)}
        onPay={pay}
      />
    </div>
  )
}
