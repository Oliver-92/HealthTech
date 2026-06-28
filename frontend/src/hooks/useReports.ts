import { useState } from 'react'
import { toast } from 'react-toastify'
import { reportService } from '@/services/reportService'
import { handleError } from '@/utils/handleError'
import { useResourceList } from './useResourceList'
import type { Report, ReportStatus } from '@/types'

const PAGE_SIZE = 10

export function useReports() {
  const [caregiverFilter, setCaregiverFilterState] = useState<number | undefined>()
  const [patientFilter,   setPatientFilterState]   = useState<number | undefined>()
  const [statusFilter,    setStatusFilterState]    = useState<ReportStatus | undefined>()
  const [page, setPageState] = useState(1)

  const { items, total, loading, error, refetch, startLoading } = useResourceList<Report>(
    () => reportService.list({
      caregiverId: caregiverFilter, patientId: patientFilter, status: statusFilter,
      page, pageSize: PAGE_SIZE,
    }),
    [caregiverFilter, patientFilter, statusFilter, page],
  )

  const setCaregiverFilter = (v?: number) => { setCaregiverFilterState(v); setPageState(1); startLoading() }
  const setPatientFilter   = (v?: number) => { setPatientFilterState(v);   setPageState(1); startLoading() }
  const setStatusFilter    = (v?: ReportStatus) => { setStatusFilterState(v); setPageState(1); startLoading() }
  const setPage            = (n: number) => { setPageState(n); startLoading() }

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
