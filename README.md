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
- Product property inspection and modification with domain-backed relation selectors.
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
| `ConfirmComponent.vue` | Reusable blocking confirmation for destructive or sensitive actions |
| `SimpleFormComponent.vue` | Generic forms, reactive dynamic selectors and injected API clients |
| `PropertiesComponent.vue` | General information, controlled modification, advanced configuration, linking and pricing |
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

- Use JSON request and response headers.
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

Logical deletion requires explicit confirmation through `ConfirmComponent`; cancelling restores the grid without issuing a request.

The Product Properties panel provides controlled modification through `SimpleFormComponent`. Partial updates use the integer Product `id`, submit the Product audit identity and keep relation selection connected to DP-API:

```text
Provider → /api/providers/
Type     → /api/item-types/
Group    → /api/item-groups/
Category → /api/item-categories/
Package  → /api/packages/
```

Dynamic selectors support direct collections and paginated API responses while preserving the selected foreign-key value.

## Material integration

Material operations are served by DP-API and use the integer `id` as the REST identifier:

```text
GET     /api/materials/
GET     /api/materials/{id}/
POST    /api/materials/
PATCH   /api/materials/{id}/
POST    /api/materials/{id}/delete/
GET     /api/materials/active/
HEAD    /api/materials/
OPTIONS /api/materials/
```

Create generates the Material business `code` in the frontend, submits `created_by`, and leaves SKU generation to DP-API. Properties performs changed-field PATCH requests with `updated_by`; Provider is immutable after creation. Material price configuration options are restricted to confirmed `record_type=2` rows, while the grid displays the embedded `price_configuration_label`. Logical deletion posts `deleted_by` only after confirmation through `ConfirmComponent`.

Legacy Materials may have no price projection. They can still update unrelated fields; assigning a price requires both `base_net_amount` and `price_configuration`.

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

The first automated frontend QA vertical covers Product and the shared components used by its current flow. It uses Vitest, Vue Test Utils, jsdom and V8 coverage.

The mandatory execution policy is container-only:

```text
Node/Yarn dependencies and commands → frontend container
Python dependencies and commands   → project container or dedicated virtual environment
Host package managers/runtimes      → prohibited
```

### Requirements

- Docker and Docker Compose.
- External `sbm-network` network already created.
- The `app` image built from the current `package.json` and `yarn.lock`.
- A running SonarQube instance only when static analysis is required.

No host Node, npm, npx or Yarn installation is required or permitted.

### Install dependencies

Dependency installation occurs while building the image:

```bash
docker compose build app
```

For an already running development container whose anonymous dependency volume must be synchronized:

```bash
docker compose exec app yarn install --frozen-lockfile
```

Never run `npm install`, `yarn install`, Vitest or Vue CLI directly on the host.

### Run tests

Run the deterministic Product suite once:

```bash
docker compose exec app yarn test:run
```

Run a specific test file:

```bash
docker compose exec app yarn test:run src/views/__tests__/ProductView.spec.js
```

### Watch mode

With the development container running:

```bash
docker compose exec app yarn test
```

Stop watch mode with `Ctrl+C`.

### Coverage

From the repository root:

```bash
./scripts/coverage.sh
```

The script validates Docker and the QA dependencies, runs tests non-interactively in an ephemeral container, enforces thresholds and checks the LCOV artifact.

Generated reports are ignored by Git:

```text
sbm-manager/coverage/lcov.info
sbm-manager/coverage/cobertura-coverage.xml
sbm-manager/coverage/index.html
```

Current Product gate:

```text
statements >= 70%
lines      >= 70%
functions  >= 70%
branches   >= 60%
```

Validated baseline (2026-07-21): 40/40 tests passed; Vitest reported 70.03% statements, 70.03% lines, 72.83% functions and 66.90% branches.

### SonarQube variables

Configure both variables in the selected ignored environment file. During the current transition the default is `.env`; once `.env.dev` exists, it becomes the automatic default. Do not commit or print the token:

```bash
SONAR_HOST_URL=http://host.docker.internal:9000
SONAR_TOKEN=<configured-locally>
```

On macOS, a SonarQube server running on the host is normally reached from the scanner container through `host.docker.internal`. The scanner never hardcodes this URL.

### Run SonarScanner

Generate coverage first, then run:

```bash
./scripts/sonar-scan.sh
```

Select another environment explicitly when required:

```bash
ENV_FILE=.env.prod ./scripts/sonar-scan.sh
```

`ENV_FILE` only selects the file passed to the disposable scanner container; Node, Yarn and SonarScanner are never installed on the host.

The scanner uses a disposable Docker container, mounts the repository read-only as analysis input, imports `sbm-manager/coverage/lcov.info`, uses explicit `linux/amd64` compatibility on Mac ARM and caches downloaded analyzer plugins under the ignored `.sonar/` directory.

### Run the complete QA flow

```bash
./scripts/qa-check.sh
```

The order is fixed and fail-fast:

```text
tests and coverage
→ SonarScanner
→ SonarQube Quality Gate processing
```

### Common errors

- `faltan dependencias QA en la imagen`: rebuild with `docker compose build app`.
- `SONAR_HOST_URL no está definida` or `SONAR_TOKEN no está definida`: add the missing variable to the environment file selected by `ENV_FILE`.
- `falta .../coverage/lcov.info`: run `./scripts/coverage.sh` first.
- SonarScanner `Connection reset` while downloading the JavaScript plugin: inspect SonarQube resources/logs and retry after the server can deliver the analyzer. The scanner cache preserves plugins downloaded successfully.
- Sonar JavaScript bridge `unresponsive` or `Connection refused`: increase the memory assigned to Docker Desktop. This project failed with about 4 GB shared by all containers and completed with about 6 GB; the scanner's Node bridge runs only during analysis.
- Bundle-size and outdated Browserslist warnings do not fail the current production build; they remain documented technical debt.

Validated local SonarQube baseline (2026-07-21): Quality Gate passed, 69.6% Sonar coverage, Reliability C (10 open bugs), Security A (0 vulnerabilities and 0 hotspots), Maintainability A (52 code smells), and 1.9% duplicated lines. The current gate has no blocking conditions for these overall-code findings; passing it does not erase that debt.

### Product guarantees covered

- Product CRUD uses `dpApi`; Franchise loading remains on `sbmApi`.
- Lists, search, ordering, pagination, empty/loading/error states and integer detail identity are verified.
- Creation uses POST with trusted `code` and `created_by`; SKU, Price, calculated amounts and internal log data cannot be injected from the form.
- Modification uses changed-field PATCH with `updated_by`; PUT is never used.
- Logical deletion requires confirmation and uses POST `products/{id}/delete/`; HTTP DELETE is never used.
- Product relation selectors and confirmed `record_type=1` price configuration load through the injected DP client without real HTTP traffic in tests.
- Production assets continue to build inside the frontend container.

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

- `.env` files containing real secrets are excluded from version control.
- Credentials and tokens are excluded from documentation, examples and logs.
- Browser-side environment variables are treated as public configuration.
- Token compatibility is evaluated independently for each API.
- Internal Franchise, provisioning and platform administration operations remain on `sbm-api`.
- Tenant, franchise, client and module scopes use explicit authorization.
- Hidden Product audit logs are not exposed or reconstructed in the frontend.
- AI-triggered write operations are audited.

## License

Private portfolio and development project unless a separate license is added.

---

```text
Signed by Conker
SBM Suite
```
