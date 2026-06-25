import { Search, Plus } from 'lucide-react'
import { Input } from './Input'
import { Select } from './Select'
import { Button } from './Button'

const ACTIVE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Activos' },
  { value: 'false', label: 'Inactivos' },
]

interface ResourceToolbarProps {
  query: string
  onQueryChange: (q: string) => void
  activeFilter: 'true' | 'false' | undefined
  onActiveFilterChange: (v?: 'true' | 'false') => void
  onNew: () => void
  newLabel?: string
  searchPlaceholder?: string
}

export function ResourceToolbar({
  query,
  onQueryChange,
  activeFilter,
  onActiveFilterChange,
  onNew,
  newLabel = 'Nuevo',
  searchPlaceholder = 'Buscar…',
}: ResourceToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        leftIcon={<Search size={16} />}
        placeholder={searchPlaceholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="sm:w-72"
      />
      <Select
        options={ACTIVE_OPTIONS}
        value={activeFilter ?? ''}
        onChange={(e) => {
          const v = e.target.value
          onActiveFilterChange(v === '' ? undefined : (v as 'true' | 'false'))
        }}
        className="sm:w-40"
      />
      <div className="sm:ml-auto">
        <Button leftIcon={<Plus size={16} />} onClick={onNew} className="w-full sm:w-auto">
          {newLabel}
        </Button>
      </div>
    </div>
  )
}
