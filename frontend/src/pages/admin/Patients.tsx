import { useState } from 'react'
import { Pencil, UserX } from 'lucide-react'
import {
  Table, Badge, Button, Pagination,
  ResourceToolbar, ConfirmDialog,
} from '@/components/common'
import { usePatients } from '@/hooks/usePatients'
import { formatDate } from '@/utils/formatDate'
import { PatientFormModal } from './PatientFormModal'
import type { Column } from '@/components/common'
import type { Patient, CreatePatientDto, UpdatePatientDto } from '@/types'

export function Patients() {
  const {
    items, total, loading, error,
    query, activeFilter, page, pageSize,
    setQuery, setActiveFilter, setPage,
    create, update, deactivate,
  } = usePatients()

  // Modal create/edit
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selected,  setSelected]  = useState<Patient | undefined>()

  // Confirm deactivate
  const [confirmOpen,   setConfirmOpen]   = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<Patient | undefined>()
  const [deactivating,  setDeactivating]  = useState(false)

  const openCreate = () => {
    setModalMode('create')
    setSelected(undefined)
    setModalOpen(true)
  }

  const openEdit = (p: Patient) => {
    setModalMode('edit')
    setSelected(p)
    setModalOpen(true)
  }

  const openConfirm = (p: Patient) => {
    setConfirmTarget(p)
    setConfirmOpen(true)
  }

  const handleSubmit = async (dto: CreatePatientDto | UpdatePatientDto) => {
    if (modalMode === 'create') return create(dto as CreatePatientDto)
    if (!selected) return false
    return update(selected.id, dto as UpdatePatientDto)
  }

  const handleDeactivate = async () => {
    if (!confirmTarget) return
    setDeactivating(true)
    await deactivate(confirmTarget.id)
    setDeactivating(false)
    setConfirmOpen(false)
  }

  const columns: Column<Patient>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (p) => `${p.firstName} ${p.lastName}`,
    },
    { key: 'documentId', header: 'Documento' },
    {
      key: 'email',
      header: 'Email',
      render: (p) => p.user?.email ?? '—',
    },
    {
      key: 'birthDate',
      header: 'Nacimiento',
      render: (p) => p.birthDate ? formatDate(p.birthDate) : '—',
    },
    {
      key: 'phone',
      header: 'Teléfono',
      render: (p) => p.phone ?? '—',
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (p) => (
        <Badge variant={p.isActive ? 'success' : 'default'}>
          {p.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-24',
      render: (p) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(p)} aria-label="Editar">
            <Pencil size={15} />
          </Button>
          {p.isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openConfirm(p)}
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
        <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
        <p className="text-sm text-muted mt-1">Gestión del listado de pacientes</p>
      </div>

      <ResourceToolbar
        query={query}
        onQueryChange={setQuery}
        activeFilter={activeFilter}
        onActiveFilterChange={setActiveFilter}
        onNew={openCreate}
        newLabel="Nuevo paciente"
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
            emptyMessage="No se encontraron pacientes"
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

      <PatientFormModal
        open={modalOpen}
        mode={modalMode}
        initial={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Desactivar paciente"
        message={`¿Desactivar a ${confirmTarget?.firstName} ${confirmTarget?.lastName}? El paciente no podrá acceder al sistema.`}
        onConfirm={handleDeactivate}
        onClose={() => setConfirmOpen(false)}
        danger
        isLoading={deactivating}
      />
    </div>
  )
}
