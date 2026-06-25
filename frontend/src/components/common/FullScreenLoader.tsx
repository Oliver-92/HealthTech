import { LoadingSpinner } from './LoadingSpinner'

export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <LoadingSpinner size="lg" />
    </div>
  )
}
