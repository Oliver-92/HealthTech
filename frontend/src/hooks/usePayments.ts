import { useState } from 'react'
import { billingService } from '@/services/billingService'
import { useResourceList } from './useResourceList'
import type { Payment, PaymentStatus } from '@/types'

const PAGE_SIZE = 10

export function usePayments() {
  const [statusFilter, setStatusFilterState] = useState<PaymentStatus | undefined>()
  const [page,         setPageState]         = useState(1)

  const { items, total, loading, error, refetch, startLoading } = useResourceList<Payment>(
    () => billingService.listPayments({ status: statusFilter, page, pageSize: PAGE_SIZE }),
    [statusFilter, page],
  )

  const setStatusFilter = (v?: PaymentStatus) => { setStatusFilterState(v); setPageState(1); startLoading() }
  const setPage         = (n: number)         => { setPageState(n); startLoading() }

  return {
    items, total, loading, error,
    statusFilter, page, pageSize: PAGE_SIZE,
    setStatusFilter, setPage, refetch,
  }
}
