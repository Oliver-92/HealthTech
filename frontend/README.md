Frontend de la aplicación CareConnect (Vite + React). Sistema de gestión integral para servicios de acompañamiento domiciliario, diseñado para centralizar la operación, el seguimiento de pacientes y la gestión de cuidadores.

## 🚀 Tecnologías Utilizadas

- **Core**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Estilos**: [TailwindCSS](https://tailwindcss.com/)
- **Estado Global**: [Zustand](https://github.com/pmndrs/zustand)
- **Ruteo**: [React Router DOM](https://reactrouter.com/) (con code-splitting por ruta vía `React.lazy`)
- **Validación**: [Zod](https://zod.dev/)
- **HTTP**: [Axios](https://axios-http.com/) (interceptores de token y errores)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Notificaciones**: [React Toastify](https://fkhadra.github.io/react-toastify/introduction/)
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)

## ✨ Funcionalidades Clave

- **Panel de Administración**: Visualización de métricas críticas (cuidadores activos, pacientes, horas trabajadas).
- **Gestión de Entidades (ABM)**: Módulos completos para administrar Cuidadores, Pacientes y Usuarios.
- **Sistema de Búsqueda y Filtrado**: Componentes reutilizables para búsqueda en tiempo real y filtrado por estados/roles.
- **Flujo de Datos Estandarizado**: Arquitectura desacoplada siguiendo el patrón `Page → Hook → Service`.
- **Modales Dinámicos**: Interfaz premium para la carga y edición de datos.
- **Navegación por Roles**: Accesos diferenciados para ADMINISTRADORES, CUIDADORES y FAMILIARES.

## 📂 Estructura de Carpetas

```
src/
├── components/      # Componentes de la aplicación
│   ├── common/      # Componentes genéricos y reutilizables (Button, Table, Input, etc.)
│   └── layout/      # Componentes estructurales (Header, Sidebar)
├── constants/       # Constantes globales del sistema
├── hooks/           # Custom hooks para lógica de negocio y consumo de datos
├── pages/           # Vistas principales organizadas por dominio
│   ├── admin/       # Vistas exclusivas del rol administrador
│   ├── caregiver/   # Vistas para acompañantes
│   ├── patient/     # Vistas para familiares/pacientes (solo lectura)
│   └── Login.tsx    # Pantalla de login
├── router/          # Configuración de rutas (AppRouter, ProtectedRoute)
├── services/        # Capa de servicios para comunicación con la API (mocks + impl real)
├── store/           # Gestión de estado global con Zustand (auth, ui)
├── test/            # Setup global de Vitest
├── utils/           # Utilidades y manejadores de errores centralizados
└── validations/     # Esquemas Zod por formulario
```

## 🛠️ Instalación y Uso

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/No-Country-simulation/S02-26-Equipo-19-Web-App-Development.git
   cd S02-26-Equipo-19-Web-App-Development/frontend/CareConnect
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar desarrollo**:
   ```bash
   npm run dev
   ```
   El servidor iniciará en `http://localhost:5173`.

> [!NOTE]
> **Ejecución sin Backend**: con `VITE_USE_MOCKS=true` la capa de servicios usa **mocks** en memoria, permitiendo previsualizar todas las vistas sin backend. Con `VITE_USE_MOCKS=false` (default) el frontend consume la API REST real.

---

## 📜 Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (`http://localhost:5173`). |
| `npm run build` | Typecheck (`tsc -b`) + build de producción a `dist/`. |
| `npm run preview` | Sirve el `dist/` localmente (con fallback SPA). |
| `npm run lint` | ESLint sobre todo el proyecto. |
| `npm test` | Corre la suite de tests una vez (Vitest). |
| `npm run test:watch` | Tests en modo watch. |
| `npm run test:cov` | Tests + reporte de cobertura (v8). |
| `npm run verify` | **Gate de calidad**: `tsc -b` + `eslint` + `vitest run`. |

## ⚙️ Configuración y Backend

### Variables de entorno

Crear un `.env` en la raíz de `frontend/` (ver `.env.example`):

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCKS=false
```

- `VITE_API_BASE_URL`: base de la API REST (incluye el prefijo `/api`).
- `VITE_USE_MOCKS`: si es `true`, la capa de servicios usa mocks en memoria y no requiere backend.

Para producción existe `.env.production` (ajustar `VITE_API_BASE_URL` al backend desplegado).
Nunca poner secretos: todo lo `VITE_*` queda expuesto en el bundle del cliente.

### Requisitos
- Node.js 18+ y npm
- Backend corriendo en `http://localhost:8080` con CORS habilitado para el origen del front
  (`FRONTEND_URL`), salvo que se usen mocks (`VITE_USE_MOCKS=true`).

## 🧪 Testing

Suite con **Vitest + React Testing Library** (entorno `jsdom`). Cubre lo crítico:
validaciones Zod, utilidades puras, componentes `common/` más usados, hooks y el gating
de `ProtectedRoute`. Correr con `npm test` o el gate completo con `npm run verify`.

## 🚢 Build y Deploy

```bash
npm run build      # genera dist/ estático
npm run preview    # validación local con fallback SPA
```

El hosting debe reescribir **todas** las rutas a `index.html` (SPA con routing del lado
cliente). Ya se incluyen:
- **Netlify**: `public/_redirects` → `/* /index.html 200` (se copia a `dist/`).
- **Vercel**: `vercel.json` con `rewrites` a `/index.html`.
- **Nginx**: `try_files $uri /index.html;`.

En producción, el `FRONTEND_URL` del backend debe incluir el dominio del front (CORS).

### Problemas comunes
- **Deep links dan 404 en el hosting**: falta la reescritura a `index.html` (ver arriba).
- **CORS bloqueado**: el `FRONTEND_URL` del backend no coincide con el origen del front.
- **Respuestas vacías**: la base puede no tener datos (correr seed/migraciones del backend).