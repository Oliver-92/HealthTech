import { useState, useEffect } from 'react'
import { unwrapList } from '@/utils/unwrapList'
import type { Paginated } from '@/types'

interface ResourceList<T> {
  items: T[]
  total: number
  loading: boolean
  error: string | null
  /** Vuelve a ejecutar el fetcher (y marca loading) */
  refetch: () => void
  /** Marca loading=true; usar en los setters de filtros antes de que el efecto re-corra */
  startLoading: () => void
}

/**
 * Encapsula el patrón de fetch de un listado: estados (items/total/loading/error),
 * ejecución con cancelación al cambiar `deps`, normalización con `unwrapList` y refetch.
 * Los hooks de dominio aportan los filtros y las acciones (create/update/…) por encima.
 *
 * `deps` debe incluir todos los valores reactivos que use `fetcher` (filtros, página, etc.).
 */
export function useResourceList<T>(
  fetcher: () => Promise<T[] | Paginated<T>>,
  deps: unknown[],
): ResourceList<T> {
  const [items, setItems] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetcher()
      .then((res) => {
        if (cancelled) return
        const { data, total: t } = unwrapList(res)
        setItems(data)
        setTotal(t)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Error al cargar los datos')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // `fetcher` se omite a propósito: re-ejecutamos solo cuando cambian los `deps` del dominio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const refetch = () => {
    setTick((t) => t + 1)
    setLoading(true)
  }
  const startLoading = () => setLoading(true)

  return { items, total, loading, error, refetch, startLoading }
}
