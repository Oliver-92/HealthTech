import { useState } from 'react'
import { shiftService } from '@/services/shiftService'
import { useResourceList } from './useResourceList'
import type { Shift, ShiftStatus } from '@/types'

export function useMyShifts() {
  const [statusFilter, setStatusFilterState] = useState<ShiftStatus | undefined>()
  const [fromFilter,   setFromFilterState]   = useState<string | undefined>()
  const [toFilter,     setToFilterState]     = useState<string | undefined>()

  const { items, loading, error, refetch, startLoading } = useResourceList<Shift>(
    () => shiftService.listMine({ status: statusFilter, from: fromFilter, to: toFilter }),
    [statusFilter, fromFilter, toFilter],
  )

  const setStatusFilter = (v?: ShiftStatus) => { setStatusFilterState(v); startLoading() }
  const setFromFilter   = (v?: string) => { setFromFilterState(v); startLoading() }
  const setToFilter     = (v?: string) => { setToFilterState(v); startLoading() }

  return {
    items, loading, error,
    statusFilter, fromFilter, toFilter,
    setStatusFilter, setFromFilter, setToFilter,
    refetch,
  }
}
