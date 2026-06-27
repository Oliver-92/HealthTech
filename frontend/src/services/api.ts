import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { ApiError } from '@/utils/apiError'
import { redirectToLogin } from '@/utils/navigation'
import type { AuthUser } from '@/types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // envía la cookie httpOnly de refresh a /api/auth/*
})

// Inyecta el access token (en memoria) en cada request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Single-flight: varios 401 concurrentes comparten una única renovación
let refreshPromise: Promise<string> | null = null

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = api
      .post<{ token: string; user: AuthUser }>('/auth/refresh')
      .then((res) => {
        useAuthStore.getState().login(res.data.token, res.data.user)
        return res.data.token
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

const isAuthEndpoint = (url?: string) =>
  !!url && ['/auth/login', '/auth/refresh', '/auth/logout'].some((p) => url.includes(p))

function sessionExpired() {
  useAuthStore.getState().logout()
  redirectToLogin()
  return Promise.reject(new ApiError('Tu sesión expiró. Iniciá sesión nuevamente.', 401))
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ message?: string; errors?: string[] }>) => {
    const response = error.response
    const config = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    // Sin respuesta → error de red / servidor caído
    if (!response) {
      return Promise.reject(
        new ApiError('No se pudo conectar con el servidor. Verificá tu conexión.', 0),
      )
    }

    const status = response.status ?? 0
    const backendMessage = response.data?.message
    const errors = response.data?.errors ?? []

    if (status === 401) {
      // Mid-sesión: access token vencido → renovar con la cookie y reintentar UNA vez
      if (config && !isAuthEndpoint(config.url) && !config._retry) {
        try {
          const newToken = await refreshAccessToken()
          config._retry = true
          config.headers.Authorization = `Bearer ${newToken}`
          return api(config)
        } catch {
          return sessionExpired()
        }
      }
      // Login fallido → credenciales inválidas (mensaje del backend)
      if (config?.url?.includes('/auth/login')) {
        return Promise.reject(new ApiError(backendMessage ?? 'Credenciales inválidas', 401, errors))
      }
      // Request ya reintentada y sigue 401 → sesión inválida
      if (config?._retry) {
        return sessionExpired()
      }
      // /auth/refresh o /auth/logout directos (ej. el probe del bootstrap) → rechazar sin redirigir
      return Promise.reject(new ApiError(backendMessage ?? 'No autenticado', 401, errors))
    }

    // 403: sin permisos → mensaje claro, sin desloguear
    if (status === 403) {
      return Promise.reject(new ApiError('No tenés permiso para realizar esta acción.', 403))
    }

    // 500+: error del servidor → mensaje genérico amable
    if (status >= 500) {
      return Promise.reject(
        new ApiError('Ocurrió un error en el servidor. Intentá de nuevo más tarde.', status),
      )
    }

    // 400/404/409…: preservar el mensaje del backend para mapearlo en los formularios
    return Promise.reject(new ApiError(backendMessage ?? 'Algo salió mal', status, errors))
  },
)
