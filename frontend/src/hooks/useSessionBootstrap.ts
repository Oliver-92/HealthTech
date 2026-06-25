import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

export function useSessionBootstrap(): boolean {
  // Si no hay token, ya estamos listos — no hay nada que revalidar
  const [ready, setReady] = useState(() => !useAuthStore.getState().token)

  useEffect(() => {
    const token = useAuthStore.getState().token
    if (!token) return

    authService
      .me()
      .then((user) => useAuthStore.getState().setUser(user))
      .catch(() => useAuthStore.getState().logout())
      .finally(() => setReady(true))
  }, [])

  return ready
}
