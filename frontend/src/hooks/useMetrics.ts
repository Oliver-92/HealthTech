import { useState, useEffect } from 'react'
import { metricsService } from '@/services/metricsService'
import type { AdminMetrics } from '@/types'

export function useMetrics() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [tick, setTick]       = useState(0)

  useEffect(() => {
    let cancelled = false
    metricsService
      .getAdminMetrics()
      .then((data) => {
        if (cancelled) return
        setMetrics(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Error al cargar métricas')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [tick])

  const refetch = () => {
    setTick((t) => t + 1)
    setLoading(true)
  }

  return { metrics, loading, error, refetch }
}
