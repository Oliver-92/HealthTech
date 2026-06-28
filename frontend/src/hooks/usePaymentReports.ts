import { toast } from 'react-toastify'
import { billingService } from '@/services/billingService'
import { handleError } from '@/utils/handleError'
import { useResourceList } from './useResourceList'
import type { PaymentReport, PaymentMethod } from '@/types'

export function usePaymentReports(periodId: number | null) {
  // Sin período seleccionado el fetcher resuelve vacío (no hay nada que pedir)
  const { items, loading, error, refetch } = useResourceList<PaymentReport>(
    () => (periodId ? billingService.reportsByPayroll(periodId) : Promise.resolve([])),
    [periodId],
  )

  const pay = async (id: number, method: PaymentMethod): Promise<boolean> => {
    try {
      await billingService.pay(id, { paymentMethod: method })
      toast.success('Pago ejecutado')
      refetch()
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  return { items, loading, error, refetch, pay }
}
