import { useId, type ComponentProps } from 'react'
import { cn } from '@/utils/cn'

interface TextareaProps extends ComponentProps<'textarea'> {
  label?: string
  error?: string
  hint?: string
}

export function Textarea({
  label,
  error,
  hint,
  id: idProp,
  className,
  ...props
}: TextareaProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <textarea
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={cn(
          'w-full bg-surface border rounded-(--radius) px-3 py-2 text-sm text-foreground',
          'placeholder:text-muted transition-colors resize-y min-h-[80px]',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-danger' : 'border-border',
          className,
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}
