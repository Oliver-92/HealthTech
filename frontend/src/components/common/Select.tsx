import { useId, type ComponentProps } from 'react'
import { cn } from '@/utils/cn'

interface Option {
  value: string
  label: string
}

interface SelectProps extends ComponentProps<'select'> {
  label?: string
  error?: string
  options: Option[]
  placeholder?: string
}

export function Select({
  label,
  error,
  options,
  placeholder,
  id: idProp,
  className,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <select
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full bg-surface border rounded-(--radius) px-3 py-2 text-sm text-foreground',
          'transition-colors appearance-none cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-danger' : 'border-border',
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
