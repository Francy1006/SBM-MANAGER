# Calavera Pirata Digital

                                                       █──▄────▄▄▄▄▄▄▄────▄───
                                                       █─▀▀▄─▄█████████▄─▄▀▀──
                                                       █─────██─▀███▀─██──────
                                                       █───▄─▀████▀████▀─▄────
                                                       █─▀█────██▀█▀██────█▀──
        ▄████▄   ▒█████   ███▄    █  ██ ██░██████ ▄▄▄  █    
       ▒██▀ ▀█  ▒██▒  ██▒ ██ ▀█   █  ██ █░ ▓█   ▀▒████▄█    
       ▒▓█    ▄ ▒██░  ██▒ ██  ▀█ █▒  ████░ ▒███  ▒██   █▄   
       ▒▓▓▄ ▄██ ▒██   ██░ ██▒  ▐▌█▒  ██ █▄ ▒▓█  ▄░████████  
       ▒ ▓███▀ ░░ ████▓▒  ██░   ▓█░  █▒ ██▄░▒████▒▓█  █▒ 
       ░ ░▒ ▒  ░░ ▒░▒░▒░ ░ ▒░   ▒ ▒  ▒▒ ▓▒░░ ▒░ ░▒▒   ▓▒█░ 
         ░  ▒     ░ ▒ ▒░ ░ ░░   ░ ▒  ░▒ ▒░ ░ ░  ░ ▒   ▒▒ ░ 
       ░        ░ ░ ░ ▒     ░   ░ ░ ░ ░░ ░    ░    ░   ▒    
       ░ ░          ░ ░           ░ ░  ░      ░  ░     ░  ░ 
       ░                                                           
       ▄▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄▄
      █ ▄▄▄ █ ▀▀ ▄▀ ▀▄▀ █ ▄▄▄ █ ▄▀ ▀▄▀ █ ▄▄▄ █ ▄▄▄ █ ▀▀ ▄▀ ▀▄
      █ ███ █ ▀ ▀▄█ ▄ ▀ █ ███ █ ▀▄█ ▄ ▀ █ ███ █ ███ █ ▀ ▀▄█ ▄
      █▄▄▄█ █ █▄▀ █ ▀█ █ █▄▄▄█ █▄▀ █ ▀█ █▄▄▄█ █▄▄▄█ █ █▄▀ █ ▀
      ▄▄▄▄▄▄█ ▀▄█▄▀ ▀ █▄█▄▄▄▄▄█ ▀▄█▄▀ ▀ █▄▄▄▄▄█▄▄▄▄▄█ ▀▄█▄▀ ▀

    ████████████████████████████████████████████████████████████████
    ██  ║                                                       ║  ██
    ██  ║               ░▒▓ SBM - MANAGER ▓▒░                   ║  ██
    ██  ║                                                       ║  ██
    ██  ║    ┌─────────────────────────────────────────────┐    ║  ██
    ██  ║    │  > SBM MANAGER (FRONT VUE JS 3)             │    ║  ██
    ██  ║    │  > Sistema de Gestión de Negocios            │    ║  ██
    ██  ║    │  > CRUD Avanzado con Componentes Reutilizables│    ║  ██
    ██  ║    │  > Autenticación Google OAuth                │    ║  ██
    ██  ║    │  > STATUS: ACTIVE & UPDATED                  │    ║  ██
    ██  ║    └─────────────────────────────────────────────┘    ║  ██
    ██  ║                                                       ║  ██
    ██  ║         ░▒▓ SBM-ADMIN ACCESS GRANTED ▓▒░              ║  ██
    ██  ║                                                       ║  ██
    ██  ╚═══════════════════════════════════════════════════════╝  ██
    ██                                                             ██
    ████████████████████████████████████████████████████████████████



# SBM-MANAGER — Documentación Técnica Actualizada

## Descripción General

