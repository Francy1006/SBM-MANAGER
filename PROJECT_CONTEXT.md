# PROJECT_CONTEXT.md

> **Target repository:** `SBM-MANAGER`
>
> **First version created:** 2026-07-15
>
> **Purpose of this file**
>
> This document is persistent project memory for an LLM working on `sbm-manager`. It is not a README, a public project presentation, or a complete API reference. It preserves the product boundary, verified frontend structure, integration risks, current migration state, and exact next steps required to continue development in a new conversation.
>
> **Accuracy note**
>
> This context began with a read-only audit on 2026-07-15 and was updated on 2026-07-21 after inspecting the current `SBM-MANAGER` and `DP-API` repositories to define the Product frontend QA and SonarQube implementation. Secret and credential values are intentionally omitted.
>
> **Implementation update — 2026-07-15 (historical)**
>
> The first Product frontend cutover has now been implemented. `sbm-manager` has explicit `sbmApi` and `dpApi` Axios clients. Product list and detail use `dp-api`; Franchise, authentication and all default generic CRUD consumers remain on `sbm-api`. Product writes and legacy advanced configuration are intentionally disabled until the remaining contracts are validated. The frontend container build passed and the application responds on port 8080.
>
> **Implementation update — 2026-07-17 (historical)**
>
> Product list, detail and the Properties flow have been validated interactively. Properties can now open `SimpleFormComponent` in modification mode and submit a restricted Product PATCH through `dpApi` using the integer Product `id`. The adapter adds `updated_by` from the authenticated SBM `uuid`, while the remaining generic CRUD consumers keep their previous `sbmApi` behavior. Product create, price modification and logical delete remain disabled. Dynamic Product selectors load their options through `dpApi` and keep those options in reactive form state.

> **Implementation update — 2026-07-20 (Product)**
>
> The Product vertical migration is concluded. Product list/detail, creation, Properties modification (including Product price configuration), and logical deletion are active through `dpApi`. Product uses integer `id`, generates the create `code` in the frontend, injects `created_by`/`updated_by`/`deleted_by` from the authenticated SBM `uuid`, displays `price_configuration_label`, filters Product price configurations by `record_type=1`, sends changed PATCH fields only, and deletes through `POST /api/products/{id}/delete/`. `ConfirmComponent` now blocks the CRUD grid until delete is explicitly confirmed or cancelled. Product never uses PUT or HTTP DELETE. The Product flow was validated interactively and the frontend production build passes.
>
> **Implementation update — 2026-07-20 (Material, current)**
>
> Material was audited against the new DP-API hexagonal implementation and migrated to `dpApi` for list, detail, create, PATCH and logical delete. It uses integer `id`, generates `code` in the frontend, receives server-generated SKU, injects `created_by`/`updated_by`/`deleted_by`, displays `price_configuration_label`, and loads confirmed Material configurations with `record_type=2`. Provider is immutable after creation. Logical deletion uses `POST /api/materials/{id}/delete/` behind `ConfirmComponent`; Material never uses PUT or HTTP DELETE. Backend Material tests and the frontend production build pass. Read behavior and the HTTP route contract were validated; interactive create/PATCH/delete validation remains the next acceptance step.

> **Planning update — 2026-07-21 (current objective)**
>
> Product remains the active reference vertical. Its formal frontend QA foundation is now implemented: Vitest, Vue Test Utils, jsdom, deterministic Axios/component mocks, Product-focused unit and component tests, reproducible coverage, SonarScanner configuration, and a combined QA script. Material code already present in the worktree was preserved and remained outside this implementation scope except for shared components exercised by Product.

---

## 1. Project identity

### 1.1 What `sbm-manager` is

`sbm-manager` is the Vue.js 3 enterprise frontend for SBM Suite.

It provides management interfaces for business and platform capabilities such as:

- Dashboard and authentication.
- Franchises.
- Catalogs and menus.
- Products, materials, and services.
- Providers.
- Clients.
- Orders.
- Fiscal and commercial configuration.
- Reusable CRUD grids, forms, properties, calculations, and detail tables.

### 1.2 Role inside SBM Suite

The platform is intentionally split into two API boundaries:

```text
Ditaly Pasta client operation
→ sbm-manager
→ dp-api
→ Ditaly Pasta business data and rules

Internal or critical platform operation
→ sbm-manager internal screen, when explicitly permitted
→ sbm-api
→ platform administration and critical processes
```

The frontend must not treat `dp-api` and `sbm-api` as interchangeable backends.

### 1.3 Stable ownership rule

```text
Client operation     → dp-api
Platform operation   → sbm-api
```

Examples of Ditaly Pasta client operations that belong to `dp-api`:

- Product.
- Material.
- Service.
- Catalog and item configuration.
- Price and permitted commercial configuration.
- Provider.
- Branch.
- Client-created ticket.

Examples of internal or critical operations that remain in `sbm-api`:

- Franchise or tenant creation.
- Contracted-module activation.
- Provisioning.
- Platform-level administration.
- Global configuration.
- Internal SBM operations.

### 1.4 Current migration strategy

The platform is migrated vertically, but each reference capability must be completed across implementation, QA, static analysis, documentation, and consumer retirement before its pattern is replicated.

The active sequence is now:

```text
Product functional flow in dp-api and sbm-manager
→ Product frontend unit/component tests
→ reproducible frontend coverage
→ SonarQube analysis and Quality Gate
→ Product regression and documentation closure
→ audit/deprecate duplicate sbm-api Product consumer
→ only then replicate the complete pattern to Material
```

Product functional behavior, automated frontend QA, production build, coverage, SonarQube upload, and the local Quality Gate are implemented and validated. Sonar findings recorded in section 10 remain the next quality-debt backlog.

Material implementation already exists in the supplied worktree and must not be deleted or casually rewritten, but it is not the current development objective. Do not continue Material acceptance, Service migration, or another module until Product frontend QA is complete and stable.


