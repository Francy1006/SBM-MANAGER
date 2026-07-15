```text
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

    █████████████████████████████████████████████████████████████████
    ██  ║                                                       ║  ██
    ██  ║             ░▒▓ SBM MANAGER ▓▒░                       ║  ██
    ██  ║                                                       ║  ██
    ██  ║    ┌─────────────────────────────────────────────┐    ║  ██
    ██  ║    │  > SBM Suite enterprise frontend            │    ║  ██
    ██  ║    │  > Products, Orders, Catalogs and Clients   │    ║  ██
    ██  ║    │  > Client and platform management UI        │    ║  ██
    ██  ║    │  > Vue 3 reusable CRUD architecture         │    ║  ██
    ██  ║    │  > STATUS: ACTIVE / OPERATIONAL             │    ║  ██
    ██  ║    └─────────────────────────────────────────────┘    ║  ██
    ██  ║                                                       ║  ██
    ██  ║          ░▒▓ MANAGEMENT ACCESS GRANTED ▓▒░            ║  ██
    ██  ║                                                       ║  ██
    ██  ╚═══════════════════════════════════════════════════════╝  ██
    ██                                                             ██
    █████████████████████████████████████████████████████████████████
```

# SBM Manager

Enterprise frontend for operating and administering **SBM Suite**.

`sbm-manager` is a Vue 3 application that provides reusable management interfaces for products, orders, catalogs, materials, services, providers, clients, franchises and platform configuration.

## Role within SBM Suite

```text
Ditaly Pasta client operation
→ SBM Manager
→ DP-API
→ client-owned business data and rules

Internal or critical platform operation
→ SBM Manager internal screen
→ SBM-API
→ platform administration and critical processes
```

The stable ownership rule is:

```text
Client operation     → dp-api
Platform operation   → sbm-api
```

`dp-api` owns regular Ditaly Pasta operations such as products, materials, services, providers, catalogs, prices and other permitted business configuration.

`sbm-api` remains the internal API for franchise and tenant creation, provisioning, contracted-module activation, global configuration, authentication and other critical platform processes.

The two APIs are not interchangeable. SBM Manager must select the backend explicitly according to domain ownership instead of redirecting all requests through one global base URL.

## Capabilities

- Authenticated dashboard and protected business routes.
- Product, material, service and catalog management.
- Order creation, detail management and calculations.
- Provider, client, menu and fiscal configuration interfaces.
- Franchise and platform administration.
- Reusable CRUD grids, forms, property panels and calculation components.
- Explicit `dpApi` and `sbmApi` domain clients.
- Docker-based local execution and production asset generation.

## Technology stack

- Vue 3
- Vue Router 4
- Vuex 4
- Axios
- Bootstrap 5
- Chart.js
- date-fns
- SheetJS / xlsx
- Vue CLI 5
- Babel
- Docker Compose
- Node.js 20 Alpine in the frontend image

## Main views

| Route | View | Responsibility |
|---|---|---|
| `/` | Dashboard | Authenticated application home |
| `/login` | Login | User authentication |
| `/franquicias` | Franchises | Internal franchise management |
| `/catalogos` | Catalogs | Catalog and item configuration |
| `/pedidos` | Orders | Order creation and detail management |
| `/productos` | Products | Product management and pricing information |
| `/materiales` | Materials | Material management |
| `/servicios` | Services | Service management |
| `/menus` | Menus | Menu configuration |
| `/proveedores` | Providers | Provider management |
| `/clientes` | Clients | Client management |
| `/configuracion/directiva-fiscal` | Fiscal directive | Fiscal configuration |

Vue Router uses hash history and protects business routes through authentication metadata.

## Reusable frontend architecture

The application is built around shared management components:

| Component | Responsibility |
|---|---|
| `CRUDManagerComponent.vue` | Coordinates list, create, update, properties and configuration flows |
| `CRUDGridComponent.vue` | Search, sorting, pagination, selection, detail and logical deletion |
| `SimpleFormComponent.vue` | Generic forms and dynamic selectors |
| `PropertiesComponent.vue` | General, advanced, configuration, linking and price information |
| `CalculationComponent.vue` | Formula variables and calculated results |
| `ConfigFormComponent.vue` | Resource-specific configuration forms |
| `ConfigLinkTableComponent.vue` | Product, material and service linking |
| `GridDetailContainerComponent.vue` | Expandable resource detail containers |
| `GridDetailTableComponent.vue` | Search, creation and editing inside detail tables |

These components provide consistent behavior across Franchise, Catalog, Order, Product, Material, Service, Provider and Client screens while allowing each domain to select its own API client and resource identity.

## Repository structure

```text
SBM-MANAGER/
├── .env
├── docker-compose.yml
├── PROJECT_CONTEXT.md
├── README.md
└── sbm-manager/
    ├── Dockerfile
    ├── package.json
    ├── package-lock.json
    ├── yarn.lock
    ├── vue.config.js
    ├── public/
    └── src/
        ├── api/
        ├── components/
        ├── composables/
        ├── constants/
        ├── router/
        ├── utils/
        └── views/
```

## API integration

### API clients

`src/api/clients.js` creates two explicit Axios clients:

```text
dpApi
→ Ditaly Pasta client operations in DP-API

sbmApi
→ Franchise, authentication and internal platform operations
```