SBM-MANAGER es una aplicación web moderna de administración de negocios desarrollada con **Vue 3** (Composition API) y **Bootstrap 5**, diseñada para gestionar franquicias, catálogos, productos, materiales, servicios y proveedores. El sistema incluye autenticación OAuth con Google, componentes CRUD reutilizables, estadísticas en tiempo real y una interfaz inspirada en sistemas de administración empresarial.

---

## Arquitectura del Proyecto

```
SBM-MANAGER/
├── sbm-manager/                    # Frontend Vue 3
│   ├── src/
│   │   ├── components/             # Componentes reutilizables
│   │   │   ├── CRUDGridComponent.vue      # Tabla CRUD principal
│   │   │   ├── CRUDManagerComponent.vue   # Gestor CRUD completo
│   │   │   ├── SimpleFormComponent.vue    # Formularios dinámicos
│   │   │   ├── SidebarComponent.vue       # Navegación lateral
│   │   │   ├── HeaderComponent.vue        # Cabecera
│   │   │   ├── FooterComponent.vue        # Pie de página
│   │   │   ├── GoogleLoginComponent.vue   # Autenticación OAuth
│   │   │   ├── StatsGeneralComponent.vue  # Estadísticas
│   │   │   ├── PropertiesComponent.vue    # Propiedades de elementos
│   │   │   ├── ConfigFormComponent.vue    # Configuraciones
│   │   │   ├── ConfigListComponent.vue    # Lista de configuraciones
│   │   │   ├── OptionsComponent.vue       # Opciones de visualización (configurable)
│   │   │   └── CalculationComponent.vue   # Cálculos
│   │   ├── views/                  # Vistas principales
│   │   │   ├── HomeView.vue        # Dashboard principal
│   │   │   ├── LoginView.vue       # Página de login
│   │   │   ├── FranchiseView.vue   # Gestión de franquicias
│   │   │   ├── CatalogsView.vue    # Gestión de catálogos
│   │   │   ├── ProductView.vue     # Gestión de productos
│   │   │   ├── MaterialView.vue    # Gestión de materiales
│   │   │   ├── ServiceView.vue     # Gestión de servicios
│   │   │   ├── ProviderView.vue    # Gestión de proveedores
│   │   │   └── Configuration/      # Configuraciones específicas
│   │   │       └── FiscalDirective.vue
│   │   ├── composables/            # Composables Vue 3
│   │   │   └── useAuth.js          # Gestión de autenticación
│   │   ├── api/                    # Configuración de API
│   │   │   ├── axios.js            # Configuración centralizada
│   │   │   └── franchise.js        # Endpoints específicos
│   │   ├── router/                 # Configuración de rutas
│   │   │   └── index.js            # Definición de rutas
│   │   ├── assets/                 # Recursos estáticos
│   │   │   ├── style/              # Estilos CSS
│   │   │   ├── font/               # Fuentes personalizadas
│   │   │   └── img/                # Imágenes y logos
│   │   ├── App.vue                 # Componente raíz
│   │   └── main.js                 # Punto de entrada
│   ├── public/                     # Archivos públicos
│   ├── package.json                # Dependencias
│   ├── vue.config.js               # Configuración de Vue CLI
│   └── Dockerfile                  # Contenedor Docker
├── docker-compose.yml              # Orquestación de servicios
├── .env                           # Variables de entorno
├── .gitignore                     # Archivos ignorados
├── .dockerignore                  # Archivos ignorados por Docker
├── command.md                     # Comandos de desarrollo
└── TECHNICAL_DOCUMENTATION.md     # (Este documento)
```

---

## Tecnologías y Dependencias

### Frontend
- **Vue 3.2.13** - Framework principal con Composition API
- **Vue Router 4.0.3** - Enrutamiento
- **Vuex 4.0.0** - Gestión de estado
- **Bootstrap 5.3.3** - Framework CSS
- **Axios 1.10.0** - Cliente HTTP
- **Core-js 3.8.3** - Polyfills

### Desarrollo
- **Vue CLI 5.0.0** - Herramientas de desarrollo
- **Babel** - Transpilación de JavaScript
- **Yarn** - Gestor de paquetes

