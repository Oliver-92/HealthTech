# HealthTech

HealthTech es una plataforma web para gestionar integralmente servicios de **acompañamiento domiciliario**: cuidadores, pacientes, guardias, informes por guardia, liquidaciones/pagos y métricas, con control de acceso por rol y trazabilidad.

## Tecnologías principales

**Backend**
- Node.js + **Express 5** + **TypeScript** (ESM)
- **PostgreSQL** con **Prisma 7** (ORM + migraciones)
- **JWT** (`jsonwebtoken`) + **bcrypt** para autenticación
- **Zod** para validación de requests y variables de entorno
- **helmet**, **express-rate-limit**, **pino** (logging) para hardening
- **Vitest** + **Supertest** para tests

**Frontend**
- React (Vite) + TailwindCSS + React Router DOM
- Zustand (estado global), Lucide Icons, React Toastify

---

## Características por rol

### 🔐 Administrador (`ADMIN`)
- ABM de cuidadores y pacientes (alta crea User + perfil en transacción; baja lógica)
- Asignación y gestión de guardias (con validación de solapamientos)
- Revisión de informes: aprobar / rechazar (con motivo)
- Facturación: períodos de liquidación, generación de liquidaciones y ejecución de pagos
- Dashboard de métricas

### 👨‍⚕️ Cuidador (`CAREGIVER`)
- Ver sus guardias asignadas (`/api/me/shifts`)
- Cargar informes por guardia (borrador o envío directo), editar y reenviar
- Consultar el estado de sus informes (`/api/me/reports`)

### 👤 Paciente / Familiar (`PATIENT`)
- Solo lectura: ver los informes **aprobados** del paciente (`/api/me/reports`)

---

## Estructura del proyecto

```
HealthTech/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Modelos y enums
│   │   ├── migrations/            # Migraciones versionadas
│   │   └── seed.ts                # Datos de ejemplo (admin, cuidadores, billing…)
│   ├── src/
│   │   ├── app.ts                 # App Express: middlewares + montaje de routers
│   │   ├── server.ts              # listen + graceful shutdown
│   │   ├── config/                # env (Zod), prisma (singleton), logger (pino)
│   │   ├── middlewares/           # auth (JWT), requireRole, validate (Zod), errorHandler
│   │   ├── utils/                 # ApiError, schemas comunes, pagination
│   │   └── modules/
│   │       ├── auth/              # login, refresh, logout, me
│   │       ├── caregivers/        # ABM cuidadores
│   │       ├── patients/          # ABM pacientes
│   │       ├── shifts/            # guardias + máquina de estados
│   │       ├── reports/           # informes + flujo de aprobación
│   │       ├── billing/           # períodos, liquidaciones, pagos (+ gateway stub)
│   │       ├── metrics/           # métricas del dashboard admin
│   │       └── health/            # healthcheck con verificación de BD
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   └── src/                       # components, pages, hooks, router, services, utils
└── README.md
```

> Cada módulo sigue el patrón `routes → controller → service → schema`: las rutas validan y autorizan, los controllers orquestan, los services contienen la lógica de negocio y los schemas (Zod) validan la entrada.

---

## Instalación y ejecución (backend)

**Requisitos:** Node.js 20+, PostgreSQL en ejecución (instalación nativa o gestionada).

```bash
cd backend
npm install

# 1) Configurar variables de entorno
cp .env.example .env
#   Editar .env con la cadena real de conexión a PostgreSQL (DATABASE_URL)

# 2) Crear el esquema y datos de ejemplo
npm run db:migrate     # aplica las migraciones (crea las tablas)
npm run db:seed        # carga admin, cuidadores, pacientes, guardias, informes y billing

# 3) Levantar la API en modo desarrollo
npm run dev            # http://localhost:8080
```

**Variables de entorno** (`.env`):

