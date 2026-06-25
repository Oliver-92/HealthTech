import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { patientService } from '@/services/patientService'
import { handleError } from '@/utils/handleError'
import { unwrapList } from '@/utils/unwrapList'
import { useDebounce } from './useDebounce'
import type { Patient, CreatePatientDto, UpdatePatientDto } from '@/types'

const PAGE_SIZE = 10

export function usePatients() {
  const [items, setItems]     = useState<Patient[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [tick, setTick]       = useState(0)

  const [rawQuery, setRawQuery]     = useState('')
  const [activeFilter, setActiveFilter] = useState<'true' | 'false' | undefined>()
  const [page, setPageState]        = useState(1)
  const debouncedQuery = useDebounce(rawQuery)

  useEffect(() => {
    let cancelled = false
    patientService
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
        setError(err instanceof Error ? err.message : 'Error al cargar pacientes')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [debouncedQuery, activeFilter, page, tick])

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

  const create = async (dto: CreatePatientDto): Promise<boolean> => {
    try {
      await patientService.create(dto)
      toast.success('Paciente creado')
      refetch()
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  const update = async (id: number, dto: UpdatePatientDto): Promise<boolean> => {
    try {
      await patientService.update(id, dto)
      toast.success('Paciente actualizado')
      refetch()
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  const deactivate = async (id: number): Promise<boolean> => {
    try {
      await patientService.deactivate(id)
      toast.success('Paciente desactivado')
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
