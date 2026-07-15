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
> This first version is based on direct read-only inspection of the local `SBM-MANAGER` repository on 2026-07-15 and on the validated Product contract in the neighboring `DP-API` repository. No frontend files were modified during this audit. Secret and credential values are intentionally omitted.
>
> **Implementation update — 2026-07-15**
>
> The first Product frontend cutover has now been implemented. `sbm-manager` has explicit `sbmApi` and `dpApi` Axios clients. Product list and detail use `dp-api`; Franchise, authentication and all default generic CRUD consumers remain on `sbm-api`. Product writes and legacy advanced configuration are intentionally disabled until the remaining contracts are validated. The frontend container build passed and the application responds on port 8080.

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

The API separation is migrated vertically, one complete capability at a time.

The first capability is `Product`:

```text
dp-api Product contract
→ sbm-manager Product consumer
→ frontend validation
→ regression tests
→ deprecate old sbm-api Product consumer
```

Do not migrate Material, Service, or another resource until the Product frontend flow is stable.

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
Product API migration: list/detail cutover implemented; browser validation pending
dp-api Product backend: validated
dp-api Product consumer: active for Product list/detail
sbm-api Product consumer: retained for legacy writes and downstream consumers
Product writes: disabled in ProductView during transition
Automated test suite: not confirmed
Container production build: passed with bundle-size warnings
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

## 5. Current Product frontend flow

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

`ProductView.vue` now injects `dpApi` into the generic manager/grid for Product reads. The relative paths therefore resolve against `VUE_APP_DP_API_URL` for list and detail.

The view also sets:

```text
rowKey="id"
includeVisibleFilter=false
showDeletedFilter=false
allowCreate=false
allowUpdate=false
allowDelete=false
enableExtendedProperties=false
```

This makes the first cutover intentionally read-only and prevents rows loaded from `dp-api` from being written accidentally to legacy `sbm-api` endpoints.

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

This partially matches the validated `dp-api` response contract.

### 5.3 Product fields that do not match the current dp-api list contract

`ProductView.vue` currently expects Product rows to include pricing/calculation fields such as:

```text
price_configuration
price_configuration_label
base_net_amount
net_amount
gross_amount
iva_amount
aditional_tax_amount
retention_amount
calculation
```

The validated `dp-api` Product list currently exposes:

```text
price
price_gross_amount
```

`ProductView.vue` now defines `price_gross_amount` as a formatted price field. The unsupported advanced pricing fields remain in the legacy field configuration but are not fabricated when absent from the DP-API response. Advanced Product configuration is disabled during this phase.

It does not expose all of the combined Price/calculation fields above through `ProductSerializer`.

This mismatch must be resolved explicitly. Do not fabricate missing fields in the frontend. Determine whether:

1. Product list needs only `price_gross_amount` and advanced pricing remains a separate endpoint; or
2. `dp-api` must expose a documented read-only Product pricing projection; or
3. calculation/configuration functionality remains temporarily on a separate internal endpoint during staged migration.

The ownership decision must remain consistent with the rule that client price configuration belongs functionally to `dp-api`.

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

Product create is currently disabled in `ProductView.vue`. The following legacy incompatibilities remain to be resolved before enabling it.

`CRUDManagerComponent` creates with POST and therefore already uses the correct HTTP method.

However, `cleanData()` currently removes:

```text
created_by
updated_by
deleted_by
confirmed_by
```

The current transitional `dp-api` Product contract requires:

```text
created_by on POST
updated_by on PATCH
deleted_by on logical delete
```

`sbm-manager` has a `uuid` in `localStorage`, but it is not currently injected into Product create/update/delete payloads by the generic CRUD flow.

Additional create mismatch:

- Product `sku` is marked `omitInForm`.
- No Product `code` form field is configured.
- The validated `dp-api` serializer currently requires `code` and `sku`.