| Variable | Ejemplo | Notas |
|---|---|---|
| `PORT` | `8080` | Puerto del servidor |
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/healthtech` | Conexión a PostgreSQL |
| `JWT_SECRET` | `cadena-secreta-min-16-chars` | Secret del **access token**. Mínimo 16 caracteres |
| `JWT_EXPIRES_IN` | `15m` | Vida del access token. Formato `ms` (`15m`, `10h`, `3600`) |
| `JWT_REFRESH_SECRET` | `otra-cadena-min-16-chars` | Secret del **refresh token**. Debe ser **distinto** de `JWT_SECRET` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Vida del refresh token |
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `FRONTEND_URL` | `http://localhost:5173` | Origen permitido por CORS |

**Scripts útiles:** `npm run dev` · `npm run build` · `npm start` · `npm test` · `npm run lint` · `npm run db:reset` (resetea + reseed) · `npm run db:studio` (Prisma Studio).

### Credenciales del seed

| Rol | Email | Password |
|---|---|---|
| ADMIN | `admin@healthtech.com` | `Admin1234!` |
| CAREGIVER | `maria.lopez@healthtech.com` | `Caregiver1234!` |
| CAREGIVER | `carlos.perez@healthtech.com` | `Caregiver1234!` |
| PATIENT | `familia.garcia@healthtech.com` | `Patient1234!` |

---

## API REST

**Base URL:** `http://localhost:8080/api`

### Autenticación y convenciones

- **Auth:** enviar el **access token** en el header `Authorization: Bearer <token>`. Se obtiene desde `POST /api/auth/login`.
- **Access + refresh token:** el access token es de **vida corta** (15 min, en memoria del cliente). El `login` además setea un **refresh token** en una cookie `httpOnly` (no accesible a JS, mitiga XSS), acotada a `/api/auth`. Cuando el access token vence, el cliente lo renueva con `POST /api/auth/refresh` (que **rota** el par de tokens usando la cookie). `POST /api/auth/logout` limpia la cookie. Requiere enviar credenciales con la request (`credentials: 'include'` / `withCredentials`).
- **Respuesta de éxito:** el recurso directo (objeto o array). En listados con paginación (`page`/`pageSize`) se devuelve `{ data, total, page, pageSize }`.
- **Respuesta de error:** siempre `{ "message": "…", "errors": [] }`.

| Código | Significado |
|---|---|
| `200` | OK |
| `201` | Recurso creado |
| `400` | Error de validación (Zod) o transición inválida |
| `401` | No autenticado (token ausente/ inválido) |
| `403` | Rol sin permiso |
| `404` | No encontrado |
| `409` | Conflicto (ej. email/documento duplicado) |
| `503` | Servicio no disponible (BD caída, solo `/health`) |

**Paginación opt-in:** los listados aceptan `?page=1&pageSize=20`. Sin esos parámetros devuelven un array plano (retrocompatible); con ellos, el envoltorio paginado.

### 🔑 Auth

| Método | Ruta | Rol | Body | Descripción |
|---|---|---|---|---|
| POST | `/auth/login` | público | `{ email, password }` | Devuelve `{ token, user }` y setea la cookie `refreshToken` |
| POST | `/auth/refresh` | cookie | — | Renueva (y rota) el access token desde la cookie. Devuelve `{ token, user }` |
| POST | `/auth/logout` | público | — | Limpia la cookie de refresh (`204`) |
| GET | `/auth/me` | autenticado | — | Usuario actual desde el token |

```jsonc
// POST /api/auth/login   (responde Set-Cookie: refreshToken=…; HttpOnly; SameSite=Lax)
{ "email": "admin@healthtech.com", "password": "Admin1234!" }
// 200 →
{ "token": "eyJhbGci…", "user": { "id": 1, "email": "admin@healthtech.com", "role": "ADMIN" } }
```