---

## 2. Verified repository state

### 2.1 Repository layout

The Git repository root contains infrastructure and documentation, while the Vue application is nested under `sbm-manager/`:

```text
SBM-MANAGER/
├── .env
├── .gitignore
├── .dockerignore
├── .vscode/
├── docker-compose.yml
├── TECHNICAL_DOCUMENTATION.md
├── command.md
└── sbm-manager/
    ├── Dockerfile
    ├── package.json
    ├── package-lock.json
    ├── yarn.lock
    ├── vue.config.js
    ├── public/
    └── src/
```

At the time of inspection:

- No README was present.
- No existing `PROJECT_CONTEXT.md` was present.
- No `AGENTS.md` was found.
- The active Git branch was `feature/orders-module`.

### 2.2 Historical local-work snapshot

The worktree was already dirty before the initial Product API migration audit. The following list is historical context from that first inspection, not the current `git status`:

Modified files:

```text
src/components/CRUDManagerComponent.vue
src/components/CalculationComponent.vue
src/components/GridDetailContainerComponent.vue
src/components/GridDetailTableComponent.vue
src/views/OrdersView.vue
```

Untracked directories:

```text
src/constants/
src/utils/
```

These changes belong to the user. Do not reset, overwrite, reformat broadly, or assume they are part of the Product migration.

### 2.3 Current status classification

```text
Repository: active
Frontend framework: Vue 3
Product API migration: concluded and interactively validated
dp-api Product consumer: active for list/detail/create/PATCH/logical delete
Product create: active with generated code and created_by audit identity
Product partial/price update: active from Properties with changed-field PATCH payloads
Product logical delete: active through the detail POST action and ConfirmComponent
Material API migration: code present; intentionally paused while Product QA is completed
dp-api Material consumer: active for list/detail/create/PATCH/logical delete
Material pricing: confirmed record_type=2 selector; legacy null-price rows supported
Material provider: writable on create and immutable on PATCH
Frontend automated testing: not configured; this is the current implementation objective
Container production build: passed with bundle-size warnings
Frontend SonarQube integration: not configured; current implementation objective
Production hardening: pending
```

---

## 3. Technology stack

Verified from `package.json`:

- Vue 3.2.x.
- Vue Router 4.
- Vuex 4.
- Axios 1.10.x.
- Bootstrap 5.3.x.
- Chart.js 4.
- date-fns 4.
- xlsx 0.18.x.
- Vue CLI 5.
- Babel.
- Core-js.

Available npm/yarn scripts:

```text
serve
build
```

No `test`, `lint`, or type-check script was defined in `package.json` at the time of inspection.

### 3.1 Runtime and Docker

The frontend container:

```text
container: sbm_manager
host port: 8080
container port: 8080
network: sbm-network
command: yarn serve
```

The Docker image uses Node 20 Alpine and Vue CLI development server behavior.

The frontend source directory is bind-mounted into `/app`, while `/app/node_modules` uses a separate volume.

### 3.2 Routing

The application uses Vue Router with hash history:

```text
createWebHashHistory()
```

Verified routes include:

```text
/
/login
/franquicias
/catalogos
/pedidos
/productos
/materiales
/servicios
/menus
/proveedores
/clientes
/configuracion/directiva-fiscal
```

Most business routes use `meta.requiresAuth = true`.

---

## 4. Current frontend structure

### 4.1 API layer

Current API-related files:

```text
src/api/clients.js
src/api/axios.js
src/api/franchise.js
```

`src/api/clients.js` creates two explicit clients:

```text
sbmApi → VUE_APP_SBM_API_URL, with VUE_APP_API_URL as legacy fallback
dpApi  → VUE_APP_DP_API_URL
```

`src/api/axios.js` re-exports `sbmApi` as its default export for backward compatibility. Existing imports therefore remain on the internal API unless a view explicitly injects another client.

Both clients use JSON headers and a 10-second timeout.

Authentication behavior is deliberately different:

```text
sbmApi → SBM Bearer token from localStorage; clears SBM session on HTTP 401
dpApi  → Basic Authentication; never overwrites it with the SBM Bearer token
```

The current environment keys are:

```text
VUE_APP_API_URL
VUE_APP_SBM_API_URL
VUE_APP_DP_API_URL
VUE_APP_API_USERNAME
VUE_APP_API_PASSWORD
```

Do not point `VUE_APP_API_URL` globally to `dp-api`. It remains a transitional `sbm-api` fallback.

### 4.2 Authentication state

`src/composables/useAuth.js` stores:

```text
uuid
email
name
token
```

Values are stored in `localStorage`.

The `sbmApi` interceptor sends:

```text
Authorization: Bearer <token>
```

Validated transitional behavior:

- `sbmApi` sends the SBM Bearer token.
- `dp-api` Product enables Session and Basic authentication with `IsAuthenticated`.
- `dpApi` uses Basic Authentication and does not send the incompatible SBM Bearer token.
- An anonymous request to `/api/products/` returns HTTP 403.
- DP-API CORS permits `http://localhost:8080` and allows credentials.

Basic credentials in browser-delivered `VUE_APP_*` configuration are transitional development behavior, not the final production security model.

### 4.3 Google login

`GoogleLoginComponent.vue` contains a direct backend URL pointing to local port `8082`, which is the validated local port for `sbm-api`.

Authentication and internal identity operations may remain in `sbm-api`, but hardcoded environment-specific URLs should eventually move to configuration.

Do not redirect the login endpoint to `dp-api` as part of the Product migration without an explicit authentication decision.

### 4.4 Reusable CRUD components

Primary generic components:

```text
CRUDManagerComponent.vue
CRUDGridComponent.vue
SimpleFormComponent.vue
PropertiesComponent.vue
ConfigFormComponent.vue
CalculationComponent.vue
GridDetailContainerComponent.vue
GridDetailTableComponent.vue
```