### Contenedores
- **Docker** - Contenedorización
- **Docker Compose** - Orquestación

---

## Sistema de Autenticación

### Google OAuth 2.0
- **Cliente ID**: `815958124165-c4jtlvju3ngm68ecpgqf3k208tqd984f.apps.googleusercontent.com`
- **Endpoint Backend**: `http://localhost:8082/api/users/auth/google/`
- **Almacenamiento**: LocalStorage con token JWT
- **Fallback**: Sistema de login manual para desarrollo

### Gestión de Estado de Autenticación
```javascript
// Composables/useAuth.js
const isAuthenticated = ref(false);
const userInfo = ref({
  uuid: '',
  email: '',
  name: '',
  token: ''
});
```

### Protección de Rutas
- **Meta requiresAuth**: Protección automática de rutas
- **Guards de navegación**: Redirección automática al login
- **Interceptores Axios**: Manejo de tokens expirados (401)

---

## Componentes Principales

### 1. CRUDGridComponent.vue
**Funcionalidades principales:**
- Tabla dinámica con paginación
- Búsqueda en tiempo real con debounce
- Selección múltiple con checkboxes
- Botones de acción (Configurar, Eliminar, Propiedades)
- Soporte para campos secretos (ocultos por defecto)
- Formateo automático de tipos de datos
- Integración con estados y configuraciones
- Responsive design
- Componente de opciones configurable

**Props principales:**
```javascript
{
  resourceName: String,      // Nombre del recurso
  endpoint: String,          // Endpoint de la API
  states: Array/Object,      // Estados disponibles
  iconClass: String,         // Icono del componente
  showPropertiesButton: Boolean,
  fields: Array,             // Configuración de campos
  optionsProps: Object      // Props para OptionsComponent (opcional)
}
```

### 2. CRUDManagerComponent.vue
**Gestor completo de operaciones CRUD:**
- Integración de formularios y tablas
- Gestión de estados de carga
- Configuraciones dinámicas
- Propiedades de elementos
- Estadísticas integradas
- Componentes de configuración
- Pasa props a OptionsComponent a través de CRUDGridComponent

**Props adicionales:**
```javascript
{
  // ... otras props ...
  optionsProps: Object      // Props para OptionsComponent (opcional)
}
```

**Eventos adicionales:**
- `import`: Emitido cuando se hace clic en el botón de importar
- `export`: Emitido cuando se hace clic en el botón de exportar

### 3. GoogleLoginComponent.vue
**Autenticación OAuth avanzada:**
- Carga dinámica de Google Identity Services
- Manejo de errores robusto
- Botón de fallback para desarrollo
- Validación de tokens
- Integración con backend

### 4. StatsGeneralComponent.vue
**Estadísticas en tiempo real:**
- Carga dinámica desde endpoints
- Formateo automático de valores
- Colores contextuales
- Responsive design
- Manejo de errores

---

## Sistema de Rutas

### Rutas Principales
```javascript
const routes = [
  { path: '/', name: 'Dashboard', component: HomeView, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: LoginView, meta: { requiresAuth: false } },
  { path: '/franquicias', name: 'Franquicias', component: FranchiseView, meta: { requiresAuth: true } },
  { path: '/catalogos', name: 'Catalogos', component: CatalogsView, meta: { requiresAuth: true } },
  { path: '/productos', name: 'Productos', component: ProductView, meta: { requiresAuth: true } },
  { path: '/materiales', name: 'Materiales', component: MaterialView, meta: { requiresAuth: true } },
  { path: '/servicios', name: 'Servicios', component: ServiceView, meta: { requiresAuth: true } },
  { path: '/proveedores', name: 'Proveedores', component: ProviderView, meta: { requiresAuth: true } },
  { path: '/configuracion/directiva-fiscal', name: 'FiscalDirective', component: FiscalDirective, meta: { requiresAuth: true } }
];
```

### Protección de Rutas
- **Guards automáticos**: Verificación de autenticación
- **Redirección inteligente**: Login → Dashboard si autenticado
- **Meta requiresAuth**: Control granular de acceso

