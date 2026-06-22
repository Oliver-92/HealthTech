## Descripción del Proyecto
HealtTech es una plataforma web diseñada para gestionar integralmente servicios de acompañamiento domiciliario. Permite la administración de pacientes, cuidadores, reportes y usuarios, además de brindar paneles de métricas y herramientas para facilitar la operación diaria.

### Tecnologías principales
- **Backend:** Nodejs + Express
- **Base de datos:** PostgreSQL 
- **Frontend:** React (Vite + JSX), Tailwind CSS
- **Otras:** React Toastify para notificaciones, Lucide Icons, Fetch API personalizada

### Funcionalidades destacadas
- Gestión (ABM) de pacientes, cuidadores y usuarios desde el panel de administración
- Filtros y búsqueda en tablas de registro
- Formulario con validación básica y modales reutilizables
- Métricas principales en dashboard de administración
- Navegación role-based entre áreas de administrador, cuidador y familiar
- Manejo centralizado de errores y notificaciones emergentes
- Sistema de Dark Mode en toda la aplicación
- Componentes reutilizables y modulares

## Características por Rol

### 👤 Paciente/Familiar
- Vista de reportes propios realizados por cuidadores
- Visualización de información personal
- Pantalla de bienvenida personalizada

### 👨‍⚕️ Cuidador
- Dashboard con lista de pacientes asignados
- Creación de reportes diarios sobre pacientes (medicación, actividades, signos vitales)
- Visualización de historial de reportes propios
- Gestión de pacientes asignados

### 🔐 Administrador
- **Panel de Control:** Métricas generales (total usuarios, pacientes activos, reportes, etc.)
- **Gestión de Usuarios:** Ver, crear nuevos usuarios con asignación de roles
- **Gestión de Pacientes:** Ver lista completa, crear nuevos pacientes, editar datos
- **Gestión de Cuidadores:** Ver lista, crear nuevos cuidadores, asignarlos a pacientes
- **Gestión de Reportes:** Visualizar todos los reportes, aprobar o rechazar reportes de cuidadores
- **Filtros y búsqueda:** En todas las tablas de administración


## Instrucciones de Instalación y Ejecución



## Estructura del Proyecto

```
├── frontend/
│   └── CareConnect/
│       ├── src/
│       │   ├── components/     # Componentes reutilizables
│       │   ├── pages/          # Vistas principales por rol
│       │   ├── hooks/          # Custom hooks (useUsers, usePatients, etc.)
│       │   ├── router/         # Configuración de rutas (AppRouter.jsx)
│       │   ├── services/       # Integraciones con API
│       │   ├── utils/          # Utilidades y helpers
│       │   ├── App.jsx
│       │   └── index.css       # Estilos globales y Dark Mode
│       └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   │   └── index.ts/
│   └── package.json
└── README.md
```

## Cómo Probar

1. **Seleccionar rol:** En la pantalla de login, elige un rol (Administrador, Cuidador, Familia o Paciente)
2. **Acceder a la vista:** Serás redirigido a la pantalla correspondiente
3. **Explorar funcionalidades:** Navega por los menús disponibles según tu rol

**Nota:** El sistema actual de login es temporal. Se implementará autenticación real en futuras versiones.

## Desafíos y Soluciones

### Dark Mode
- **Desafío:** Mantener consistencia visual en toda la aplicación
- **Solución:** Sistema centralizado de CSS variables y configuración Tailwind con soporte para `darkMode: 'class'`

### Componentes Reutilizables
- **Desafío:** Evitar duplicación de código entre diferentes vistas
- **Solución:** Componentes genéricos (Button, Input, Table, etc.) con props configurables

### Gestión de Estado
- **Desafío:** Sincronizar datos entre componentes
- **Solución:** Custom hooks (usePatients, useCaregivers, etc.) que centralizan la lógica

## Objetivos del proyecto
- Centralizar todo en un unico sitema 
- Digitalizar informes y horas trabajadas
- Automatizar procesos de pago
- Mejorar la comunicacion entre acompañantes, familias , paciente y administradores  