Before frontend migration, decide whether `dp-api` should generate Product code/SKU or whether the frontend must supply them. Prefer server-owned identifier generation when business rules belong to the API.

### 5.8 Current update behavior

Product update is currently disabled in `ProductView.vue`. The generic manager still uses PATCH for existing consumers, but the Product-specific payload and audit identity remain pending.

`CRUDManagerComponent` uses PATCH, which matches the permitted `dp-api` method.

Current incompatibilities:

- It may use Product code instead of integer ID in the URL.
- `updated_by` is removed from the payload.
- Generic field cleaning may send fields that are not writable in `dp-api`.

The validated `dp-api` Product endpoint rejects PUT with HTTP 405.

### 5.9 Current delete behavior

Product deletion is currently disabled in `ProductView.vue`. The generic grid retains the legacy collection action for existing consumers; Product must not enable it.

`CRUDGridComponent.deleteSelected()` currently calls a collection action:

```text
POST /products/soft_delete/
body: { ids: [...] }
```

The validated `dp-api` Product contract uses a detail action:

```text
POST /api/products/{id}/delete/
body: { deleted_by: <user_code> }
```

Additional differences:

- The generic grid can select multiple rows.
- Product group deletion is visually blocked by default, but the generic action still models bulk deletion.
- Selected identifiers normally contain Product codes, while `dp-api` currently expects integer IDs.

HTTP DELETE is intentionally disabled for Product and must never be introduced in the frontend Product flow.

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
```

Product injects `dpApi`, selects rows by `id`, omits `is_visible`, and disables writes. All other consumers retain `sbmApi` and their previous identifier/filter behavior.

---

## 8. Product migration discrepancy matrix

| Concern | Current sbm-manager behavior | Validated dp-api behavior | Required action |
|---|---|---|---|
| API base | Explicit `sbmApi` and `dpApi` clients | Separate client-facing API on port 8081 | ✅ Implemented |
| Product list | `products/` through injected `dpApi` | `/api/products/` | ✅ Implemented; browser data validation pending |
| Pagination | Supports `count` and `results` | `count`, `next`, `previous`, `results` | Preserve and verify |
| Hidden deleted filter | Product omits `is_visible` | Deleted rows excluded by queryset | ✅ Implemented |
| Row identity | Product passes `rowKey="id"` | Detail uses integer `id` | ✅ Implemented |
| Detail | `/api/products/{id}/` through `dpApi` | `/api/products/{id}/` | ✅ Implemented; browser validation pending |
| Create | Disabled during read cutover | POST | Resolve contract before enabling |
| Create audit | Removes `created_by` | `created_by` required currently | Inject validated authenticated business user code |
| Code/SKU | Not supplied by current form | Required currently | Decide server generation versus frontend input |
| Update | Disabled during read cutover | PATCH | Resolve payload and audit identity before enabling |
| Update audit | Removes `updated_by` | `updated_by` required | Inject validated user code |
| Full update | Generic architecture may support update concept | PUT rejected | Never use PUT for Product |
| Logical delete | Disabled during read cutover | Detail `/{id}/delete/` with `deleted_by` | Add Product-specific delete adapter before enabling |
| Physical delete | Not directly used in inspected Product path | HTTP DELETE rejected | Keep disabled |
| Product price display | Expects multiple embedded price fields | Exposes `price` and `price_gross_amount` | Adapt UI or define additional dp-api projection |
| Internal log | Field still listed in Product view configuration | Never exposed | Remove frontend dependency entirely |
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

## 10. Testing state

### 10.1 Current state

No automated test script was defined in `package.json` during inspection.

The build command is available:

```bash
yarn build
```

The development command is:

```bash
yarn serve
```

Validation performed after the Product read cutover:

- `docker compose config --quiet` passed.
- DP-API route `/api/products/` was confirmed; singular `/api/product/` returns HTTP 404.
- Anonymous Product access returns HTTP 403 because the view uses `IsAuthenticated`.
- Effective Product authentication classes are Session and Basic.
- CORS permits `http://localhost:8080` and allows credentials.
- The production build passed inside `sbm_manager` with bundle-size warnings only.
- The recreated frontend container responds HTTP 200 on port 8080.
- The host `node_modules` installation is incomplete for `xlsx` and Chart dependencies; use the container build or reinstall local dependencies before relying on a host build.