---

## Configuración de API

### Axios Configuration
```javascript
// api/axios.js
const API_BASE = process.env.VUE_APP_API_URL || 'http://localhost:8082/api';
const API_USER = process.env.VUE_APP_API_USERNAME;
const API_PASS = process.env.VUE_APP_API_PASSWORD;

// Autenticación Basic + Bearer Token
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 10000
});
```

### Interceptores
- **Request**: Inyección automática de Bearer token
- **Response**: Manejo de errores 401 y redirección automática

### Endpoints Principales
```javascript
// api/franchise.js
export const getFranchises = () => api.get('/api/franchises/');
export const getFranchiseStates = () => api.get('/api/franchise-states/');
export const createFranchise = (data) => api.post('/api/franchises/', data);
export const updateFranchise = (id, data) => api.put(`/api/franchises/${id}/`, data);
export const deleteFranchise = (id) => api.delete(`/api/franchises/${id}/`);
```

---

## Docker y Despliegue

### Docker Compose
```yaml
services:
  app:
    build: ./sbm-manager
    container_name: sbm_manager
    ports:
      - '8080:8080'
    volumes:
      - ./sbm-manager:/app
      - /app/node_modules
    command: yarn serve
    networks:
      - sbm-network
    env_file:
      - ./.env
    environment:
      - VUE_APP_API_URL=${VUE_APP_API_URL}
      - VUE_APP_API_USERNAME=${VUE_APP_API_USERNAME}
      - VUE_APP_API_PASSWORD=${VUE_APP_API_PASSWORD}
```

### Variables de Entorno
```bash
VUE_APP_API_URL=http://localhost:8082/api
VUE_APP_API_USERNAME=usuario
VUE_APP_API_PASSWORD=contraseña
```

---

## Características Avanzadas

### 1. Campos Secretos
- **Ocultación automática**: Campos marcados como secretos se ocultan por defecto
- **Toggle de visibilidad**: Botón para mostrar/ocultar campos sensibles
- **Formateo**: Reemplazo con caracteres ●
- **Configuración personalizable**: Props configurables para personalizar el botón de opciones

### 1.1. OptionsComponent
**Componente de opciones configurable:**
- **Botones configurables**: Toggle de campos secretos, Importar y Exportar
- **Layout horizontal**: Botones ordenados horizontalmente con gap
- **Props configurables**: Permite personalizar cada botón desde las vistas
- **Iconos personalizables**: Configuración de iconos para cada botón
- **Estilos personalizables**: Clases CSS configurables para cada botón
- **Eventos emitidos**: Emite eventos para import/export que se propagan a las vistas

**Props disponibles:**
```javascript
{
  // Botón de toggle (mostrar/ocultar campos secretos)
  showToggleButton: Boolean,    // Mostrar botón toggle (default: true)
  toggleButtonClass: String,   // Clase CSS del botón (default: 'btn-outline-info')
  toggleButtonText: String,    // Texto del botón (default: '')
  toggleIconClass: String,     // Clase adicional para el icono (default: '')
  iconShow: String,             // Icono cuando está visible (default: 'fas fa-eye')
  iconHide: String,            // Icono cuando está oculto (default: 'fas fa-eye-slash')
  
  // Botón de importar
  showImportButton: Boolean,    // Mostrar botón importar (default: false)
  importButtonClass: String,    // Clase CSS del botón (default: 'btn-outline-success')
  importButtonText: String,     // Texto del botón (default: 'Importar')
  importIcon: String,           // Icono del botón (default: 'fas fa-file-import')
  
  // Botón de exportar
  showExportButton: Boolean,    // Mostrar botón exportar (default: false)
  exportButtonClass: String,    // Clase CSS del botón (default: 'btn-outline-primary')
  exportButtonText: String,     // Texto del botón (default: 'Exportar')
  exportIcon: String             // Icono del botón (default: 'fas fa-file-export')
}
```

