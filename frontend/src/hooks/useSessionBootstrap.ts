import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

/**
 * Revalida el token persistido contra /auth/me al iniciar la app.
 * Devuelve `ready` en false mientras se comprueba, para que el router
 * no renderice contenido protegido con un token ya vencido.
 */
export function useSessionBootstrap(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = useAuthStore.getState().token

    if (!token) {
      setReady(true)
      return
    }

    authService
      .me()
      .then((user) => useAuthStore.getState().setUser(user))
      .catch(() => useAuthStore.getState().logout())
      .finally(() => setReady(true))
  }, [])

  return ready
}
