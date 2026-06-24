import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const sizeClasses = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeClasses[size], className)}
      aria-hidden="true"
    />
  )
}
