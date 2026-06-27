import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { USE_MOCKS } from '@/services/config'

/**
 * Restaura la sesión al cargar la app.
 * - Real: intenta renovar el access token con la cookie httpOnly de refresh.
 * - Mock (demo): valida el token persistido en localStorage contra el mock.
 * Devuelve `false` hasta resolver, para gatear el render inicial.
 */
export function useSessionBootstrap(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const done = () => {
      if (!cancelled) setReady(true)
    }

    if (USE_MOCKS) {
      const token = useAuthStore.getState().token
      if (!token) {
        done()
        return
      }
      authService
        .me()
        .then((user) => useAuthStore.getState().setUser(user))
        .catch(() => useAuthStore.getState().logout())
        .finally(done)
    } else {
      authService
        .refresh()
        .then(({ token, user }) => useAuthStore.getState().login(token, user))
        .catch(() => useAuthStore.getState().logout())
        .finally(done)
    }

    return () => {
      cancelled = true
    }
  }, [])

  return ready
}