**Eventos emitidos:**
- `toggle-secret-fields`: Emitido al hacer toggle de campos secretos
- `import`: Emitido al hacer clic en el botón de importar
- `export`: Emitido al hacer clic en el botón de exportar

**Uso en vistas:**
```javascript
// En cualquier vista que use CRUDManagerComponent
const optionsProps = ref({
  // Botón de toggle
  showToggleButton: true,
  toggleButtonClass: 'btn-outline-info',
  toggleButtonText: '',
  iconShow: 'fas fa-eye',
  iconHide: 'fas fa-eye-slash',
  
  // Botón de importar
  showImportButton: true,
  importButtonClass: 'btn-outline-success',
  importButtonText: 'Importar',
  importIcon: 'fas fa-file-import',
  
  // Botón de exportar
  showExportButton: true,
  exportButtonClass: 'btn-outline-primary',
  exportButtonText: 'Exportar',
  exportIcon: 'fas fa-file-export'
});

// Pasar a CRUDManagerComponent
<CRUDManagerComponent
  :optionsProps="optionsProps"
  @import="handleImport"
  @export="handleExport"
  // ... otras props ...
/>

// Handlers en la vista
const handleImport = () => {
  // Implementar lógica de importación
  console.log('Importar datos');
};

const handleExport = () => {
  // Implementar lógica de exportación
  console.log('Exportar datos');
};
```

### 2. Búsqueda Inteligente
- **Debounce**: Búsqueda optimizada con delay
- **Filtrado en tiempo real**: Actualización automática de resultados
- **Múltiples campos**: Búsqueda en todos los campos visibles

### 3. Paginación Avanzada
- **Navegación intuitiva**: Botones anterior/siguiente
- **Información contextual**: "Mostrando X-Y de Z elementos"
- **Páginas visibles**: Navegación directa a páginas específicas

### 4. Selección Múltiple
- **Checkbox individual**: Selección por elemento
- **Select all**: Selección masiva
- **Contador dinámico**: Muestra elementos seleccionados
- **Acciones masivas**: Operaciones en lote

### 5. Formateo de Datos
- **Tipos automáticos**: Detección y formateo de tipos
- **Imágenes Cloudinary**: Visualización automática
- **URLs**: Enlaces clickeables
- **Ratings**: Estrellas visuales
- **Estados**: Nombres legibles

---

## Estilos y Diseño

### Fuentes Personalizadas
- **DINAlternate-Bold**: Títulos y elementos importantes
- **Bagitte-Regular**: Texto secundario

### Paleta de Colores
- **Primario**: #e53935 (Rojo SBM)
- **Secundario**: #6c757d (Gris)
- **Éxito**: #28a745 (Verde)
- **Advertencia**: #ffc107 (Amarillo)
- **Peligro**: #dc3545 (Rojo)

### Responsive Design
- **Mobile-first**: Diseño adaptativo
- **Breakpoints**: 768px, 480px
- **Sidebar colapsible**: Navegación móvil optimizada

---

## Funcionalidades por Módulo

### Dashboard (HomeView)
- **Estadísticas generales**: Usuarios, reportes, configuraciones
- **Gráficos Chart.js**: Actividad semanal
- **Lista de usuarios**: Estado y actividad reciente

### Franquicias (FranchiseView)
- **CRUD completo**: Crear, leer, actualizar, eliminar
- **Estados dinámicos**: Gestión de estados de franquicia
- **Configuraciones**: Precios y configuraciones específicas
- **Propiedades**: Información detallada de cada franquicia

### Catálogos (CatalogsView)
- **Selección de franquicia**: Dropdown dinámico
- **CRUD de catálogos**: Gestión por franquicia
- **Configuraciones de precios**: Sistema de precios por SKU
- **Propiedades avanzadas**: Información detallada

### Productos, Materiales, Servicios, Proveedores
- **CRUD estándar**: Operaciones básicas
- **Campos específicos**: Configuración por tipo
- **Estados**: Gestión de estados activo/inactivo

### Configuración
- **Directiva Fiscal**: Configuraciones específicas
- **Sistema modular**: Fácil extensión

