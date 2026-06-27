import type { ReactNode } from 'react'
import { LoadingSpinner } from './LoadingSpinner'
import { EmptyState } from './EmptyState'
import { Button } from './Button'

interface AsyncBoundaryProps {
  loading: boolean
  error: string | null
  /** Si la carga fue exitosa pero no hay datos */
  isEmpty?: boolean
  /** Estado vacío a mostrar (default: <EmptyState/> genérico) */
  emptyState?: ReactNode
  /** Si se provee, muestra un botón "Reintentar" en el estado de error */
  onRetry?: () => void
  children: ReactNode
}

/**
 * Centraliza los estados async de carga / error / vacío para no repetir la misma
 * lógica en cada página. Cuando todo está OK, renderiza `children`.
 */
export function AsyncBoundary({
  loading,
  error,
  isEmpty = false,
  emptyState,
  onRetry,
  children,
}: AsyncBoundaryProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-danger">{error}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </div>
    )
  }

  if (isEmpty) {
    return <>{emptyState ?? <EmptyState title="Sin datos" description="No hay información para mostrar." />}</>
  }

  return <>{children}</>
}