These components serve multiple resources. A Product-specific migration must not silently change behavior for Franchise, Catalog, Order, Material, Service, Provider, or Client screens.

### 4.5 Vuex status

Vuex is installed, but no `src/store/` implementation was found during inspection. Some components import empty Vuex getter/action mappings.

Do not assume global API or Product state is managed by Vuex.

---

## 5. Completed Product frontend flow

> This section records the concluded Product vertical. Any older staged-cutover wording that remains elsewhere in the historical audit is superseded by the 2026-07-20 implementation update and the current matrix in section 8.

### 5.1 Product route and view

Product route:

```text
/productos
```

View:

```text
src/views/ProductView.vue
```

`ProductView.vue` uses `CRUDManagerComponent` with:

```text
endpoint="products/"
get-endpoint="products/"
post-endpoint="products/"
```

`ProductView.vue` injects `dpApi` into the generic manager/grid for every Product operation. Relative paths resolve against `VUE_APP_DP_API_URL`.

The view also sets:

```text
rowKey="id"
includeVisibleFilter=false
showDeletedFilter=false
allowCreate=true
allowUpdate=false
allowDelete=true
enableExtendedProperties=false
propertiesEditable=true
```

Product creation is enabled. The generic configure action remains disabled; modification is exposed through Properties. Logical deletion uses the configurable detail-action adapter rather than the legacy collection soft-delete action. All Product writes use `dpApi`, integer `id` where applicable, and the authenticated audit identity resolver.

### 5.2 Product fields already aligned with dp-api

The current Product view already contains:

```text
item_group
item_group_name
provider_name
type_name
category_name
package_description
```

These relation projections match the validated `dp-api` response contract.

### 5.3 Product pricing projection

The Product response contract now includes the price projection consumed by the grid and Properties flow:

```text
price
base_net_amount
net_amount
gross_amount
iva_amount
aditional_tax_amount
retention_amount
price_configuration
price_configuration_label
```

`price_configuration` is the UUID used for writes. `price_configuration_label` is the descriptive grid value. The frontend must not fetch price-configuration options merely to render the grid; the dynamic selector loads options only when a form is mounted. Product selectors request confirmed configurations with `record_type=1`.

### 5.4 Franchise selector dependency

`ProductView.vue` loads:

```text
franchises/
```

explicitly through `sbmApi`.

Franchise creation and platform management belong to `sbm-api`. Product migration must not accidentally redirect Franchise operations to `dp-api`.

The Product screen may still read a permitted franchise/tenant context, but that read must be designed explicitly rather than inherited from a global base URL.

### 5.5 Current Product list behavior

`CRUDGridComponent.fetchData()`:

- Sends `page` and `page_size`.
- Sends `ordering`.
- Sends `search` when present.
- Supports standard DRF pagination using `count` and `results`.

This part is broadly compatible with `dp-api` pagination.

Product-specific behavior now disables the legacy visibility parameter:

```text
includeVisibleFilter=false
→ does not send is_visible
```

`dp-api` Product does not use `is_visible` for this flow. Normal Product querysets already exclude logically deleted rows.

### 5.6 Current Product identifiers

`CRUDGridComponent.rowId()` still preserves the generic default:

```text
code → id → sku
```

It now accepts an optional `rowKey`. Product passes `rowKey="id"`, so Product selection and detail use the integer primary key without changing other CRUD consumers.

Current Product detail behavior builds:

```text
/api/products/{id}/
```

The validated `dp-api` Product detail and PATCH endpoints currently use the Django primary key integer:

```text
/api/products/{id}/
```

The identifier contract for list selection and detail is resolved: use integer `id`. Future Product PATCH and logical delete must use the same identifier.

### 5.7 Current create behavior

Product create is enabled and posts through the injected `dpApi` client.

```text
POST /api/products/
```

The frontend generates `code` with `crypto.randomUUID()` and injects `created_by` from `localStorage.uuid` through `createDefaults`. `CRUDManagerComponent` merges hidden create defaults into the outgoing payload. Product SKU remains server-generated and is omitted from the form.

The authenticated SBM `uuid` must exist as `users.User.code` in DP-API. The create form loads relation selectors only while the form component is mounted.

### 5.8 Current update behavior

The generic grid update action remains disabled with `allowUpdate=false`. Product modification is available only from `PropertiesComponent` through a dedicated `propertiesEditable` path that reuses `SimpleFormComponent`.

`CRUDManagerComponent.onPropertiesSave()`:

- Uses the injected `dpApi` client.
- Sends `PATCH /api/products/{id}/` using `rowKey="id"`.
- Derives writable fields from the Product field configuration.
- Excludes omitted, disabled, read-only and unchanged fields.
- Adds `updated_by` using the resolver passed by `ProductView.vue`.
- Replaces the selected Product with the PATCH response after success.

Current editable fields include normal Product attributes and Product-owned price inputs permitted by DP-API. Relation and audit constraints remain enforced by the backend.

Representative fields:

```text
description
obs
package_unit
min_package_purchase
provider
type
item_group
category
url
package
is_active
is_confirmed
base_net_amount
price_configuration
```

Derived price fields remain read-only. When `base_net_amount` or `price_configuration` changes, DP-API recalculates/version-controls the Product price. Product configuration options are filtered to confirmed `record_type=1` rows.

`is_deleted` is displayed in the modification form but disabled. DP-API declares it read-only in `ProductCommandSerializer`; it must only change through the logical delete action.

The Product PATCH adapter and price-configuration modification have been validated interactively. The container build passes.

The validated `dp-api` Product endpoint rejects PUT with HTTP 405.

### 5.9 Product modification selectors

The Product modification form loads these relations from DP-API:

```text
provider   → /api/providers/
type       → /api/item-types/
item_group → /api/item-groups/
category   → /api/item-categories/
package    → /api/packages/
```

`SimpleFormComponent` now accepts an `apiClient` prop. Dynamic options and loading flags are stored in internal reactive state rather than being added to field objects. This is required because the Properties form builds its field allowlist from a computed value; mutating those computed field clones did not trigger a Vue render even when the network request returned data.

The loader supports direct arrays and paginated response bodies under `results` or `data`. The `/api/providers/` response was verified as a standard paginated response containing `id` and `provider`.

### 5.10 Current delete behavior

Product logical deletion is enabled and uses the validated DP-API detail action:

```text
POST /api/products/{id}/delete/
body: { deleted_by: <user_code> }
```

`ProductView.vue` configures `detail-delete-endpoint="products/{id}/delete/"` and obtains `deleted_by` from the same authenticated user resolver used for create/update auditing. Only one Product can be deleted at a time.

`ConfirmComponent.vue` replaces the CRUD grid after the user requests deletion. Cancelling restores the grid without a network call. Confirming is the only path that issues the POST; buttons are locked while the request is in flight. Deleted Products disappear from normal list queries.

HTTP DELETE is intentionally disabled for Product and must never be introduced in the frontend Product flow.

---

## Material frontend implementation

`MaterialView.vue` now uses `dpApi` for the complete Material lifecycle and keeps Franchise loading on `sbmApi`. The canonical routes are:

```text
GET   /api/materials/
GET   /api/materials/{id}/
POST  /api/materials/
PATCH /api/materials/{id}/
POST  /api/materials/{id}/delete/
GET   /api/materials/active/
HEAD  /api/materials/
OPTIONS /api/materials/
```

Material rows use integer `id` as the REST identity. Create supplies a frontend-generated UUID `code` and `created_by`; SKU is generated by DP-API. Properties sends only changed writable fields plus `updated_by`. Provider is disabled in modification mode because DP-API treats it as immutable. Delete supplies `deleted_by` and requires explicit confirmation.

The price selector writes the configuration UUID from `price_configuration` and the grid reads `price_configuration_label`. Options come from `/api/price-configuration/?record_type=2&is_confirmed=true`. Derived price amounts are read-only. Legacy rows may return a null price projection; modification does not require pricing unless the user changes it, while price repair requires both `base_net_amount` and `price_configuration` according to DP-API validation.

The Material backend suite passed 11 tests. The route contract, paginated list and available price configuration were checked read-only, and the frontend production build passed with the existing bundle-size warnings. No real Material create/PATCH/delete was executed during automated validation.

---

## 6. Canonical dp-api Product contract

### 6.1 Local base URL

Validated local mapping:

```text
dp-api  → http://localhost:8081
sbm-api → http://localhost:8082
```

Product collection:

```text
http://localhost:8081/api/products/
```

### 6.2 Permitted methods

```text
GET
POST
PATCH
HEAD
OPTIONS
```

Intentionally rejected:

```text
PUT    → HTTP 405
DELETE → HTTP 405
```

### 6.3 Read endpoints

Method:

```text
GET
```

```text
/api/products/
```

Standard pagination:

```json
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```

Method:

```text
GET
```

```text
/api/products/{id}/
```

### 6.4 Validated response fields

```text
id
code
sku
description
obs
package_unit
min_package_purchase
price
price_gross_amount
provider
provider_name
type
type_name
item_group
item_group_name
category
category_name
url
package
package_description
is_active
is_deleted
is_confirmed
created_at
updated_at
confirmed_at
deleted_at
created_by
confirmed_by
updated_by
deleted_by
version
```

The Product API intentionally does not expose the internal `log` field.

Stale frontend response names must not be used:

```text
group
group_name
price_description
```

### 6.5 Create

Method:

```text
POST
```

```text
/api/products/
```

Current transitional writable contract includes:

```text
code
sku
description
obs
package_unit
min_package_purchase
price
provider
type
item_group
category
package
url
is_active
is_confirmed
created_by
```

`price` is a Price code, not a numeric amount.

### 6.6 Partial update

Method:

```text
PATCH
```

```text
/api/products/{id}/
```

Current transitional requirement:

```text
updated_by is required
```

The API sets `updated_at` automatically.

### 6.7 Logical delete

Method:

```text
POST
```

```text
/api/products/{id}/delete/
```

Body:

```json
{
  "deleted_by": "<user_code>"
}
```

The operation:

- Sets `is_active` to false.
- Sets `is_deleted` to true.
- Sets `deleted_at`.
- Sets `deleted_by`.
- Keeps the physical row in PostgreSQL.
- Removes the row from normal Product list and detail queries.

### 6.8 HEAD

Quick validation is available through:

```text
HEAD /api/products/
HEAD /api/products/{id}/
```

### 6.9 Product audit log

The API maintains a hidden database log using:

```text
INIT: <timestamp> (USER: <user_code>);
PATCH: field='value', ... (USER: <user_code>);
DELETE: <timestamp> (USER: <user_code>);
```

Every entry ends with `;`.

The frontend must not request, display, send, or attempt to reconstruct this field.

### 6.10 Known transitional identity risk

The audit user code is not hardcoded and is validated against the business user table, but it currently comes from the request body instead of the authenticated `request.user` identity.

This allows user-code spoofing until authentication identities are mapped correctly.

For the current Product consumer migration:

- Preserve the existing transitional contract.
- Use the authenticated user's stored UUID only after confirming it is the same business `users.User.code` expected by `dp-api`.
- Document the temporary behavior.
- Do not misrepresent it as final security architecture.

The final fix belongs to the authentication/security phase.

---

## 7. API client separation implementation

### 7.1 Implemented boundary

The frontend now exposes two explicit Axios clients from `src/api/clients.js`:

```text
dpApi  → explicit client-facing operations
sbmApi → default internal and legacy operations
```