### 10.2 Required Product migration tests

At minimum validate:

1. Product route remains protected.
2. Product HEAD collection succeeds against `dp-api`.
3. Product list renders standard DRF pagination.
4. Search and ordering use supported query parameters.
5. Product detail uses the correct identifier.
6. Create sends only writable fields and the required audit user code.
7. PATCH uses the correct integer ID and includes `updated_by`.
8. Product never sends PUT.
9. Logical delete calls `POST /api/products/{id}/delete/` with `deleted_by`.
10. Product never sends HTTP DELETE.
11. Removed Product rows disappear from the normal grid.
12. The hidden database log never appears in UI state or requests.
13. Franchise and authentication calls still use `sbm-api`.
14. Non-Product CRUD screens remain unaffected.
15. Production build succeeds.

---

## 11. Migration sequence

### Phase 0 — Verified foundation

- ✅ Vue 3 application exists.
- ✅ Vue Router authentication guards exist.
- ✅ Reusable CRUD components exist.
- ✅ Shared Axios client exists.
- ✅ Product view and route exist.
- ✅ Docker local development exists.

### Phase 1 — Product API boundary

- ✅ Validate Product backend contract in `dp-api`.
- ✅ Audit current Product frontend integration points.
- ✅ Introduce explicit `dp-api` and `sbm-api` client boundaries.
- ✅ Route Product list and detail to `dp-api`.
- ✅ Resolve Product read identifier contract using integer `id`.
- ✅ Preserve Franchise, login and default CRUD consumers on `sbm-api`.
- ✅ Remove the invalid Product `is_visible` query parameter.
- ✅ Disable Product writes and legacy advanced configuration during read validation.
- ✅ Validate DP-API route, authentication classes and CORS.
- ✅ Validate production build inside the frontend container.
- ⏳ Validate Product list and detail interactively in the browser.
- ⏳ Resolve Product price projection required by the UI.
- ⏳ Resolve code/SKU generation ownership.
- ⏳ Adapt Product create payload.
- ⏳ Adapt Product PATCH payload.
- ⏳ Adapt Product logical delete action.
- ⏳ Validate authentication compatibility.
- ⏳ Add Product regression coverage.
- ⏳ Validate production build.
- ⏳ Deprecate old Product consumer only after validation.

### Phase 2 — Remaining client domains

Proceed only after Product is stable:

1. Material.
2. Service.
3. Catalog and item configuration.
4. Pricing and permitted commercial configuration.
5. Providers.
6. Branches.
7. Tickets.
8. Clients and orders after confirming ownership and contracts.

### Phase 3 — Authentication and security hardening

- Map authenticated identity to business user code.
- Remove client-controlled audit attribution.
- Review localStorage token strategy.
- Review tenant and franchise context.
- Review object-level authorization.
- Separate internal and client administrator access.

### Phase 4 — AI integration

Do not integrate AI workflows before the Product frontend and API contracts are stable.

Future AI flow:

```text
Client user
→ sbm-manager or external channel
→ sbm-ai-assistant
→ dp-api Tool
→ validated business operation
```

---

## 12. Rules that must remain stable

