import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import { ApiError } from '@/utils/apiError'
import { redirectToLogin } from '@/utils/navigation'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Inyecta el token en cada request; getState() se evalúa en runtime (sin ciclo)
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normaliza errores a ApiError(message, status, errors) y maneja sesión/permisos.
api.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    const axiosError = error as {
      config?: { url?: string }
      response?: { status?: number; data?: { message?: string; errors?: string[] } }
    }
    const response = axiosError.response

    // Sin respuesta → error de red / servidor caído
    if (!response) {
      return Promise.reject(
        new ApiError('No se pudo conectar con el servidor. Verificá tu conexión.', 0),
      )
    }

    const status = response.status ?? 0
    const backendMessage = response.data?.message
    const errors = response.data?.errors ?? []

    // 401: sesión inválida o vencida → desloguear y redirigir (salvo en el propio login)
    if (status === 401) {
      const isLoginRequest = axiosError.config?.url?.includes('/auth/login')
      if (isLoginRequest) {
        return Promise.reject(new ApiError(backendMessage ?? 'Credenciales inválidas', 401, errors))
      }
      useAuthStore.getState().logout()
      redirectToLogin()
      return Promise.reject(new ApiError('Tu sesión expiró. Iniciá sesión nuevamente.', 401))
    }

    // 403: sin permisos → mensaje claro, sin desloguear
    if (status === 403) {
      return Promise.reject(new ApiError('No tenés permiso para realizar esta acción.', 403))
    }

    // 500+: error del servidor → mensaje genérico amable (nunca exponer el crudo)
    if (status >= 500) {
      return Promise.reject(
        new ApiError('Ocurrió un error en el servidor. Intentá de nuevo más tarde.', status),
      )
    }

    // 400/404/409…: preservar el mensaje del backend para mapearlo en los formularios
    return Promise.reject(new ApiError(backendMessage ?? 'Algo salió mal', status, errors))
  },
)
