import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { reportService } from '@/services/reportService'
import { handleError } from '@/utils/handleError'
import { unwrapList } from '@/utils/unwrapList'
import type { Report, ReportStatus, ReportListParams } from '@/types'

const PAGE_SIZE = 10

export function useReports() {
  const [items, setItems]   = useState<Report[]>([])
  const [total, setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [tick, setTick]     = useState(0)

  const [caregiverFilter, setCaregiverFilterState] = useState<number | undefined>()
  const [patientFilter,   setPatientFilterState]   = useState<number | undefined>()
  const [statusFilter,    setStatusFilterState]    = useState<ReportStatus | undefined>()
  const [page, setPageState] = useState(1)

  useEffect(() => {
    let cancelled = false
    const params: ReportListParams = {
      caregiverId: caregiverFilter,
      patientId:   patientFilter,
      status:      statusFilter,
      page,
      pageSize:    PAGE_SIZE,
    }
    reportService
      .list(params)
      .then((res) => {
        if (cancelled) return
        const { data, total: t } = unwrapList(res)
        setItems(data)
        setTotal(t)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Error al cargar informes')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [caregiverFilter, patientFilter, statusFilter, page, tick])

  const refetch = () => { setTick((t) => t + 1); setLoading(true) }

  const setCaregiverFilter = (v?: number) => { setCaregiverFilterState(v); setPageState(1); setLoading(true) }
  const setPatientFilter   = (v?: number) => { setPatientFilterState(v);   setPageState(1); setLoading(true) }
  const setStatusFilter    = (v?: ReportStatus) => { setStatusFilterState(v); setPageState(1); setLoading(true) }
  const setPage            = (n: number) => { setPageState(n); setLoading(true) }

  const approve = async (id: number): Promise<boolean> => {
    try {
      await reportService.approve(id)
      toast.success('Informe aprobado')
      refetch()
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  const reject = async (id: number, reason: string): Promise<boolean> => {
    try {
      await reportService.reject(id, { reason })
      toast.success('Informe rechazado')
      refetch()
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  return {
    items, total, loading, error,
    caregiverFilter, patientFilter, statusFilter,
    page, pageSize: PAGE_SIZE,
    setCaregiverFilter, setPatientFilter, setStatusFilter, setPage,
    refetch, approve, reject,
  }
}
