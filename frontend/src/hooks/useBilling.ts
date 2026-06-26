import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { billingService } from '@/services/billingService'
import { handleError } from '@/utils/handleError'
import type { PayrollPeriod, CreatePayrollPeriodDto } from '@/types'

export function useBilling() {
  const [periods, setPeriods]   = useState<PayrollPeriod[]>([])
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState<string | null>(null)
  const [tick,    setTick]      = useState(0)

  useEffect(() => {
    let cancelled = false
    billingService
      .listPeriods()
      .then((data) => {
        if (cancelled) return
        setPeriods(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Error al cargar períodos')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [tick])

  const refetch = () => { setTick((t) => t + 1); setLoading(true) }

  const createPeriod = async (dto: CreatePayrollPeriodDto): Promise<boolean> => {
    try {
      await billingService.createPeriod(dto)
      toast.success('Período creado')
      refetch()
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  const closePeriod = async (id: number): Promise<boolean> => {
    try {
      await billingService.closePeriod(id)
      toast.success('Período cerrado')
      refetch()
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  const generateReports = async (id: number): Promise<boolean> => {
    try {
      const created = await billingService.generateReports(id)
      toast.success(`${created.length} liquidación${created.length !== 1 ? 'es' : ''} generada${created.length !== 1 ? 's' : ''}`)
      refetch()
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  return { periods, loading, error, refetch, createPeriod, closePeriod, generateReports }
}
