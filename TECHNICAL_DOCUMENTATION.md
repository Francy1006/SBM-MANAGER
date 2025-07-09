# Calavera Pirata Digital

                                                       █                                                       █──▄────▄▄▄▄▄▄▄────▄───
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
    ██  ║    │  > Internal and general purposes            │    ║  ██
    ██  ║    │  > BASIC CRUD                               │    ║  ██
    ██  ║    │  > operational & finances                   │    ║  ██
    ██  ║    │  > STATUS: ACTIVE                           │    ║  ██
    ██  ║    └─────────────────────────────────────────────┘    ║  ██
    ██  ║                                                       ║  ██
    ██  ║         ░▒▓ SBM-ADMIN ACCESS GRANTED ▓▒░              ║  ██
    ██  ║                                                       ║  ██
    ██  ╚═══════════════════════════════════════════════════════╝  ██
    ██                                                             ██
    ████████████████████████████████████████████████████████████████



# SBM-MANAGER — Documentación Técnica

## Descripción General

SBM-MANAGER es una aplicación de administración de franquicias desarrollada con **Vue 3** (Composition API) para el frontend y **Django REST Framework** para el backend, ambos orquestados con **Docker**. El sistema permite la gestión CRUD de franquicias y sus estados, con autenticación básica, paginación, búsqueda y una interfaz inspirada en Django Admin Suit.

---

## Estructura del Proyecto

```
SBM-MANAGER/
├── sbm-manager/                # Frontend Vue 3
│   ├── src/
│   │   ├── components/         # Componentes reutilizables (CRUDGridComponent, formularios, Sidebar, etc.)
│   │   ├── apps/               # Apps específicas (franchise, ...)
│   │   ├── views/              # Vistas principales
│   │   ├── api/axios.js        # Configuración centralizada de Axios
│   │   └── router/             # Configuración de Vue Router
│   └── ...
├── backend/                    # Backend Django REST
│   ├── api/                    # App principal de la API
│   ├── manage.py
│   └── ...
├── docker-compose.yml          # Orquestación de servicios
├── .env                        # Variables de entorno
└── TECHNICAL_DOCUMENTATION.md  # (Este documento)
```

---

## Docker y Variables de Entorno

- **Frontend y backend corren en contenedores separados.**
- Variables de entorno para la API y autenticación se inyectan vía Docker Compose y `.env`.
- Ejemplo de variables relevantes:
  - `VUE_APP_API_URL=http://localhost:8000/api/`
  - `VUE_APP_BASIC_AUTH_USER=usuario`
  - `VUE_APP_BASIC_AUTH_PASS=contraseña`

---

## Frontend (Vue 3)

### Componentes Principales

- **CRUDGridComponent.vue**: Tabla dinámica con paginación, búsqueda, selección múltiple, botones de acción (Configurar, Eliminar), integración con la API y estilos tipo Admin Suit.
- **Formularios de Franquicia**: Permiten crear y editar franquicias, con validación y feedback visual.
- **Sidebar**: Navegación lateral con enlaces e iconos, inspirado en Django Admin Suit.
- **Vue Router**: Configurado para navegación entre Dashboard y Franquicias.

### Vue Router

- Definido en `src/router/index.js`.
- Rutas principales:
  - `/dashboard` — Vista principal
  - `/franquicias` — Administración de franquicias

### Autenticación y Axios

- **Autenticación Basic Auth**: Centralizada en `api/axios.js`, usando variables de entorno.
- **Inyección de variables**: Usando `process.env` y Docker Compose.
- **Interceptors**: Manejo de errores y autenticación en todas las peticiones.

---

## Backend (Django REST)

### Endpoints Principales

- `GET /api/franchises/` — Listado de franquicias (soporta paginación y búsqueda)
- `POST /api/franchises/` — Crear franquicia
- `PUT /api/franchises/<id>/` — Editar franquicia
- `POST /api/franchises/soft_delete/` — Soft delete (cambia estado a 2)
- `GET /api/franchise_states/` — Listado de estados de franquicia

#### Ejemplo de Endpoint de Búsqueda y Paginación

```
GET /api/franchises/?search=texto&page=1&page_size=20
```
Respuesta:
```json
{
  "count": 42,
  "next": "http://localhost:8000/api/franchises/?page=2&page_size=20",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Franquicia 1",
      "siglas": "F1",
      "state": 1,
      "field_verbose_names": {"name": "Nombre", "siglas": "Siglas", "state": "Estado"}
    },
    ...
  ]
}
```

#### Soft Delete
- `POST /api/franchises/soft_delete/` con body `{ "ids": [1] }` cambia el estado de la franquicia a 2 (eliminado).

---

## Flujo de CRUD y Búsqueda

1. **Listado**: El componente `CRUDGridComponent` carga la lista paginada desde la API.
2. **Búsqueda**: El input de búsqueda hace peticiones al endpoint con el parámetro `search`.
3. **Paginación**: Navegación entre páginas usando los parámetros `page` y `page_size`.
4. **Crear/Editar**: Formularios modales permiten alta y edición, usando POST/PUT.
5. **Soft Delete**: El botón Eliminar realiza un POST a `/soft_delete/`.
6. **Selección múltiple**: Checkbox para seleccionar filas, con contador y acciones masivas.

---

## Consideraciones de Desarrollo y Despliegue

- **Variables de entorno**: Usar siempre variables para URLs y credenciales.
- **CORS**: Configurar correctamente en Django para permitir acceso desde el frontend.
- **Docker**: Usar `docker-compose up` para levantar todo el stack.
- **Estilos**: Inspirados en Django Admin Suit, usando Bootstrap y clases personalizadas.
- **Validación**: Formularios con validación y feedback visual.
- **Escalabilidad**: Se recomienda mantener la paginación en el backend para eficiencia.

---

## Notas Finales

- El sistema está preparado para crecer con más apps y endpoints.
- La arquitectura permite desacoplar y escalar cada parte (frontend/backend) de forma independiente.
- Para contribuir, seguir las convenciones de Vue 3 y Django REST.

---

**Contacto:**
- Desarrollador principal: franciscomendoza
- Repositorio: (agregar URL si aplica) 