### 🩺 Health

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/health` | público | `{ status, db, timestamp }`; `503` si la BD no responde |

### 👩‍⚕️ Caregivers — `ADMIN`

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| GET | `/caregivers` | — | Listar. Query: `q`, `isActive` (`true`/`false`), `page`, `pageSize` |
| GET | `/caregivers/:id` | — | Detalle |
| POST | `/caregivers` | ver abajo | Alta (crea User + Caregiver) |
| PUT | `/caregivers/:id` | `{ firstName?, lastName?, phone?, hourlyRate?, hiredAt? }` | Editar |
| PATCH | `/caregivers/:id/deactivate` | — | Baja lógica (desactiva User y Caregiver) |

```jsonc
// POST /api/caregivers
{
  "email": "nuevo@healthtech.com",
  "password": "Secret123",            // min 8
  "firstName": "Ana", "lastName": "Díaz",
  "documentId": "33444555",
  "phone": "11-1234-5678",            // opcional
  "hourlyRate": 1800,                 // > 0
  "hiredAt": "2026-01-15"             // YYYY-MM-DD
}
```

### 🧑‍🦽 Patients — `ADMIN`

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| GET | `/patients` | — | Listar. Query: `q`, `isActive`, `page`, `pageSize` |
| GET | `/patients/:id` | — | Detalle |
| POST | `/patients` | ver abajo | Alta (cuenta de login familiar opcional) |
| PUT | `/patients/:id` | `{ firstName?, lastName?, birthDate?, address?, phone?, emergencyContact?, notes? }` | Editar |
| PATCH | `/patients/:id/deactivate` | — | Baja lógica |

```jsonc
// POST /api/patients  (email y password van juntos, o ninguno)
{
  "firstName": "Elena", "lastName": "Ruiz",
  "documentId": "14888999",
  "birthDate": "1940-03-10",          // opcional, YYYY-MM-DD
  "address": "Av. Siempreviva 742",   // opcional
  "phone": "11-9999-0000",            // opcional
  "emergencyContact": "Juan — 11-...",// opcional
  "notes": "Dieta sin sal",           // opcional
  "email": "familia.ruiz@mail.com",   // opcional (login familiar)
  "password": "Secret123"             // opcional (min 8)
}
```

### 🗓️ Shifts (Guardias)

| Método | Ruta | Rol | Body | Descripción |
|---|---|---|---|---|
| GET | `/shifts` | ADMIN | — | Listar. Query: `caregiverId`, `patientId`, `status`, `from`, `to`, `page`, `pageSize` |
| GET | `/shifts/:id` | ADMIN | — | Detalle |
| POST | `/shifts` | ADMIN | `{ patientId, caregiverId, date, startTime, endTime }` | Asignar guardia |
| PUT | `/shifts/:id` | ADMIN | `{ patientId?, caregiverId?, date?, startTime?, endTime? }` | Editar (no si COMPLETED/CANCELLED) |
| PATCH | `/shifts/:id/status` | ADMIN | `{ status }` | Cambiar estado (según transiciones) |
| DELETE | `/shifts/:id` | ADMIN | — | Eliminar (solo SCHEDULED sin informe) |
| GET | `/me/shifts` | CAREGIVER | — | Guardias propias. Query: `status`, `from`, `to` |

- `date`: `YYYY-MM-DD` · `startTime`/`endTime`: `HH:MM`. Se admiten **turnos nocturnos** (ej. `22:00`→`06:00`); solo se rechaza `startTime === endTime`.

### 📝 Reports (Informes)

| Método | Ruta | Rol | Body | Descripción |
|---|---|---|---|---|
| POST | `/shifts/:shiftId/report` | CAREGIVER | ver abajo | Cargar informe de una guardia propia |
| GET | `/reports` | ADMIN | — | Listar. Query: `caregiverId`, `patientId`, `status`, `page`, `pageSize` |
| GET | `/reports/:id` | ADMIN | — | Detalle |
| PATCH | `/reports/:id/approve` | ADMIN | — | Aprobar (marca la guardia `COMPLETED`) |
| PATCH | `/reports/:id/reject` | ADMIN | `{ reason }` | Rechazar con motivo |
| PUT | `/reports/:id` | CAREGIVER | `{ workedMinutes?, observations?, medication?, vitalSigns? }` | Editar borrador / rechazado (vuelve a DRAFT) |
| PATCH | `/reports/:id/submit` | CAREGIVER | — | Enviar borrador (DRAFT → SUBMITTED) |
| GET | `/me/reports` | CAREGIVER · PATIENT | — | Cuidador: sus informes · Paciente: solo `APPROVED`. Query: `status` |

```jsonc
// POST /api/shifts/:shiftId/report
{
  "workedMinutes": 360,               // > 0
  "observations": "Paciente estable", // opcional
  "medication": "Enalapril 10mg",     // opcional
  "vitalSigns": "TA 130/80",          // opcional
  "submit": false                     // false (default) → DRAFT · true → SUBMITTED
}
```

### 💸 Billing — `ADMIN`

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| GET | `/billing/payroll-periods` | — | Listar períodos |
| POST | `/billing/payroll-periods` | `{ month, startDate, endDate }` | Crear período (fechas `YYYY-MM-DD`) |
| GET | `/billing/payroll-periods/:id` | — | Detalle de período |
| PATCH | `/billing/payroll-periods/:id/close` | — | Cerrar período |
| POST | `/billing/payroll-periods/:id/generate-reports` | — | Generar liquidaciones de los informes APROBADOS del período |
| GET | `/billing/payment-reports/payroll/:payrollPeriodId` | — | Liquidaciones de un período |
| GET | `/billing/payment-reports/caregiver/:caregiverId` | — | Liquidaciones de un cuidador |
| GET | `/billing/payment-reports/:id` | — | Detalle de liquidación |
| POST | `/billing/payment-reports/:id/pay` | `{ paymentMethod }` | Ejecutar el pago (`BANK_TRANSFER` \| `MERCADO_PAGO`) |
| GET | `/billing/payments` | — | Listar pagos. Query: `status`, `page`, `pageSize` |
| GET | `/billing/payments/:id` | — | Detalle de pago |

- `generate-reports` calcula por cuidador `totalTimeMins` (suma de minutos de informes `APPROVED` en el rango) y `totalAmount = totalTimeMins / 60 × hourlyRate`.
- El pago pasa por un **gateway** desacoplado (hoy un stub que simula éxito). El doble pago de una liquidación ya pagada se rechaza (`400`).

### 📊 Metrics — `ADMIN`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/admin/metrics` | `{ activeCaregivers, activePatients, monthlyHours, pendingReports, pendingPayments, completedPayments }` |