---

## Comandos de Desarrollo

### Instalación y Configuración
```bash
# Instalar dependencias
yarn install

# Servidor de desarrollo
yarn serve

# Build de producción
yarn build

# Docker
docker-compose up
```

### Análisis de Código (SonarQube)
```bash
# Configurar PATH de sonar-scanner
export PATH="/path/to/sonar-scanner/bin:$PATH"

# Analizar proyecto
sonar-scanner \
  -Dsonar.projectKey=SBM-suite-MANAGER \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=sqp_63d28654dd6116f873d80ad75cd0980a76d195c5
```

---

## Consideraciones de Seguridad

### Autenticación
- **OAuth 2.0**: Autenticación segura con Google
- **JWT Tokens**: Manejo seguro de sesiones
- **Interceptores**: Validación automática de tokens
- **Logout automático**: Limpieza de datos al cerrar sesión

### Variables de Entorno
- **Configuración segura**: Uso de variables de entorno
- **Docker secrets**: Integración con Docker secrets
- **No hardcoding**: Evitar credenciales en código

### CORS y Headers
- **Configuración CORS**: Headers apropiados
- **X-Requested-With**: Identificación de peticiones AJAX
- **Content-Type**: Validación de tipos de contenido

---

## Escalabilidad y Mantenimiento

### Arquitectura Modular
- **Componentes reutilizables**: DRY principle
- **Composables**: Lógica reutilizable
- **API centralizada**: Gestión unificada de endpoints

### Performance
- **Lazy loading**: Carga bajo demanda
- **Debounce**: Optimización de búsquedas
- **Paginación**: Carga eficiente de datos
- **Caching**: Almacenamiento local inteligente

### Extensibilidad
- **Sistema de plugins**: Fácil adición de módulos
- **Configuración dinámica**: Campos y validaciones flexibles
- **Temas**: Sistema de estilos modular

---

## Notas de Desarrollo

### Convenciones de Código
- **Vue 3 Composition API**: Uso consistente de composables
- **ES6+**: Sintaxis moderna de JavaScript
- **Bootstrap 5**: Framework CSS principal
- **Font Awesome**: Iconografía consistente

### Testing
- **Desarrollo manual**: Testing funcional durante desarrollo
- **Validación de formularios**: Feedback visual inmediato
- **Manejo de errores**: Interceptores y try-catch

### Documentación
- **Comentarios en código**: Explicación de lógica compleja
- **Props documentadas**: Descripción de interfaces
- **README actualizado**: Instrucciones de instalación

---

## Estado Actual del Proyecto

### ✅ Completado
- [x] Arquitectura Vue 3 con Composition API
- [x] Sistema de autenticación OAuth con Google
- [x] Componentes CRUD reutilizables
- [x] Sistema de rutas protegidas
- [x] Dashboard con estadísticas
- [x] Gestión de franquicias
- [x] Gestión de catálogos
- [x] Interfaz responsive
- [x] Docker y Docker Compose
- [x] Variables de entorno
- [x] Manejo de errores
- [x] Formateo de datos
- [x] Búsqueda y paginación
- [x] Selección múltiple
- [x] Campos secretos
- [x] Configuraciones dinámicas
- [x] OptionsComponent configurable desde vistas
- [x] Botones de importar/exportar en OptionsComponent

### 🔄 En Desarrollo
- [ ] Testing automatizado
- [ ] Optimización de performance
- [ ] Documentación de API
- [ ] Sistema de notificaciones
- [ ] Exportación de datos
- [ ] Filtros avanzados

### 📋 Pendiente
- [ ] Integración con backend completo
- [ ] Sistema de permisos granular
- [ ] Auditoría de acciones
- [ ] Backup automático
- [ ] Monitoreo y logs
- [ ] CI/CD pipeline

---

**Contacto:**
- Desarrollador principal: franciscomendoza
- Repositorio: SBM-SUITE/SBM-MANAGER
- Versión: 0.1.0
- Última actualización: Diciembre 2024 