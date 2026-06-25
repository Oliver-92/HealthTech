import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-center',
        className,
      )}
    >
      {icon && <span className="text-muted [&>svg]:size-10">{icon}</span>}
      <p className="text-base font-medium text-foreground">{title}</p>
      {description && <p className="text-sm text-muted max-w-xs">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
