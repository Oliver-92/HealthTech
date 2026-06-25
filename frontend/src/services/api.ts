import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

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

// Normaliza errores a Error(message) y maneja 401 limpiando la sesión
api.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    const axiosError = error as { response?: { status?: number; data?: { message?: string } } }
    const message = axiosError.response?.data?.message ?? 'Error de conexión'
    if (axiosError.response?.status === 401) useAuthStore.getState().logout()
    return Promise.reject(new Error(message))
  },
)
