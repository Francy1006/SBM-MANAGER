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
    ██  ║    │  > STATUS: ACTIVE / IN DEVELOPMENT          │    ║  ██
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

## Current status

- Active Vue 3 repository.
- Local Docker development environment available.
- Authentication and protected routes implemented.
- Reusable CRUD grids, forms, property panels and calculation components available.
- Orders module under active development.
- Product is the first capability selected for vertical migration to `dp-api`.
- Product currently still consumes the shared API client.
- Explicit `dp-api` and `sbm-api` Axios clients are pending implementation.
- Automated test, lint and type-check scripts are not currently configured.
- Production hardening is pending.

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

These components are shared by multiple domains. API migrations must preserve their existing defaults and introduce Product-specific behavior explicitly to avoid regressions in Franchise, Catalog, Order, Material, Service, Provider and Client screens.

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

### Current implementation

`src/api/axios.js` currently exports one shared Axios instance based on:

```text
VUE_APP_API_URL
VUE_APP_API_USERNAME
VUE_APP_API_PASSWORD
```

The client:

- Uses JSON request and response headers.
- Applies a 10-second timeout.
- Reads the current token from `localStorage`.
- Sends it as `Authorization: Bearer <token>`.
- Clears local authentication data and redirects to login after HTTP 401.

This is transitional behavior. A single shared API client does not express the required domain boundary.

### Target API boundary

The frontend target is two explicit clients:

```text
dpApi
→ Ditaly Pasta client operations

sbmApi
→ internal and critical platform operations
```

Planned environment variables:

```text
VUE_APP_DP_API_URL
VUE_APP_SBM_API_URL
```

Existing consumers should continue using `sbmApi` by default while each client capability is migrated vertically and validated.

Do not globally replace `VUE_APP_API_URL` with the DP-API URL.

## Product migration

Product is the first frontend capability being migrated from the shared SBM-API consumer to DP-API.

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

The migration sequence is:

1. Introduce explicit `dpApi` and `sbmApi` clients.
2. Route Product list and detail to `dp-api`.
3. Keep Franchise and authentication on `sbm-api`.
4. Normalize Product row identity and detail lookup to integer `id`.
5. Resolve Product price projection and calculation data.
6. Resolve authenticated audit identity.
7. Resolve server or frontend ownership of Product code and SKU generation.
8. Adapt Product create and PATCH payloads.
9. Adapt logical delete to the detail action.
10. Validate all non-Product CRUD screens before deprecating the old Product consumer.

For detailed migration state, incompatibilities and validated Product contract, read `PROJECT_CONTEXT.md`.

## Authentication

The current frontend stores these values in `localStorage`:

```text
uuid
email
name
token
```

The shared Axios interceptor sends the token using the Bearer scheme.

DP-API currently requires an explicit authentication compatibility decision. Its validated Session/Basic configuration must not be assumed to accept the existing SBM Bearer token. Authentication failures must be resolved through a valid shared identity contract, never by weakening permissions.

The transitional Product audit fields are:

```text
created_by
updated_by
deleted_by
```

The stored SBM user UUID must not be sent as a DP-API business user code until that identity mapping is confirmed. The final security model should derive audit identity from the authenticated backend user rather than accepting client-controlled attribution.

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

Current variables:

```text
VUE_APP_API_URL
VUE_APP_API_USERNAME
VUE_APP_API_PASSWORD
```

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

No automated test, lint or type-check script is currently defined in `package.json`.

## Validation expectations

Before completing a vertical API migration:

1. Confirm the route remains protected.
2. Validate the collection and detail endpoints.
3. Validate pagination, search and ordering.
4. Confirm the correct resource identifier is used.
5. Confirm only documented writable fields are sent.
6. Verify Product never sends PUT or HTTP DELETE.
7. Verify logical deletion removes the row from normal queries.
8. Verify Franchise and authentication still use `sbm-api`.
9. Regression-test all shared CRUD consumers.
10. Run a production build successfully.

## AI integration

Planned flow:

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

`PROJECT_CONTEXT.md` is the persistent technical memory for architecture, validated contracts, migration risks and exact continuation steps.

It is intentionally separate from this README:

- `README.md`: project overview and developer entry point.
- `PROJECT_CONTEXT.md`: detailed technical and historical context for ongoing development.

## Security notes

- Never commit `.env` files containing real secrets.
- Do not copy credentials or legacy tokens into documentation, examples or logs.
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
