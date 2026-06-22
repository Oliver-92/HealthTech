# 📌 Contexto General del Proyecto

Este proyecto consiste en el desarrollo de una aplicación web para una PYME de acompañamiento domiciliario que actualmente gestiona su operación de forma manual mediante:

- Plantillas Excel
- Grupos de WhatsApp por paciente
- Cálculo manual de horas trabajadas
- Gestión manual de pagos

El objetivo es digitalizar y centralizar toda la operación en una única aplicación web con control de roles y trazabilidad.

## Stack Tecnológico Frontend

- **React** (Vite)
- **TailwindCSS**
- **Zustand** (estado global)
- **React Router DOM** (ruteo)
- **Lucide React** (íconos)
- **React Toastify** (notificaciones)

El backend será desarrollado en **Node** y expone APIs REST.

---

## 🎯 Objetivo del Sistema

Construir una aplicación que permita:

- ABM de cuidadores (acompañantes)
- ABM de pacientes
- Gestión de guardias
- Carga de informes por guardia
- Cálculo de horas trabajadas
- Gestión de pagos mensuales
- Visualización de métricas administrativas
- Visualización de informes por parte de familiares/pacientes

## Implementaciones esperadas

- Sistema  de autenticación/login
- Edición de usuarios/pacientes/cuidadores: Necesita implementarse CRUD completo
- Paginación avanzada: En tablas grandes
- Exportación de reportes: A PDF o Excel
- Notificaciones push: Para alertas de reportes pendientes
- Validación en backend: Actualmente solo en frontend
- Navegación por roles (selección de rol → vista correspondiente)
- Dashboard de administrador con métricas
- Listado de usuarios, pacientes, cuidadores y reportes
- Creación de nuevos pacientes y cuidadores
- Sistema de aprobación/rechazo de reportes
- Formularios con validación
- Sistema de Dark Mode
- Modales reutilizables
- Manejo de errores y notificaciones

---

## 👥 Roles del Sistema

Existen 3 roles principales:

### 1️⃣ ADMIN

Responsable de la gestión completa del sistema.

**Puede:**
- Crear, editar y desactivar cuidadores
- Crear y gestionar pacientes
- Asignar guardias
- Revisar informes cargados
- Calcular horas trabajadas
- Ejecutar pagos
- Ver métricas generales

### 2️⃣ CAREGIVER (Cuidador / Acompañante)

**Puede:**
- Ver sus guardias asignadas
- Cargar informes por guardia
- Registrar horas trabajadas
- Consultar estado de sus reportes

**No puede:**
- Editar pacientes
- Ejecutar pagos
- Ver métricas globales

### 3️⃣ PATIENT (Paciente / Familiar)

**Puede:**
- Visualizar informes cargados por cuidadores
- Consultar información relacionada al paciente

Es un rol de **solo lectura**.

---

## 🔐 Autenticación

- Solo existe **login**.
- No hay registro público.
- El backend maneja autenticación y devuelve token.
- El token se guarda en `authStore` (Zustand).
- Las rutas se protegen por rol mediante `ProtectedRoute`.

**El estado global de autenticación contiene:**
- `user`
- `role`
- `token`
- `isAuthenticated`

---

## 🧠 Principios de Diseño Frontend

### 1️⃣ Separación por rol

- La experiencia cambia según el rol.
- El `Sidebar` debe renderizar opciones dinámicamente según el rol.

### 2️⃣ Front desacoplado del backend

- El frontend **no contiene lógica de negocio compleja**.
- Solo consume APIs.
- No calcula pagos.
- No valida reglas financieras.
- Solo muestra datos procesados o envía datos para procesar.

### 3️⃣ Estado mínimo global

Zustand solo debe contener:
- Autenticación
- Estado UI global (sidebar, loader, modales)

El resto se maneja con estado local o custom hooks.

### 4️⃣ Componentes reutilizables

Los componentes en `common/` deben:
- Ser presentacionales
- No depender del rol
- No tener lógica de negocio
- Ser altamente reutilizables

---

## 📊 Módulos Funcionales Clave

### 🔹 Gestión de Cuidadores

- Listado
- Alta
- Edición
- Desactivación
- Documentación requerida en alta (solo UI, validación backend)

### 🔹 Gestión de Pacientes

- Alta
- Edición
- Listado
- Asociación con cuidadores

### 🔹 Gestión de Guardias

- Asignadas por admin
- Visualizadas por cuidador

**Cada guardia puede tener:**
- Fecha
- Horario
- Paciente
- Estado

### 🔹 Carga de Informes

Realizado por cuidadores:
- Horas trabajadas
- Observaciones
- Confirmación de guardia realizada

> ⚠️ **No se deben calcular pagos en frontend.**

### 🔹 Pagos

Vista administrativa donde se:
- Visualizan horas acumuladas
- Se ejecuta pago
- Se muestra estado del pago

> La integración con pasarela de pago es responsabilidad del backend.  
> El frontend solo dispara la acción.

### 🔹 Métricas

Dashboard admin puede mostrar:
- Total cuidadores activos
- Total pacientes activos
- Total horas del mes
- Total pagos pendientes
- Total pagos realizados

> No se realizan cálculos complejos en frontend.

---

## 🧩 Manejo de Errores

- Todas las llamadas a API deben manejar errores centralizadamente.
- Usar `handleError.js`.
- Mostrar errores con `react-toastify`.
- Nunca exponer errores crudos del backend en UI.

---

## 🎨 UI / UX Guidelines

- Diseño limpio y profesional.
- Colores neutros y confiables (salud / institucional).
- Evitar sobrecargar dashboards.
- Priorizar claridad operativa.
- Siempre mostrar estados vacíos (`EmptyState`).
- Siempre mostrar loader en peticiones (`LoadingSpinner`).
- Utilizar `ErrorBoundary` para capturar errores de React.

---

## 📁 Arquitectura

La estructura completa del proyecto está definida en:

👉 **[ARCHITECTURE.md](./ARCHITECTURE.md)**

> El agente debe respetar estrictamente esa estructura.  
> No crear carpetas fuera de lo definido sin justificación clara.

---

## ⚠️ Reglas Importantes

- ❌ No mezclar lógica de negocio con componentes UI.
- ❌ No duplicar llamadas API.
- ❌ No guardar información sensible fuera del store.
- ❌ No hardcodear roles.
- ✅ Siempre usar constantes desde `constants/`.
- ❌ No implementar lógica financiera en frontend.
- ✅ Mantener componentes pequeños y desacoplados.
- ❌ Los layouts no deben contener lógica de negocio.

---

## 🧪 Buenas Prácticas

- ✅ Crear hooks reutilizables para lógica repetida.
- ✅ Validaciones en frontend solo para UX (no reemplazan backend).
- ✅ Formularios con estructura clara.
- ✅ Servicios separados por rol.
- ✅ Interceptors para token automático.
- ✅ Código en inglés (variables, funciones).
- ✅ Comentarios breves y claros.

---

## 🏁 Objetivo Final

Construir una aplicación:

- ✅ **Escalable**
- ✅ **Mantenible**
- ✅ **Con separación clara por rol**
- ✅ **Preparada para crecer** (más métricas, más reportes, más módulos)
- ✅ **Con experiencia profesional tipo SaaS**