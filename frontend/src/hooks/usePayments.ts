import { useState, useEffect } from 'react'
import { billingService } from '@/services/billingService'
import { handleError } from '@/utils/handleError'
import { unwrapList } from '@/utils/unwrapList'
import type { Payment, PaymentStatus } from '@/types'

const PAGE_SIZE = 10

export function usePayments() {
  const [items,   setItems]   = useState<Payment[]>([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [tick,    setTick]    = useState(0)

  const [statusFilter, setStatusFilterState] = useState<PaymentStatus | undefined>()
  const [page,         setPageState]         = useState(1)

  useEffect(() => {
    let cancelled = false
    billingService
      .listPayments({ status: statusFilter, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return
        const { data, total: t } = unwrapList(res)
        setItems(data)
        setTotal(t)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        handleError(err)
        setError(err instanceof Error ? err.message : 'Error al cargar pagos')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [statusFilter, page, tick])

  const setStatusFilter = (v?: PaymentStatus) => { setStatusFilterState(v); setPageState(1); setLoading(true) }
  const setPage         = (n: number)          => { setPageState(n); setLoading(true) }
  const refetch         = ()                   => { setTick((t) => t + 1); setLoading(true) }

  return {
    items, total, loading, error,
    statusFilter, page, pageSize: PAGE_SIZE,
    setStatusFilter, setPage, refetch,
  }
}
