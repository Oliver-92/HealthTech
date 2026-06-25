import { cn } from '@/utils/cn'
import { LoadingSpinner } from './LoadingSpinner'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}

export function Table<T>({
  columns,
  data,
  keyField,
  isLoading = false,
  emptyMessage = 'No hay datos para mostrar',
  className,
}: TableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-[--radius] border border-border', className)}>
      <table className="w-full text-sm">
        <thead className="bg-surface-2 text-muted">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left font-medium border-b border-border',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-12">
                <div className="flex justify-center">
                  <LoadingSpinner size="md" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState title={emptyMessage} />
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={String(row[keyField])}
                className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 text-foreground', col.className)}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