`src/api/axios.js` exports `sbmApi` as the default internal client. Domain views inject `dpApi` for client-owned operations.

Environment variables:

```text
VUE_APP_API_URL
VUE_APP_SBM_API_URL
VUE_APP_DP_API_URL
VUE_APP_API_USERNAME
VUE_APP_API_PASSWORD
```

Both clients:

- Uses JSON request and response headers.
- Apply a 10-second timeout.
- Normalize their API base URL with a trailing slash.

`sbmApi` reads the current token from `localStorage`, sends it as `Authorization: Bearer <token>` and clears the SBM session after HTTP 401.

`dpApi` uses Basic Authentication for DP-API and never overwrites it with the SBM Bearer token. A DP-API authorization failure does not clear the SBM session.

### API boundary

The frontend uses two explicit clients:

```text
dpApi
→ Ditaly Pasta client operations

sbmApi
→ internal and critical platform operations
```

Every view selects its API according to domain ownership. Client operations use `dpApi`; internal operations use `sbmApi`.

## Product integration

Product operations are served by DP-API. Product rows use the integer `id` as their REST identifier while `code` and SKU remain business identifiers.

Validated local API mapping:

```text
SBM Manager → http://localhost:8080
DP-API      → http://localhost:8081
SBM-API     → http://localhost:8082
```

Canonical Product endpoints:

```text
GET   /api/products/
GET   /api/products/{id}/
POST  /api/products/
PATCH /api/products/{id}/
POST  /api/products/{id}/delete/
```

Product deliberately does not use `PUT` or HTTP `DELETE`.

Product supports paginated lists, detail retrieval, creation, partial updates, price information and logical deletion. Deleted rows are excluded from normal queries by DP-API.

## Authentication

The current frontend stores these values in `localStorage`:

```text
uuid
email
name
token
```

`sbmApi` sends the stored token using the Bearer scheme.

DP-API protects client operations through authenticated access. `dpApi` preserves Basic Authentication and does not send the SBM Bearer token.

Product audit fields are:

```text
created_by
updated_by
deleted_by
```

Audit attribution is associated with the authenticated business user and is enforced by the API contract.

## Local development

### Requirements

- Docker
- Docker Compose
- Existing external Docker network named `sbm-network`

Create the network only when it does not already exist:

```bash
docker network create sbm-network
```

### Environment

Create or configure the root `.env` file used by Docker Compose.

Environment variables:

```text
VUE_APP_API_URL
VUE_APP_SBM_API_URL
VUE_APP_DP_API_URL
VUE_APP_API_USERNAME
VUE_APP_API_PASSWORD
```

Local API mapping:

```text
VUE_APP_SBM_API_URL=http://localhost:8082/api
VUE_APP_DP_API_URL=http://localhost:8081/api
```

`VUE_APP_SBM_API_URL` and `VUE_APP_DP_API_URL` define the explicit domain boundary. `VUE_APP_API_URL` provides compatibility for internal consumers.

Never commit real credentials. Variables prefixed with `VUE_APP_` are bundled into browser-delivered frontend code and must not be treated as secret storage.

### Start the application

From the repository root:

```bash
docker compose up -d --build
```

### Validate the container

```bash
docker ps
```

### View logs

```bash
docker compose logs -f app
```

### Stop the application

```bash
docker compose down
```

## Local URLs

With the default Docker port mapping:

```text
SBM Manager: http://localhost:8080
```

Vue Router uses hash history. Example authenticated routes therefore resolve as:

```text
Products: http://localhost:8080/#/productos
Orders:   http://localhost:8080/#/pedidos
Clients:  http://localhost:8080/#/clientes
```

## Run without Docker

From the Vue application directory:

```bash
cd sbm-manager
yarn install
yarn serve
```

Build production assets with:

```bash
yarn build
```

## Quality assurance

- Business routes require authentication.
- Collections support pagination, search and ordering.
- Resource detail and mutation operations use canonical identifiers.
- Product uses PATCH rather than PUT.
- Product logical deletion uses the documented POST action and never HTTP DELETE.
- Franchise and platform operations remain isolated in `sbm-api`.
- Shared CRUD behavior is consistent across business modules.
- Production assets are generated with `yarn build`.

## AI integration

Integration flow:

```text
Client user
→ SBM Manager / external channel
→ SBM AI Assistant
→ DP-API Tool
→ validated business operation
→ structured response
```

The AI layer must never bypass `dp-api`, access business tables directly or reproduce domain validation rules in the frontend.

## Project documentation

`PROJECT_CONTEXT.md` is the persistent technical memory for the current repository state, active work, validated contracts, risks and continuation steps.

It is intentionally separate from this README:

- `README.md`: project overview and developer entry point.
- `PROJECT_CONTEXT.md`: detailed technical and historical context for ongoing development.

## Security notes

- Never commit `.env` files containing real secrets.
- Do not copy credentials or tokens into documentation, examples or logs.
- Treat browser-side environment variables as public configuration.
- Validate token compatibility independently for each API.
- Keep internal Franchise, provisioning and platform administration operations on `sbm-api`.
- Add explicit authorization for tenant, franchise, client and module scope.
- Do not expose or reconstruct hidden Product audit logs in the frontend.
- Audit all AI-triggered write operations.

## License

Private portfolio and development project unless a separate license is added.

---

```text
Signed by Conker
SBM Suite
```
