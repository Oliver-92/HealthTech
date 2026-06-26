import { useState, useEffect } from 'react'
import { reportService } from '@/services/reportService'
import { handleError } from '@/utils/handleError'
import { unwrapList } from '@/utils/unwrapList'
import type { Report, ReportStatus } from '@/types'

export function useMyReports(initialStatus?: ReportStatus) {
  const [items, setItems]   = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [tick, setTick]     = useState(0)

  const [statusFilter, setStatusFilterState] = useState<ReportStatus | undefined>(initialStatus)

  useEffect(() => {
    let cancelled = false
    reportService
      .listMine({ status: statusFilter })
      .then((res) => {
        if (cancelled) return
        const { data } = unwrapList(res)
        setItems(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        handleError(err)
        setError(err instanceof Error ? err.message : 'Error al cargar informes')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [statusFilter, tick])

  const refetch = () => { setTick((t) => t + 1); setLoading(true) }

  const setStatusFilter = (v?: ReportStatus) => { setStatusFilterState(v); setLoading(true) }

  return { items, loading, error, statusFilter, setStatusFilter, refetch }
}
