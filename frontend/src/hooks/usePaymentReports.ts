import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { billingService } from '@/services/billingService'
import { handleError } from '@/utils/handleError'
import type { PaymentReport, PaymentMethod } from '@/types'

export function usePaymentReports(periodId: number | null) {
  const [items,   setItems]   = useState<PaymentReport[]>([])
  const [loading, setLoading] = useState(periodId !== null)
  const [error,   setError]   = useState<string | null>(null)
  const [tick,    setTick]    = useState(0)

  // Resetea el loading al cambiar de período o al refetch (ajuste de estado en
  // render: patrón de React para evitar setState síncrono dentro del efecto).
  const [syncKey, setSyncKey] = useState(`${periodId}:${tick}`)
  const currentKey = `${periodId}:${tick}`
  if (currentKey !== syncKey) {
    setSyncKey(currentKey)
    setLoading(periodId !== null)
  }

  useEffect(() => {
    if (!periodId) return
    let cancelled = false
    billingService
      .reportsByPayroll(periodId)
      .then((data) => {
        if (cancelled) return
        setItems(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Error al cargar liquidaciones')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [periodId, tick])

  const refetch = () => { setTick((t) => t + 1) }

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
