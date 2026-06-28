import { useState } from 'react'
import { toast } from 'react-toastify'
import { patientService } from '@/services/patientService'
import { handleError } from '@/utils/handleError'
import { useDebounce } from './useDebounce'
import { useResourceList } from './useResourceList'
import type { Patient, CreatePatientDto, UpdatePatientDto } from '@/types'

const PAGE_SIZE = 10

export function usePatients() {
  const [rawQuery, setRawQuery]         = useState('')
  const [activeFilter, setActiveFilter] = useState<'true' | 'false' | undefined>()
  const [page, setPageState]            = useState(1)
  const debouncedQuery = useDebounce(rawQuery)

  const { items, total, loading, error, refetch, startLoading } = useResourceList<Patient>(
    () => patientService.list({ q: debouncedQuery || undefined, isActive: activeFilter, page, pageSize: PAGE_SIZE }),
    [debouncedQuery, activeFilter, page],
  )

  const setQuery = (q: string) => { setRawQuery(q); setPageState(1); startLoading() }
  const setIsActiveFilter = (v?: 'true' | 'false') => { setActiveFilter(v); setPageState(1); startLoading() }
  const setPage = (n: number) => { setPageState(n); startLoading() }

  // create/update muestran el toast y RE-LANZAN para que el form mapee el error por campo
  const create = async (dto: CreatePatientDto): Promise<void> => {
    try {
      await patientService.create(dto)
      toast.success('Paciente creado')
      refetch()
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const update = async (id: number, dto: UpdatePatientDto): Promise<void> => {
    try {
      await patientService.update(id, dto)
      toast.success('Paciente actualizado')
      refetch()
    } catch (err) {
      handleError(err)
      throw err
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