`src/api/axios.js` re-exports `sbmApi` as default. This preserved every existing import while allowing Product to opt into `dpApi` explicitly.

### 7.2 Environment boundary

Implemented variables:

```text
VUE_APP_SBM_API_URL
VUE_APP_DP_API_URL
```

Local development mapping:

```text
VUE_APP_SBM_API_URL → http://localhost:8082/api
VUE_APP_DP_API_URL  → http://localhost:8081/api
```

`VUE_APP_API_URL` remains temporarily configured for `sbm-api` as a compatibility fallback. It must not be redirected globally to DP-API.

### 7.3 Generic-component integration

`CRUDManagerComponent` and `CRUDGridComponent` now accept configuration with backward-compatible defaults:

```text
apiClient
rowKey
includeVisibleFilter
showDeletedFilter
allowCreate
allowUpdate
allowDelete
propertiesEditable
propertiesEditableFields
propertiesReadOnlyFields
propertiesUpdateAuditValue
```

Product injects `dpApi`, selects rows by `id`, omits `is_visible`, enables its adapted create/Properties PATCH/detail-delete flows, and leaves generic configure disabled. All non-migrated consumers retain `sbmApi` and their previous identifier/filter behavior until their own vertical migration.

---

## 8. Product migration discrepancy matrix

| Concern | Current sbm-manager behavior | Validated dp-api behavior | Required action |
|---|---|---|---|
| API base | Explicit `sbmApi` and `dpApi` clients | Separate client-facing API on port 8081 | ✅ Implemented |
| Product list | `products/` through injected `dpApi` | `/api/products/` | ✅ Implemented and interactively validated |
| Pagination | Supports `count` and `results` | `count`, `next`, `previous`, `results` | ✅ Validated |
| Hidden deleted filter | Product omits `is_visible` | Deleted rows excluded by queryset | ✅ Implemented |
| Row identity | Product passes `rowKey="id"` | Detail uses integer `id` | ✅ Implemented |
| Detail | `/api/products/{id}/` through `dpApi` | `/api/products/{id}/` | ✅ Implemented and interactively validated |
| Create | `POST products/` through `dpApi` | POST | ✅ Implemented and validated |
| Create audit | Injects stored SBM `uuid` | `created_by` required | ✅ Implemented |
| Code/SKU | Frontend generates UUID code; SKU omitted | Code required; SKU server-generated | ✅ Contract aligned |
| Update | Properties uses `dpApi`, integer `id` and changed-field payloads | PATCH | ✅ Implemented and validated |
| Update audit | Injects stored SBM `uuid` as `updated_by` | Valid DP-API user code required | ✅ Implemented |
| Full update | Generic architecture may support update concept | PUT rejected | Never use PUT for Product |
| Logical delete | Detail POST with explicit `ConfirmComponent` | Detail `/{id}/delete/` with `deleted_by` | ✅ Implemented and validated |
| Physical delete | Not directly used in inspected Product path | HTTP DELETE rejected | Keep disabled |
| Product price display/update | Uses embedded projection plus UUID/label pair | DP-API exposes calculated price projection | ✅ Implemented and validated |
| Product relation selectors | Load through injected `dpApi` with reactive option state | Standard arrays or paginated `results` | ✅ Implemented; Provider response shape verified |
| Internal log | Not used by Product UI | Never exposed | ✅ Preserved |
| Authentication | Product `dpApi` preserves Basic; SBM uses Bearer | Session/Basic with `IsAuthenticated` | ✅ Read transport configured; production auth redesign pending |

---

## 9. Security and configuration findings

### 9.1 Environment files

The repository root contains `.env` with API URL and credential-related variables. Values are intentionally omitted here.

Do not commit or reproduce real credentials in project context, README, examples, tests, logs, or chat output.

### 9.2 Credential-like documentation

Existing legacy technical/command documentation contains credential-like or token-like examples.

Treat any real token found in repository documentation as compromised:

- Remove it from documentation.
- Rotate it at the source.
- Do not copy it into this context.

### 9.3 LocalStorage

Authentication token and user identity fields are stored in `localStorage`.

This is the current implementation, not a declaration that it is the final secure architecture.

### 9.4 Transitional API authentication

The SBM Bearer token is not compatible with the validated DP-API Session/Basic configuration. The clients therefore use separate authentication behavior.

`dpApi` preserves Basic Authentication and does not clear SBM authentication state on DP-API authorization failures. This supports the current read validation, but client-bundled credentials must be replaced by an appropriate production identity contract.

---

## 10. Testing, coverage and SonarQube

### 10.1 Verified current state

Product frontend QA is implemented and validated in Docker. `sbm-manager/package.json` now provides:

```text
test          → Vitest watch mode
test:run      → one non-interactive run
test:coverage → one run with V8 coverage and enforced thresholds
```

The verified stack is Vitest 3.2.4, Vue Test Utils 2.4.6, jsdom 26.1.0 and V8 coverage 3.2.4. Seven suites contain 40 deterministic tests, all passing. Coverage and SonarScanner are reproducible through root scripts and run only in containers. CI/CD Quality Gate enforcement remains intentionally out of scope.

### 10.2 Implemented QA baseline

The first standardized frontend QA slice uses Product as the reference capability. It covers Product behavior and the reusable components exercised by Product without claiming coverage of every repository module.

Implemented test stack for this Vue 3 / Vue CLI 5 project:

```text
Vitest
@vue/test-utils
jsdom
@vitest/coverage-v8
```

Tests use native Vitest mocks at the explicit Axios/component boundaries; MSW was not required and no real HTTP request occurs.

### 10.3 Implemented scripts

Package scripts:

```text
test           → optional container watch mode
test:run       → execute Product tests once
test:coverage  → execute Product tests and generate coverage
build          → preserve existing production build
```

Executable root scripts following the working DP-API convention:

```text
scripts/coverage.sh
scripts/sonar-scan.sh
scripts/qa-check.sh
```

Validated flow:

```text
coverage.sh
→ use frontend dependencies in an ephemeral app container
→ run Product-focused Vitest suite with coverage
→ enforce thresholds and produce LCOV, Cobertura and HTML reports

sonar-scan.sh
→ run disposable SonarScanner container
→ mount repository at a stable path
→ select `.env.dev` by default when present, with temporary `.env` compatibility and `ENV_FILE` override
→ import LCOV, upload analysis and wait for the Quality Gate

qa-check.sh
→ coverage.sh
→ sonar-scan.sh
→ stop immediately on any failure
```

The production build is validated separately in the official app container. No SonarQube token, password, or host credential is hardcoded.

### 10.4 Test location and scope

Use a module-oriented hierarchy under the Vue source tree:

```text
sbm-manager/src/
├── views/
│   └── __tests__/
│       └── ProductView.spec.js
├── components/
│   └── __tests__/
│       ├── CRUDManagerComponent.spec.js
│       ├── CRUDGridComponent.spec.js
│       ├── SimpleFormComponent.spec.js
│       ├── PropertiesComponent.spec.js
│       └── ConfirmComponent.spec.js
└── api/
    └── __tests__/
        └── clients.spec.js
```

Only create files that exercise Product behavior or a shared boundary Product depends on. A smaller set is acceptable if it provides equivalent coverage without duplicating assertions.

### 10.5 Product behaviors that must be protected

#### API boundary

- Product explicitly receives and uses `dpApi`.
- Franchise, login, and default legacy consumers remain on `sbmApi`.
- `src/api/axios.js` continues exporting `sbmApi` as the backward-compatible default.
- A DP-API authorization error must not clear the SBM session.
- No real HTTP request is made during unit tests.

#### Product list and detail

- Product requests `products/` through `dpApi`.
- Standard DRF pagination (`count`, `results`) is handled.
- Product uses integer `id` as row/detail identity.
- Unsupported `is_visible` or equivalent legacy filters are not sent.
- Deleted rows are not expected in the normal list.
- Canonical labels such as `price_configuration_label`, `provider_name`, `type_name`, `item_group_name`, and `category_name` are displayed or passed correctly.
- Stale names such as `group`, `group_name`, and `price_description` do not return.

#### Product creation

- Create uses POST through `dpApi`.
- The frontend creates the current UUID `code` according to the accepted transitional contract.
- SKU remains omitted/read-only because it is generated by the backend/database.
- `created_by` is derived from the currently stored authenticated SBM user identifier.
- Product price configuration options are restricted to confirmed Product configurations (`record_type=1`).
- Only writable fields are included.
- Loading, success, validation-error, and generic-error states are deterministic.

#### Product modification

- Modification uses PATCH to the integer Product `id`.
- PUT is never called.
- `updated_by` is injected.
- Unchanged fields are not sent.
- Provider immutability and read-only fields remain respected by the form configuration.
- Changing `base_net_amount` or `price_configuration` uses the accepted Product contract.
- Dynamic selectors load through `dpApi` and support both arrays and paginated `results` where the implementation permits them.

#### Product logical deletion

- Deletion requires `ConfirmComponent`.
- Cancelling emits no request.
- Confirming sends POST to `products/{id}/delete/`.
- The payload contains `deleted_by`.
- HTTP DELETE is never called.
- A successful deletion refreshes or removes the row according to the current component flow.
- Failure leaves the UI in a recoverable state.

#### Internal data and security regressions

- The hidden Product `log` field is neither displayed nor submitted.
- Audit fields controlled by the backend are not copied blindly into create/PATCH payloads.
- Tests use fake values and never read or print real `.env` credentials.
- Existing localStorage behavior may be mocked, but tests must document it as transitional rather than secure final architecture.

### 10.6 Mocking strategy

Use deterministic mocks at explicit boundaries:

```text
dpApi.get / post / patch
sbmApi.get / post / interceptors
localStorage
window.alert
Vue Router when required
child components only when the test is about parent orchestration
```

Prefer mounting real Product-related components when their interaction is the behavior under test. Avoid shallow tests that merely assert implementation details or duplicate Vue internals.

### 10.7 Coverage requirements

Generate LCOV for SonarQube and a human-readable terminal report. The expected artifact is:

```text
sbm-manager/coverage/lcov.info
```

Initial thresholds should be realistic and enforceable for the explicitly tested Product scope. Recommended first gate:

```text
lines       >= 70%
statements  >= 70%
functions   >= 70%
branches    >= 60%
```

Do not exclude application files merely to inflate coverage. Exclude only generated/build assets, dependencies, static assets, and test files. Raise thresholds after the first reliable baseline.

Verified Vitest/V8 baseline on 2026-07-21:

```text
statements  70.03%
lines       70.03%
functions   72.83%
branches    66.90%
```

All configured thresholds pass. The LCOV artifact is generated at `sbm-manager/coverage/lcov.info`.

### 10.8 SonarQube configuration

Create a distinct local project:

```text
Display name: SBM-MANAGER
Project key:  SBM-MANAGER
```

Recommended initial scanner scope:

```text
sonar.sources=sbm-manager/src
sonar.tests=sbm-manager/src
sonar.test.inclusions=**/__tests__/**/*.spec.js
sonar.javascript.lcov.reportPaths=sbm-manager/coverage/lcov.info
sonar.sourceEncoding=UTF-8
```

Exclude at minimum:

```text
**/node_modules/**
**/dist/**
**/coverage/**
**/assets/**
**/*.spec.js
```

Test files are identified as tests rather than production sources. The final scan used SonarQube Community Build 26.7.0.124771, SonarScanner CLI 8.0.1.6346 and JavaScript analyzer 13.1.0.42921. It indexed 14 files, found the dedicated `sbm-manager/tsconfig.sonar.json`, imported LCOV, uploaded the report and completed successfully.

