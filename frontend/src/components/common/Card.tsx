import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends ComponentProps<'div'> {
  title?: string
  footer?: React.ReactNode
}

export function Card({ title, footer, children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-[--radius] shadow-sm',
        className,
      )}
      {...props}
    >
      {title && (
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
      {footer && (
        <div className="px-5 py-4 border-t border-border bg-surface-2 rounded-b-[--radius]">
          {footer}
        </div>
      )}
    </div>
  )
}
