import { useId, type ComponentProps } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends ComponentProps<'input'> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  id: idProp,
  className,
  ...props
}: InputProps) {
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
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-muted pointer-events-none">{leftIcon}</span>
        )}
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            'w-full bg-surface border rounded-(--radius) px-3 py-2 text-sm text-foreground',
            'placeholder:text-muted transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon && 'pl-9',
            error ? 'border-danger' : 'border-border',
            className,
          )}
          {...props}
        />
      </div>
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