Verified SonarQube baseline on 2026-07-21:

```text
Project key                SBM-MANAGER
Quality Gate               PASSED / API status OK
Sonar coverage             69.6%
Reliability                C (10 bugs)
Security                   A (0 vulnerabilities)
Security hotspots          0
Maintainability            A (52 code smells)
Duplicated lines density   1.9%
Lines of code              3051
Open findings              62 (2 critical, 35 major, 25 minor)
```

The Quality Gate returned no blocking conditions and is Clean-as-You-Code compliant. The 10 bugs and 52 code smells remain visible debt; the pass must not be interpreted as their resolution. Sonar's 69.6% aggregate differs from Vitest's 70.03% because the tools calculate/report the imported coverage at different aggregation granularity.

On Apple Silicon the JavaScript analyzer runs an embedded Node bridge. The scan failed when Docker exposed about 3933 MB and passed after Docker exposed about 5939 MB. This is temporary scanner memory, not a permanent per-application reservation.

### 10.9 Quality priorities

After the first successful analysis:

1. Resolve Reliability issues affecting Product behavior.
2. Resolve Security issues or hotspots with concrete risk.
3. Remove meaningful duplication in Product/shared components without speculative rewrites.
4. Address maintainability findings.
5. Increase coverage toward 80% after the baseline is stable.

Passing a Quality Gate does not authorize production deployment or prove complete security.

### 10.10 Definition of done for Product frontend QA

The current Product QA phase is complete only when:

1. Vitest and Vue Test Utils are configured reproducibly.
2. Product-focused tests pass in the official Docker/local runtime.
3. All existing frontend production code continues building.
4. Coverage is generated at the documented path.
5. SonarScanner imports the LCOV report.
6. The `SBM-MANAGER` Quality Gate passes or every blocking issue is explicitly reported.
7. Product's POST/PATCH/logical-delete and API-boundary rules are protected.
8. No real API, PostgreSQL data, or persistent business record is mutated by unit tests.
9. No secret is committed or printed.
10. Existing Material and other user changes are preserved.
11. README receives only the commands required to execute tests, coverage, scanner, and the combined QA flow.
12. `PROJECT_CONTEXT.md` is updated with exact results and remaining gaps.

All twelve conditions were satisfied on 2026-07-21. The production build passed separately in the app container. Remaining Sonar findings are post-baseline quality debt because none blocked the configured gate.


---

## 11. Migration and quality sequence

### Phase 0 — Verified foundation

- ✅ Vue 3 / Vue CLI 5 application.
- ✅ Vue Router guards and reusable CRUD components.
- ✅ Explicit `sbmApi` and `dpApi` clients.
- ✅ Docker development runtime.

### Phase 1 — Product functional vertical

- ✅ Product list and detail through `dpApi`.
- ✅ Product create, PATCH, price configuration, and logical deletion.
- ✅ Integer Product identity.
- ✅ Audit adapters and explicit confirmation.
- ✅ Product production build and interactive acceptance.

### Phase 2 — Product frontend QA and SonarQube (completed 2026-07-21)

- ✅ Add Vitest, Vue Test Utils, jsdom, and coverage dependencies.
- ✅ Add Product-focused unit/component tests (7 suites, 40 tests).
- ✅ Add reproducible LCOV generation with enforced thresholds.
- ✅ Configure and analyze `SBM-MANAGER` in local SonarQube.
- ✅ Add scanner and combined QA scripts.
- ✅ Validate the production build separately in the app container.
- ✅ Pass the configured Quality Gate; no blocking findings remain.
- ✅ Document exact metrics and remaining gaps.

### Phase 3 — Product closure

- ⏳ Audit remaining Product consumers.
- ⏳ Deprecate/remove duplicate `sbm-api` Product endpoint only after consumer verification.
- ⏳ Add CI/CD Quality Gate enforcement in a separate authorized phase.
- ⏳ Consider E2E Product flow with Playwright after unit/component QA is stable.

### Phase 4 — Replicate to Material

Only after Product phases 2 and 3 are stable:

- use Product tests and QA scripts as the template;
- validate Material-specific rules rather than copying Product assumptions;
- preserve Material record type, legacy-price compatibility, provider rules, and endpoint contracts;
- extend SonarQube scope intentionally.

### Phase 5 — Remaining domains

Proceed vertically:

1. Service.
2. Catalog and item configuration.
3. Pricing and permitted commercial configuration.
4. Providers.
5. Branches.
6. Tickets.
7. Clients and orders after ownership review.

### Phase 6 — Authentication, security and AI

Authentication mapping, tenant isolation, object permissions, DevSecOps, and AI Tools remain later cross-cutting phases. Do not use the QA task as authorization to redesign identity or integrate AI.


---

## 12. Rules that must remain stable

1. Product is the active reference vertical until frontend QA and SonarQube are complete.
2. Do not continue Material, Service, or another module as part of this implementation.
3. Preserve all existing user changes, especially current Material and shared-component edits.
4. Inspect `git status` before modifying files and never reset or discard changes.
5. `sbm-manager` uses `dp-api` for Product and other authorized client operations.
6. `sbm-api` remains the default internal/legacy API; never globally redirect all requests to `dp-api`.
7. Product uses POST for create, PATCH for update, and POST detail action for logical deletion.
8. Product never uses PUT or HTTP DELETE.
9. Product uses integer `id`; SKU remains server/database generated.
10. The hidden Product `log` field must not enter frontend state, payloads, tests, or reports.
11. Unit/component tests must not call real APIs or mutate persistent data.
12. Use fake credentials and mocked localStorage values only.
13. Do not commit `.env`, Sonar tokens, generated coverage, scanner cache, or build output.
14. Do not lower Quality Gate or hide source files merely to obtain a pass.
15. Keep test configuration compatible with Vue 3, Vue CLI 5, and the current CommonJS-style project unless a minimal required configuration change is proven.
16. Do not perform broad component refactors merely to make tests easier; extract logic only when it improves real design and preserves behavior.
17. Validate incrementally: focused tests, full Product suite, production build, coverage, scanner.
18. Update README and context after implementation with exact commands and measured results.
19. Do not perform Git commits, pushes, rebases, or destructive operations without explicit authorization.
20. When the user responds only `ok`, advance to the next validation step without repeating the prior question.
21. Dependency installation and runtime commands must never execute on the host machine. JavaScript/Node dependencies must always be installed and commands run inside the project container; Python dependencies must always be installed inside the project container or its dedicated virtual environment. Do not use host `npm`, `npx`, `yarn`, `node`, `pip`, or equivalent package/runtime tooling for project work.