1. `sbm-manager` uses `dp-api` for normal Ditaly Pasta client operations.
2. `sbm-api` remains the internal API for critical platform operations.
3. Never globally redirect all frontend requests to `dp-api`.
4. Franchise creation and provisioning remain internal.
5. Product is the first vertical frontend migration.
6. Do not migrate Material or Service before Product is stable.
7. Product uses PATCH, not PUT.
8. Product uses logical delete through POST, never HTTP DELETE.
9. The Product audit log is hidden and must not be exposed or generated by the frontend.
10. Do not remove the old `sbm-api` Product path until all consumers migrate and regression checks pass.
11. Preserve existing user changes in the dirty worktree.
12. Do not copy credentials from `.env` or legacy documentation.
13. Authentication failures must be fixed through a valid contract, not permission bypasses.
14. Client and internal API ownership must be visible in frontend code.
15. Changes must be incremental and validated one step at a time.

---

## 13. Immediate next step

### 13.1 Exact objective

Validate the implemented Product list/detail cutover in the browser. Once the user confirms it with `ok`, design and implement the smallest safe Product CREATE adaptation for `dp-api` without re-enabling PATCH or delete.

### 13.2 First task in a new conversation

Read completely before editing:

```text
PROJECT_CONTEXT.md
src/api/clients.js
src/api/axios.js
src/views/ProductView.vue
src/components/CRUDManagerComponent.vue
src/components/CRUDGridComponent.vue
src/components/SimpleFormComponent.vue
products serializer/viewset contract in DP-API
```

Then determine:

1. Confirm Product list renders after selecting a Franchise.
2. Confirm Properties loads general Product detail through integer `id` without legacy configuration requests.
3. Confirm Network requests target port 8081 for Product and port 8082 for Franchise.
4. Confirm search, ordering and pagination behavior.
5. Determine whether Product code and SKU are generated by DP-API or entered by the frontend.
6. Confirm whether stored SBM `uuid` equals the DP-API business `users.User.code` required for `created_by`.
7. Define the writable Product POST projection and exclude pseudo/read-only fields.

### 13.3 Current implementation files

The first cutover changed:

```text
src/api/clients.js
src/api/axios.js
src/views/ProductView.vue
src/components/CRUDManagerComponent.vue
src/components/CRUDGridComponent.vue
src/components/PropertiesComponent.vue
docker-compose.yml
.env (ignored; URL keys only, never reproduce credential values)
```

### 13.4 Read-cutover acceptance criteria

The first implementation step is considered validated when:

1. Product list/detail requests use `dpApi` on port 8081.
2. Franchise and login still use `sbmApi` on port 8082.
3. Product list works with the validated pagination contract.
4. Product detail uses integer `id`.
5. No Product POST, PATCH, delete, config or price-history request is issued.
6. Existing non-Product CRUD behavior remains unchanged.

Do not proceed to create/update/delete adaptations until list and detail are validated.

### 13.5 Interaction rule

When the user responds only with:

```text
ok
```

it means the previous validation produced exactly the expected result. Continue directly to the next incremental step without asking for the same output again.

---

## 14. Executive summary

`sbm-manager` is the Vue 3 enterprise frontend for SBM Suite. It now has two explicit Axios clients: `dpApi` for Ditaly Pasta client operations and `sbmApi` for internal, critical and not-yet-migrated operations. The legacy `src/api/axios.js` default remains mapped to `sbmApi` to prevent global regressions.

The first frontend migration is Product. Product list and detail now use `dpApi`, select rows by integer `id`, omit the unsupported `is_visible` filter and expose `price_gross_amount`. Franchise selection remains on `sbmApi`. Product writes and legacy advanced configuration are disabled so a DP-API row cannot be mutated accidentally through the old SBM-API behavior.

The immediate task is interactive browser validation of Product list/detail. After explicit user confirmation, the next vertical slice is Product CREATE: resolve code/SKU ownership, validate `created_by`, build a Product-specific writable payload and keep PATCH/delete disabled until their own validation phases.

The long-term frontend target is a clear domain-oriented integration where every client operation reaches `dp-api`, every internal critical operation reaches `sbm-api`, and neither developers nor future AI-assisted workflows can accidentally cross that boundary through a single ambiguous base URL.
