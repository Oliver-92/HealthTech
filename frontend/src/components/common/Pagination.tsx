import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, pageSize, total, onPageChange, className }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const isFirst = page <= 1
  const isLast = page >= totalPages

  return (
    <div className={cn('flex items-center justify-between gap-4 text-sm text-muted', className)}>
      <span>
        Página <span className="font-medium text-foreground">{page}</span> de{' '}
        <span className="font-medium text-foreground">{totalPages}</span>
        {' '}·{' '}
        <span className="font-medium text-foreground">{total}</span> resultado{total !== 1 && 's'}
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={isFirst}
          aria-label="Página anterior"
          className={cn(
            'inline-flex items-center justify-center size-8 rounded-(--radius) border border-border',
            'hover:bg-surface-2 transition-colors',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          )}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={isLast}
          aria-label="Página siguiente"
          className={cn(
            'inline-flex items-center justify-center size-8 rounded-(--radius) border border-border',
            'hover:bg-surface-2 transition-colors',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          )}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
