📌 Objetivo

Este documento define el flujo de datos del módulo Admin en el frontend.

Establece:

Cómo se obtienen los datos

Cómo se manejan las mutaciones

Dónde vive cada tipo de estado

Qué responsabilidades tiene cada capa

Qué prácticas deben evitarse

Este documento es obligatorio para mantener coherencia técnica.

🧠 Principio Fundamental

El flujo de datos SIEMPRE debe seguir esta estructura:

PAGE (AdminX.jsx)
   ↓
Custom Hook (useX.js)
   ↓
Service (adminService.js)
   ↓
api.js (fetch wrapper)
   ↓
Backend

Nunca:

❌ Page → fetch directo

❌ Page → lógica de negocio

❌ Page → manipular arrays manualmente

❌ Guardar listas en Zustand

🏗 Tipos de Estado en Admin
1️⃣ Estado Global (Zustand)

Permitido únicamente para:

Autenticación (no detallado aquí)

UI global (sidebar, loader, modales)

NO guardar:

caregivers

patients

payments

metrics

reports

2️⃣ Estado Remoto (Server State)

Se maneja con:

Custom Hooks

useState

useEffect

Ejemplos:

Lista de cuidadores

Lista de pacientes

Pagos

Métricas

3️⃣ Estado Local UI

Manejado con:

useState()

Ejemplos:

Modal abierto

Filtros

Paginación

Form data

🌐 Capa API – fetch wrapper

Se debe centralizar fetch en services/api.js.

Ejemplo base:

const BASE_URL = import.meta.env.VITE_API_URL

export const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.message || "Request failed")
  }

  return response.json()
}

Responsabilidades:

Manejar headers

Manejar errores HTTP

Parsear JSON

Lanzar errores controlados

No debe:

Manejar lógica de negocio

Mostrar toasts

🧩 Capa Services – adminService.js

Esta capa solo define endpoints.

Ejemplo:

import { apiFetch } from "./api"

export const adminService = {
  getMetrics: () => apiFetch("/admin/metrics"),

  getCaregivers: () => apiFetch("/admin/caregivers"),

  createCaregiver: (data) =>
    apiFetch("/admin/caregivers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCaregiver: (id, data) =>
    apiFetch(`/admin/caregivers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deactivateCaregiver: (id) =>
    apiFetch(`/admin/caregivers/${id}`, {
      method: "PATCH",
    }),

  getPatients: () => apiFetch("/admin/patients"),

  getPayments: () => apiFetch("/admin/payments"),

  executePayment: (id) =>
    apiFetch(`/admin/payments/${id}/execute`, {
      method: "POST",
    }),
}

Reglas:

No usar estado aquí.

No usar useState.

No usar useEffect.

No mostrar notificaciones.

🪝 Capa Hooks

Cada pantalla Admin debe tener su hook específico.

📊 AdminHome.jsx → useAdminMetrics

Responsabilidades del hook:

Fetch inicial

Manejo de loading

Manejo de error

Exponer datos

Ejemplo:

export const useAdminMetrics = () => {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await adminService.getMetrics()
        setMetrics(data)
      } catch (error) {
        handleError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  return { metrics, loading }
}
👥 AdminCaregivers.jsx → useCaregivers

Debe manejar:

Listado

Refetch

Mutaciones

Estructura estándar:

export const useCaregivers = () => {
  const [caregivers, setCaregivers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCaregivers = async () => {
    try {
      const data = await adminService.getCaregivers()
      setCaregivers(data)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  const createCaregiver = async (formData) => {
    await adminService.createCaregiver(formData)
    fetchCaregivers()
  }

  useEffect(() => {
    fetchCaregivers()
  }, [])

  return {
    caregivers,
    loading,
    createCaregiver,
    refetch: fetchCaregivers,
  }
}
🔄 Regla de Oro para Mutaciones

Después de:

create

update

delete

execute payment

SIEMPRE:

refetch()

No modificar manualmente arrays en memoria.

No hacer:

setCaregivers(prev => [...prev, newCaregiver])

Eso genera inconsistencias.

🧱 Flujo por Pantalla Admin
1️⃣ AdminHome

Hook: useAdminMetrics

Fetch al montar

Renderiza métricas

Mostrar LoadingSpinner mientras carga

Mostrar EmptyState si no hay datos

2️⃣ AdminCaregivers

Hook: useCaregivers

Listado

Crear / Editar / Desactivar

Refetch luego de mutación

3️⃣ AdminPatients

Mismo patrón que caregivers.

Hook dedicado:

usePatients

4️⃣ AdminPayments

Hook:

usePayments

Debe manejar:

getPayments

executePayment

refetch luego de ejecutar

🎨 Reglas UI Obligatorias

Cada pantalla debe:

Mostrar LoadingSpinner mientras loading === true

Mostrar EmptyState si lista vacía

Manejar errores con handleError

No bloquear UI innecesariamente

No mezclar lógica y JSX complejo

🚫 Anti-Patterns Prohibidos

❌ Guardar listas en Zustand
❌ Hacer fetch directo en Page
❌ Duplicar lógica de fetch
❌ No manejar loading
❌ No manejar error
❌ Manipular arrays manualmente tras mutaciones
❌ Hardcodear endpoints en la Page

📈 Escalabilidad Futura

Si el proyecto crece, se puede migrar a:

TanStack Query (para cache inteligente)

Paginación backend

Filtros server-side

Suspense

Pero por ahora el patrón Hook + Service + fetch es suficiente y profesional.

🎯 Resumen Final

En Admin:

Page renderiza

Hook maneja estado remoto

Service maneja endpoints

api.js centraliza fetch

Zustand solo para infraestructura

Mutaciones → refetch

Este flujo debe mantenerse consistente en todo el módulo Admin.