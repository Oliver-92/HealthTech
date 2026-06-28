import { useState } from 'react'
import { reportService } from '@/services/reportService'
import { useResourceList } from './useResourceList'
import type { Report, ReportStatus } from '@/types'

export function useMyReports(initialStatus?: ReportStatus) {
  const [statusFilter, setStatusFilterState] = useState<ReportStatus | undefined>(initialStatus)

  const { items, loading, error, refetch, startLoading } = useResourceList<Report>(
    () => reportService.listMine({ status: statusFilter }),
    [statusFilter],
  )

  const setStatusFilter = (v?: ReportStatus) => { setStatusFilterState(v); startLoading() }

  return { items, loading, error, statusFilter, setStatusFilter, refetch }
}
