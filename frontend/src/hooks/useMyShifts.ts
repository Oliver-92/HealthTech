import { useState, useEffect } from 'react'
import { shiftService } from '@/services/shiftService'
import { handleError } from '@/utils/handleError'
import { unwrapList } from '@/utils/unwrapList'
import type { Shift, ShiftStatus } from '@/types'

export function useMyShifts() {
  const [items, setItems]   = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [tick, setTick]     = useState(0)

  const [statusFilter, setStatusFilterState] = useState<ShiftStatus | undefined>()
  const [fromFilter,   setFromFilterState]   = useState<string | undefined>()
  const [toFilter,     setToFilterState]     = useState<string | undefined>()

  useEffect(() => {
    let cancelled = false
    shiftService
      .listMine({ status: statusFilter, from: fromFilter, to: toFilter })
      .then((res) => {
        if (cancelled) return
        const { data } = unwrapList(res)
        setItems(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        handleError(err)
        setError(err instanceof Error ? err.message : 'Error al cargar guardias')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [statusFilter, fromFilter, toFilter, tick])

  const refetch = () => { setTick((t) => t + 1); setLoading(true) }

  const setStatusFilter = (v?: ShiftStatus) => { setStatusFilterState(v); setLoading(true) }
  const setFromFilter   = (v?: string) => { setFromFilterState(v); setLoading(true) }
  const setToFilter     = (v?: string) => { setToFilterState(v); setLoading(true) }

  return {
    items, loading, error,
    statusFilter, fromFilter, toFilter,
    setStatusFilter, setFromFilter, setToFilter,
    refetch,
  }
}
