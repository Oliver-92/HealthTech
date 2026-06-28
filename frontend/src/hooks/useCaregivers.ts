import { useState } from 'react'
import { toast } from 'react-toastify'
import { caregiverService } from '@/services/caregiverService'
import { handleError } from '@/utils/handleError'
import { useDebounce } from './useDebounce'
import { useResourceList } from './useResourceList'
import type { Caregiver, CreateCaregiverDto, UpdateCaregiverDto } from '@/types'

const PAGE_SIZE = 10

export function useCaregivers() {
  const [rawQuery, setRawQuery]         = useState('')
  const [activeFilter, setActiveFilter] = useState<'true' | 'false' | undefined>()
  const [page, setPageState]            = useState(1)
  const debouncedQuery = useDebounce(rawQuery)

  const { items, total, loading, error, refetch, startLoading } = useResourceList<Caregiver>(
    () => caregiverService.list({ q: debouncedQuery || undefined, isActive: activeFilter, page, pageSize: PAGE_SIZE }),
    [debouncedQuery, activeFilter, page],
  )

  const setQuery = (q: string) => { setRawQuery(q); setPageState(1); startLoading() }
  const setIsActiveFilter = (v?: 'true' | 'false') => { setActiveFilter(v); setPageState(1); startLoading() }
  const setPage = (n: number) => { setPageState(n); startLoading() }

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
