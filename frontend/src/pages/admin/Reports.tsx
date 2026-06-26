import { useState, useEffect } from 'react'
import { Eye, CheckCircle, XCircle } from 'lucide-react'
import { Table, Badge, Button, Pagination, Select } from '@/components/common'
import { useReports } from '@/hooks/useReports'
import { reportService } from '@/services/reportService'
import { handleError } from '@/utils/handleError'
import { formatDate, formatTime } from '@/utils/formatDate'
import { REPORT_STATUS } from '@/constants/statuses'
import { caregiverService } from '@/services/caregiverService'
import { patientService } from '@/services/patientService'
import { unwrapList } from '@/utils/unwrapList'
import { ReportDetailModal } from './ReportDetailModal'
import { RejectModal } from './RejectModal'
import type { Column } from '@/components/common'
import type { Report, ReportStatus } from '@/types'
import type { Caregiver } from '@/types'
import type { Patient } from '@/types'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  ...Object.entries(REPORT_STATUS).map(([v, { label }]) => ({ value: v, label })),
]

export function Reports() {
  const {
    items, total, loading, error,
    caregiverFilter, patientFilter, statusFilter,
    page, pageSize,
    setCaregiverFilter, setPatientFilter, setStatusFilter, setPage,
    approve, reject, refetch,
  } = useReports()

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

  // Modal detalle
  const [detailOpen,   setDetailOpen]   = useState(false)
  const [detailReport, setDetailReport] = useState<Report | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Modal rechazo
  const [rejectOpen,    setRejectOpen]   = useState(false)
  const [rejectReportId, setRejectReportId] = useState<number | null>(null)

  const openDetail = async (id: number) => {
    setLoadingDetail(true)
    setDetailOpen(true)
    try {
      const r = await reportService.getById(id)
      setDetailReport(r)
    } catch (err) {
      handleError(err)
      setDetailOpen(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleApproveFromDetail = async (id: number) => {
    const ok = await approve(id)
    if (ok) setDetailOpen(false)
  }

  const handleRejectFromDetail = (id: number) => {
    setDetailOpen(false)
    setRejectReportId(id)
    setRejectOpen(true)
  }

  const handleRejectDirect = (id: number) => {
    setRejectReportId(id)
    setRejectOpen(true)
  }

  const handleReject = async (id: number, reason: string): Promise<boolean> => {
    const ok = await reject(id, reason)
    if (ok) refetch()
    return ok
  }

  const columns: Column<Report>[] = [
    {
      key: 'date',
      header: 'Fecha guardia',
      render: (r) => (
        <span>
          {formatDate(r.shift.date)}{' '}
          <span className="text-muted text-xs">
            {formatTime(r.shift.startTime)}–{formatTime(r.shift.endTime)}
          </span>
        </span>
      ),
    },
    {
      key: 'caregiver',
      header: 'Cuidador',
      render: (r) => `${r.caregiver.firstName} ${r.caregiver.lastName}`,
    },
    {
      key: 'patient',
      header: 'Paciente',
      render: (r) => `${r.patient.firstName} ${r.patient.lastName}`,
    },
    {
      key: 'workedMinutes',
      header: 'Minutos',
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
      header: 'Acciones',
      className: 'w-28',
      render: (r) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => openDetail(r.id)} aria-label="Ver detalle">
            <Eye size={15} />
          </Button>
          {r.status === 'SUBMITTED' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => approve(r.id)}
                aria-label="Aprobar"
                className="text-success hover:text-success"
              >
                <CheckCircle size={15} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRejectDirect(r.id)}
                aria-label="Rechazar"
                className="text-danger hover:text-danger"
              >
                <XCircle size={15} />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Informes</h1>
        <p className="text-sm text-muted mt-1">Revisión y aprobación de informes de cuidadores</p>
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
          onChange={(e) => setStatusFilter(e.target.value ? (e.target.value as ReportStatus) : undefined)}
          className="w-44"
        />
      </div>

      {error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : (
        <>
          <Table
            columns={columns}
            data={items}
            keyField="id"
            isLoading={loading}
            emptyMessage="No se encontraron informes"
          />
          {total > pageSize && (
            <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
          )}
        </>
      )}

      <ReportDetailModal
        open={detailOpen && !loadingDetail}
        report={detailReport}
        onClose={() => setDetailOpen(false)}
        onApprove={handleApproveFromDetail}
        onReject={handleRejectFromDetail}
      />

      <RejectModal
        open={rejectOpen}
        reportId={rejectReportId}
        onClose={() => setRejectOpen(false)}
        onReject={handleReject}
      />
    </div>
  )
}
