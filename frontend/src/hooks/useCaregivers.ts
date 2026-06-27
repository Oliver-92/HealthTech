import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { caregiverService } from '@/services/caregiverService'
import { handleError } from '@/utils/handleError'
import { unwrapList } from '@/utils/unwrapList'
import { useDebounce } from './useDebounce'
import type { Caregiver, CreateCaregiverDto, UpdateCaregiverDto } from '@/types'

const PAGE_SIZE = 10

export function useCaregivers() {
  const [items, setItems]   = useState<Caregiver[]>([])
  const [total, setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [tick, setTick]     = useState(0)

  const [rawQuery, setRawQuery]   = useState('')
  const [activeFilter, setActiveFilter] = useState<'true' | 'false' | undefined>()
  const [page, setPageState]      = useState(1)
  const debouncedQuery = useDebounce(rawQuery)

  // Effect solo hace async work — setState solo en callbacks
  useEffect(() => {
    let cancelled = false
    caregiverService
      .list({ q: debouncedQuery || undefined, isActive: activeFilter, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return
        const { data, total: t } = unwrapList(res)
        setItems(data)
        setTotal(t)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Error al cargar cuidadores')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [debouncedQuery, activeFilter, page, tick])

  // Setters activan loading antes de que el effect se re-ejecute
  const setQuery = (q: string) => {
    setRawQuery(q)
    setPageState(1)
    setLoading(true)
  }

  const setIsActiveFilter = (v?: 'true' | 'false') => {
    setActiveFilter(v)
    setPageState(1)
    setLoading(true)
  }

  const setPage = (n: number) => {
    setPageState(n)
    setLoading(true)
  }

  const refetch = () => {
    setTick((t) => t + 1)
    setLoading(true)
  }

  // create/update muestran el toast y RE-LANZAN para que el form mapee el error por campo
  const create = async (dto: CreateCaregiverDto): Promise<void> => {
    try {
      await caregiverService.create(dto)
      toast.success('Cuidador creado')
      refetch()
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const update = async (id: number, dto: UpdateCaregiverDto): Promise<void> => {
    try {
      await caregiverService.update(id, dto)
      toast.success('Cuidador actualizado')
      refetch()
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const deactivate = async (id: number): Promise<boolean> => {
    try {
      await caregiverService.deactivate(id)
      toast.success('Cuidador desactivado')
      refetch()
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  return {
    items, total, loading, error,
    query: rawQuery, activeFilter, page, pageSize: PAGE_SIZE,
    setQuery, setActiveFilter: setIsActiveFilter, setPage,
    refetch, create, update, deactivate,
  }
}
