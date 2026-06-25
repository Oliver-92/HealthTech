import { toast } from 'react-toastify'

export const handleError = (error: unknown, fallback = 'Algo salió mal') => {
  const message = error instanceof Error ? error.message : fallback
  toast.error(message)
}