---

## Modelo de dominio y estados

**Entidades:** `User` (login) ─1:1─ `Caregiver` / `Patient`; `Shift` (guardia) ─1:1─ `Report`; `PayrollPeriod` ─1:N─ `PaymentReport` ─1:N─ `Payment`.

**Enums y máquinas de estado:**

- **ShiftStatus:** `SCHEDULED → IN_PROGRESS → COMPLETED`; desde `SCHEDULED`/`IN_PROGRESS` también `CANCELLED`; desde `SCHEDULED` `NO_SHOW`. (`COMPLETED`/`CANCELLED`/`NO_SHOW` son terminales.)
- **ReportStatus:** `DRAFT → SUBMITTED → APPROVED | REJECTED`; un `REJECTED` editado vuelve a `DRAFT`. Aprobar marca la guardia `COMPLETED`.
- **PaymentReportStatus:** `GENERATED → PAYMENT_IN_PROGRESS → PAID | PAYMENT_FAILED` (`CANCELLED` disponible).
- **PaymentStatus:** `CREATED → INITIATED → COMPLETED | FAILED`.
- **PaymentMethod:** `BANK_TRANSFER`, `MERCADO_PAGO`.
- **Role:** `ADMIN`, `CAREGIVER`, `PATIENT`.

---

## Objetivos del proyecto

- Centralizar la operación en un único sistema.
- Digitalizar informes y horas trabajadas.
- Automatizar el cálculo de liquidaciones y pagos.
- Mejorar la comunicación entre acompañantes, familias, pacientes y administradores.