---

## 13. Completed Product QA implementation record

### 13.1 Completed objective

Product-focused unit/component tests, coverage generation, and local SonarQube integration were implemented for `sbm-manager`, using the validated DP-API QA workflow as an operational reference adapted to Vue/JavaScript.

### 13.2 Preflight record

The implementation followed this preflight and preserved the initially clean worktree:

1. Read this complete `PROJECT_CONTEXT.md`.
2. Read the root `README.md`, `docker-compose.yml`, `.gitignore`, and any repository instructions.
3. Run `git status` and preserve every existing change.
4. Inventory the repository with `rg --files`, excluding `.git`, dependencies, build, coverage, and scanner caches.
5. Read completely:

```text
sbm-manager/package.json
sbm-manager/vue.config.js
sbm-manager/src/api/clients.js
sbm-manager/src/api/axios.js
sbm-manager/src/views/ProductView.vue
sbm-manager/src/components/CRUDManagerComponent.vue
sbm-manager/src/components/CRUDGridComponent.vue
sbm-manager/src/components/SimpleFormComponent.vue
sbm-manager/src/components/PropertiesComponent.vue
sbm-manager/src/components/ConfirmComponent.vue
sbm-manager/src/composables/useAuth.js
```

6. Inspect the working DP-API QA files only as reference:

```text
sonar-project.properties
scripts/coverage.sh
scripts/sonar-scan.sh
scripts/qa-check.sh
```

7. Confirm npm versus yarn lockfile implications and use one deterministic package manager. Do not regenerate both lockfiles casually.
8. Report the proposed files and dependency changes before implementation.

Host execution restriction: all package installation, tests, coverage, lint, build, and other runtime validation must execute inside the project container. For Python repositories, dependency installation must execute inside the project container or an explicitly dedicated virtual environment, never in the host interpreter.

### 13.3 Implemented scope

Changes were limited to what was necessary for Product frontend QA and SonarQube, including:

```text
sbm-manager/package.json
one existing lockfile selected consistently
sbm-manager/vitest.config.* or equivalent minimal configuration
sbm-manager/src/**/__tests__/*.spec.js
sonar-project.properties
scripts/coverage.sh
scripts/sonar-scan.sh
scripts/qa-check.sh
.gitignore
README.md
PROJECT_CONTEXT.md
Docker/config files only if required for reproducible test execution
```

Shared Product components may be changed only to fix a behavior revealed by a valid test or to expose a clean testable boundary without changing public behavior.

### 13.4 Preserved exclusions

The implementation did not:

- continue Material implementation or acceptance;
- migrate Service or another domain;
- change DP-API business contracts;
- modify PostgreSQL, Flyway, DBML, or backend migrations;
- redesign authentication or tenant isolation;
- add Playwright/E2E in this first unit-test slice;
- add CI/CD pipelines yet;
- configure cloud SonarQube/SonarCloud;
- introduce TypeScript;
- replace Vue CLI with Vite;
- perform broad styling or UX changes;
- expose secrets;
- perform Git operations without authorization.

### 13.5 Executed validation order

Validation was executed incrementally:

1. Dependency/configuration validation.
2. Smallest focused Product test.
3. Complete Product frontend unit/component suite.
4. Production build.
5. Coverage generation and threshold validation.
6. SonarScanner upload.
7. Quality Gate and issue summary.
8. Combined `qa-check.sh` execution.

SonarQube success was recorded only after the server accepted the analysis and both the project metrics and Quality Gate were inspected through the local API.

### 13.6 Recorded final result

The final implementation record includes:

- files created, modified, moved, or removed;
- dependencies added and the selected lockfile;
- exact test commands;
- test count and result;
- production build result;
- line, statement, function, and branch coverage;
- LCOV path;
- SonarQube project key and analyzed scope;
- Reliability, Security, Maintainability, duplication, coverage, hotspots, and Quality Gate state;
- warnings or unsupported scanner properties;
- remaining Product QA gaps;
- confirmation that Material and unrelated user changes were preserved.


---

## 14. Executive summary

`sbm-manager` is the Vue 3 enterprise frontend for SBM Suite. It separates `dpApi` client-facing operations from `sbmApi` internal and legacy operations. Product is functionally implemented through `dpApi` for list, detail, create, PATCH, pricing configuration, and confirmed logical deletion, while preserving the backend-controlled SKU, integer Product identity, audit adapter behavior, and the prohibition on PUT and HTTP DELETE.

The repository now has Vitest + Vue Test Utils, 40 Product-focused deterministic tests, enforced V8 coverage, LCOV/Cobertura/HTML reports, local SonarQube analysis, a passing Quality Gate, and documented repeatable Docker-only scripts. The validated baseline is 70.03% Vitest line/statement coverage and 69.6% Sonar coverage. Reliability C findings remain explicit follow-up debt; Security and Maintainability are rated A.

Material code present in the worktree was preserved. Product's verified structure—not merely its UI implementation—is now available as the template for Material and later modules, subject to separate authorization.
