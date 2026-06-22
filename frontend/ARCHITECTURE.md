# Arquitectura: 

```bash
src/
│
├── router/
│   ├── AppRouter.jsx
│   │   // Define TODAS las rutas de la aplicación.
│   │   // Separa rutas públicas (login) y privadas por rol (admin, caregiver, patient).
│   │
│   └── ProtectedRoute.jsx
│       // Componente wrapper para proteger rutas según autenticación y rol.
│       // Evita que un usuario acceda a páginas que no le corresponden.
│
├── store/
│   ├── authStore.js
│   │   // Estado global de autenticación (Zustand).
│   │   // Guarda: usuario logueado, rol, token, isAuthenticated.
│   │   // Expone acciones: login, logout.
│   │
│   └── uiStore.js
│       // Estado global de interfaz.
│       // Ejemplos: sidebar abierto/cerrado, loader global, modales.
│
├── pages/
│   ├── Login.jsx
│   │   // Página de login única para todos los roles.
│   │   // No hay registro: solo login.
│   │
│   ├── admin/
│   │   ├── Dashboard.jsx
│   │   │   // Home del administrador.
│   │   │   // Muestra métricas generales (totales, horas, pagos, etc).
│   │   │
│   │   ├── Caregivers.jsx
│   │   │   // ABM de cuidadores.
│   │   │   // Crear, listar, editar y desactivar cuidadores.
│   │   │
│   │   ├── Patients.jsx
│   │   │   // ABM de pacientes.
│   │   │   // Alta y gestión completa de pacientes.
│   │   │
│   │   ├── Payments.jsx
│   │   │   // Gestión de pagos.
│   │   │   // Visualización de horas trabajadas y ejecución de pagos.
│   │   │
│   │   └── Reports.jsx
│   │       // Vista administrativa de informes.
│   │       // Permite revisar reportes cargados por cuidadores.
│
│   ├── caregiver/
│   │   ├── Dashboard.jsx
│   │   │   // Home del cuidador.
│   │   │   // Resumen personal: próximas guardias, estado de informes.
│   │   │
│   │   ├── MyShifts.jsx
│   │   │   // Listado de guardias asignadas al cuidador.
│   │   │   // Desde acá accede a cargar informes.
│   │   │
│   │   └── UploadReport.jsx
│   │       // Formulario para cargar horas trabajadas e informe de una guardia.
│
│   └── patient/
│       ├── Dashboard.jsx
│       │   // Home del paciente o familiar.
│       │   // Información general y accesos rápidos.
│       │
│       └── Reports.jsx
│           // Visualización de informes cargados por los cuidadores.
│           // Solo lectura (no edición).
│
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.jsx
│   │   │   // Layout base para usuarios logueados.
│   │   │   // Incluye Sidebar + Navbar + contenido dinámico.
│   │   │
│   │   ├── Sidebar.jsx
│   │   │   // Menú lateral.
│   │   │   // Renderiza opciones según el rol del usuario.
│   │   │
│   │   └── Navbar.jsx
│   │       // Barra superior.
│   │       // Muestra nombre del usuario, rol y botón de logout.
│   │
│   ├── common/
│   │   ├── Button.jsx
│   │   │   // Botón reutilizable con estilos base (Tailwind).
│   │   │
│   │   ├── Input.jsx
│   │   │   // Input reutilizable para formularios.
│   │   │
│   │   ├── Modal.jsx
│   │   │   // Modal genérico (confirmaciones, avisos).
│   │   │
│   │   └── Table.jsx
│   │       // Tabla reutilizable para listados (admin principalmente).
│   │
│   └── ShiftCard.jsx
│       // Componente presentacional para mostrar una guardia.
│       // Usado en MyShifts (cuidador).
│
├── services/
│   ├── api.js
│   │   // Configuración base de Axios.
│   │   // Define baseURL y agrega token en headers mediante interceptors.
│   │
│   ├── authService.js
│   │   // Llamadas relacionadas a autenticación (login).
│   │
│   ├── adminService.js
│   │   // Endpoints usados por el administrador:
│   │   // pacientes, cuidadores, pagos, reportes.
│   │
│   ├── caregiverService.js
│   │   // Endpoints del cuidador:
│   │   // guardias asignadas, carga de informes.
│   │
│   └── patientService.js
│       // Endpoints del paciente/familia:
│       // visualización de informes e información general.
│
├── utils/
│   ├── handleError.js
│   │   // Función helper para manejar errores de API.
│   │   // Centraliza el uso de react-toastify.
│   │
│   └── formatDate.js
│       // Función helper para formatear fechas.
│
├── constants/
│   ├── roles.js
│   │   // Constantes de roles del sistema (ADMIN, CAREGIVER, PATIENT).
│   │
│   └── menu.js
│       // Definición de los ítems del Sidebar según el rol.
│
├── App.jsx
│   // Componente raíz.
│   // Usa el router y define el layout general.
│
└── main.jsx
    // Punto de entrada de la aplicación.
    // Renderiza <App /> y configura providers globales.

```

### Nota:
- Cada Page puede tener una carpeta components/ para componentes propios de la página.


# Considerar

```bash
hooks/
├── useAuth.js          // Custom hook que consume authStore
├── usePermissions.js   // Verifica permisos según rol
└── useCaregivers.js    // Lógica reutilizable de cuidadores

common/
├── ...existentes
├── LoadingSpinner.jsx
├── EmptyState.jsx      // Para cuando no hay datos
└── ErrorBoundary.jsx   // Para capturar errores de React

validations/
├── caregiverSchema.js  // Esquemas de validación (con zod si lo agregan)
└── reportSchema.js
```