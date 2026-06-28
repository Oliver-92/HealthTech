import { useState } from 'react'
import { toast } from 'react-toastify'
import { shiftService } from '@/services/shiftService'
import { handleError } from '@/utils/handleError'
import { useResourceList } from './useResourceList'
import type { Shift, CreateShiftDto, UpdateShiftDto, ShiftStatus } from '@/types'

const PAGE_SIZE = 10

export function useShifts() {
  const [caregiverFilter, setCaregiverFilterState] = useState<number | undefined>()
  const [patientFilter,   setPatientFilterState]   = useState<number | undefined>()
  const [statusFilter,    setStatusFilterState]    = useState<ShiftStatus | undefined>()
  const [fromFilter,      setFromFilterState]      = useState<string | undefined>()
  const [toFilter,        setToFilterState]        = useState<string | undefined>()
  const [page, setPageState] = useState(1)

  const { items, total, loading, error, refetch, startLoading } = useResourceList<Shift>(
    () => shiftService.list({
      caregiverId: caregiverFilter, patientId: patientFilter, status: statusFilter,
      from: fromFilter, to: toFilter, page, pageSize: PAGE_SIZE,
    }),
    [caregiverFilter, patientFilter, statusFilter, fromFilter, toFilter, page],
  )

  const setCaregiverFilter = (v?: number) => { setCaregiverFilterState(v); setPageState(1); startLoading() }
  const setPatientFilter   = (v?: number) => { setPatientFilterState(v);   setPageState(1); startLoading() }
  const setStatusFilter    = (v?: ShiftStatus) => { setStatusFilterState(v); setPageState(1); startLoading() }
  const setFromFilter      = (v?: string) => { setFromFilterState(v); setPageState(1); startLoading() }
  const setToFilter        = (v?: string) => { setToFilterState(v);   setPageState(1); startLoading() }
  const setPage            = (n: number) => { setPageState(n); startLoading() }

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
