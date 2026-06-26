import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { shiftService } from '@/services/shiftService'
import { handleError } from '@/utils/handleError'
import { unwrapList } from '@/utils/unwrapList'
import type { Shift, CreateShiftDto, UpdateShiftDto, ShiftStatus, ShiftListParams } from '@/types'

const PAGE_SIZE = 10

export function useShifts() {
  const [items, setItems]   = useState<Shift[]>([])
  const [total, setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [tick, setTick]     = useState(0)

  const [caregiverFilter, setCaregiverFilterState] = useState<number | undefined>()
  const [patientFilter,   setPatientFilterState]   = useState<number | undefined>()
  const [statusFilter,    setStatusFilterState]    = useState<ShiftStatus | undefined>()
  const [fromFilter,      setFromFilterState]      = useState<string | undefined>()
  const [toFilter,        setToFilterState]        = useState<string | undefined>()
  const [page, setPageState] = useState(1)

  useEffect(() => {
    let cancelled = false
    const params: ShiftListParams = {
      caregiverId: caregiverFilter,
      patientId:   patientFilter,
      status:      statusFilter,
      from:        fromFilter,
      to:          toFilter,
      page,
      pageSize:    PAGE_SIZE,
    }
    shiftService
      .list(params)
      .then((res) => {
        if (cancelled) return
        const { data, total: t } = unwrapList(res)
        setItems(data)
        setTotal(t)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Error al cargar guardias')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [caregiverFilter, patientFilter, statusFilter, fromFilter, toFilter, page, tick])

  const refetch = () => { setTick((t) => t + 1); setLoading(true) }

  const setCaregiverFilter = (v?: number) => { setCaregiverFilterState(v); setPageState(1); setLoading(true) }
  const setPatientFilter   = (v?: number) => { setPatientFilterState(v);   setPageState(1); setLoading(true) }
  const setStatusFilter    = (v?: ShiftStatus) => { setStatusFilterState(v); setPageState(1); setLoading(true) }
  const setFromFilter      = (v?: string) => { setFromFilterState(v); setPageState(1); setLoading(true) }
  const setToFilter        = (v?: string) => { setToFilterState(v);   setPageState(1); setLoading(true) }
  const setPage            = (n: number) => { setPageState(n); setLoading(true) }

  const create = async (dto: CreateShiftDto): Promise<boolean> => {
    try {
      await shiftService.create(dto)
      toast.success('Guardia asignada')
      refetch()
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  const update = async (id: number, dto: UpdateShiftDto): Promise<boolean> => {
    try {
      await shiftService.update(id, dto)
      toast.success('Guardia actualizada')
      refetch()
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  const updateStatus = async (id: number, status: ShiftStatus): Promise<boolean> => {
    try {
      await shiftService.updateStatus(id, { status })
      toast.success('Estado actualizado')
      refetch()
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  const remove = async (id: number): Promise<boolean> => {
    try {
      await shiftService.remove(id)
      toast.success('Guardia eliminada')
      refetch()
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  return {
    items, total, loading, error,
    caregiverFilter, patientFilter, statusFilter, fromFilter, toFilter,
    page, pageSize: PAGE_SIZE,
    setCaregiverFilter, setPatientFilter, setStatusFilter,
    setFromFilter, setToFilter, setPage,
    refetch, create, update, updateStatus, remove,
  }
}
