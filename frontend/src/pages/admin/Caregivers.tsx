import { useState } from 'react'
import { Pencil, UserX } from 'lucide-react'
import {
  Table, Badge, Button, Pagination,
  ResourceToolbar, ConfirmDialog,
} from '@/components/common'
import { useCaregivers } from '@/hooks/useCaregivers'
import { formatDate } from '@/utils/formatDate'
import { formatMoney } from '@/utils/money'
import { CaregiverFormModal } from './CaregiverFormModal'
import type { Column } from '@/components/common'
import type { Caregiver, CreateCaregiverDto, UpdateCaregiverDto } from '@/types'

export function Caregivers() {
  const {
    items, total, loading, error,
    query, activeFilter, page, pageSize,
    setQuery, setActiveFilter, setPage,
    create, update, deactivate,
  } = useCaregivers()

  // Modal create/edit
  const [modalOpen,  setModalOpen]  = useState(false)
  const [modalMode,  setModalMode]  = useState<'create' | 'edit'>('create')
  const [selected,   setSelected]   = useState<Caregiver | undefined>()

  // Confirm deactivate
  const [confirmOpen,   setConfirmOpen]   = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<Caregiver | undefined>()
  const [deactivating,  setDeactivating]  = useState(false)

  const openCreate = () => {
    setModalMode('create')
    setSelected(undefined)
    setModalOpen(true)
  }

  const openEdit = (c: Caregiver) => {
    setModalMode('edit')
    setSelected(c)
    setModalOpen(true)
  }

  const openConfirm = (c: Caregiver) => {
    setConfirmTarget(c)
    setConfirmOpen(true)
  }

  const handleSubmit = async (dto: CreateCaregiverDto | UpdateCaregiverDto) => {
    if (modalMode === 'create') return create(dto as CreateCaregiverDto)
    if (!selected) return false
    return update(selected.id, dto as UpdateCaregiverDto)
  }

  const handleDeactivate = async () => {
    if (!confirmTarget) return
    setDeactivating(true)
    await deactivate(confirmTarget.id)
    setDeactivating(false)
    setConfirmOpen(false)
  }

  const columns: Column<Caregiver>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (c) => `${c.firstName} ${c.lastName}`,
    },
    { key: 'documentId', header: 'Documento' },
    {
      key: 'email',
      header: 'Email',
      render: (c) => c.user.email,
    },
    {
      key: 'hourlyRate',
      header: 'Valor hora',
      render: (c) => formatMoney(c.hourlyRate),
    },
    {
      key: 'hiredAt',
      header: 'Ingreso',
      render: (c) => formatDate(c.hiredAt),
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (c) => (
        <Badge variant={c.isActive ? 'success' : 'default'}>
          {c.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-24',
      render: (c) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(c)}
            aria-label="Editar"
          >
            <Pencil size={15} />
          </Button>
          {c.isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openConfirm(c)}
              aria-label="Desactivar"
              className="text-danger hover:text-danger"
            >
              <UserX size={15} />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cuidadores</h1>
        <p className="text-sm text-muted mt-1">Gestión del equipo de cuidadores</p>
      </div>

      <ResourceToolbar
        query={query}
        onQueryChange={setQuery}
        activeFilter={activeFilter}
        onActiveFilterChange={setActiveFilter}
        onNew={openCreate}
        newLabel="Nuevo cuidador"
        searchPlaceholder="Buscar por nombre o documento…"
      />

      {error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : (
        <>
          <Table
            columns={columns}
            data={items}
            keyField="id"
            isLoading={loading}
            emptyMessage="No se encontraron cuidadores"
          />
          {total > pageSize && (
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <CaregiverFormModal
        open={modalOpen}
        mode={modalMode}
        initial={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Desactivar cuidador"
        message={`¿Desactivar a ${confirmTarget?.firstName} ${confirmTarget?.lastName}? No podrá acceder al sistema.`}
        onConfirm={handleDeactivate}
        onClose={() => setConfirmOpen(false)}
        danger
        isLoading={deactivating}
      />
    </div>
  )
}
