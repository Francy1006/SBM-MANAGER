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

### 2.2 Existing local work that must be preserved

The worktree was already dirty before the Product API migration audit.

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
Product API migration: ready to begin in frontend
dp-api Product backend: validated
sbm-api Product consumer: still present through shared API client
Automated test suite: not confirmed
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
src/api/axios.js
src/api/franchise.js
```

`src/api/axios.js` currently creates one shared Axios instance for every domain.

Base URL selection:

```javascript
process.env.VUE_APP_API_URL || '/api/'
```

The shared client:

- Adds JSON and XMLHttpRequest headers.
- May add Basic Authentication from environment variables.
- Reads a Bearer token from `localStorage` for every request.
- Clears authentication state and redirects to `/login` on HTTP 401.
- Uses a 10-second timeout.

This single-client design does not yet express the required `dp-api` versus `sbm-api` boundary.

### 4.2 Authentication state

`src/composables/useAuth.js` stores:

```text
uuid
email
name
token
```

Values are stored in `localStorage`.

The Axios interceptor sends:

```text
Authorization: Bearer <token>
```

Important current inconsistency:

- `sbm-manager` sends Bearer tokens.
- The inspected `dp-api` currently enables Session and Basic authentication globally.
- `dp-api` exposes a token endpoint but TokenAuthentication is not globally enabled.

Authentication compatibility must be validated during integration. Do not assume the existing Bearer token is accepted by `dp-api`.

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

Because these are relative paths, all Product operations currently use the single shared Axios base URL.

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

through the same Axios client.

Franchise creation and platform management belong to `sbm-api`. Product migration must not accidentally redirect Franchise operations to `dp-api`.

The Product screen may still read a permitted franchise/tenant context, but that read must be designed explicitly rather than inherited from a global base URL.

### 5.5 Current Product list behavior

`CRUDGridComponent.fetchData()`:

- Sends `page` and `page_size`.
- Sends `ordering`.
- Sends `search` when present.
- Supports standard DRF pagination using `count` and `results`.

This part is broadly compatible with `dp-api` pagination.

Current incompatibility:

```text
hideDeleted=true
→ sends is_visible=true
```

`dp-api` Product does not use `is_visible` for this flow. Normal Product querysets already exclude logically deleted rows.

### 5.6 Current Product identifiers

`CRUDGridComponent.rowId()` prefers:

```text
code → id → sku
```

Product selection therefore normally stores `Product.code`.

Current detail behavior builds:

```text
/products/{selectedId}/
```

Current update behavior also prefers Product `code` when the row has a SKU.

The validated `dp-api` Product detail and PATCH endpoints currently use the Django primary key integer:

```text
/api/products/{id}/
```

This identifier mismatch will cause HTTP 404 unless the frontend sends `id` or `dp-api` deliberately changes its lookup contract.

Do not change the backend lookup field casually. Choose one canonical public identifier and test list, detail, PATCH, and logical delete consistently.

### 5.7 Current create behavior

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

`CRUDManagerComponent` uses PATCH, which matches the permitted `dp-api` method.

Current incompatibilities:

- It may use Product code instead of integer ID in the URL.
- `updated_by` is removed from the payload.
- Generic field cleaning may send fields that are not writable in `dp-api`.

The validated `dp-api` Product endpoint rejects PUT with HTTP 405.

### 5.9 Current delete behavior

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

## 7. API client separation target

### 7.1 Current problem

One Axios instance currently serves both client-owned and internal operations.

Changing `VUE_APP_API_URL` globally from `sbm-api` to `dp-api` would break or misroute internal capabilities such as Franchise and authentication.

### 7.2 Required design property

The frontend must be able to select an API by domain ownership.

Conceptual target:

```text
dpApi
→ Ditaly Pasta client operations

sbmApi
→ internal and critical platform operations
```

Likely environment variables:

```text
VUE_APP_DP_API_URL
VUE_APP_SBM_API_URL
```

Exact names may be adjusted, but there must be two explicit bases. Do not hide the boundary behind one mutable global URL.

### 7.3 Reuse without global regression

Generic CRUD components currently import the shared client directly.

Before editing, choose a low-risk integration pattern, for example:

- Inject an API client/domain key into generic CRUD components; or
- Introduce resource-specific service adapters; or
- Pass fully qualified endpoint/client configuration for Product only.

The chosen pattern must:

- Avoid duplicating Product business logic across components.
- Preserve all non-Product consumers.
- Make API ownership visible in code.
- Support future vertical migrations for Material and Service.
- Keep internal Franchise operations on `sbm-api`.

Do not perform a repository-wide replacement of Axios imports as the first change.

---

## 8. Product migration discrepancy matrix

| Concern | Current sbm-manager behavior | Validated dp-api behavior | Required action |
|---|---|---|---|
| API base | One shared `VUE_APP_API_URL` | Separate client-facing API on port 8081 | Add explicit API boundary |
| Product list | Relative `products/` | `/api/products/` | Route through dp-api client |
| Pagination | Supports `count` and `results` | `count`, `next`, `previous`, `results` | Preserve and verify |
| Hidden deleted filter | Sends `is_visible=true` | Deleted rows excluded by queryset | Remove Product-only invalid filter |
| Row identity | Prefers `code` | Detail currently uses integer `id` | Normalize Product operations to canonical identifier |
| Detail | `/products/{code}/` in common case | `/api/products/{id}/` | Use row `id` or change contract deliberately |
| Create | POST | POST | Preserve method |
| Create audit | Removes `created_by` | `created_by` required currently | Inject validated authenticated business user code |
| Code/SKU | Not supplied by current form | Required currently | Decide server generation versus frontend input |
| Update | PATCH | PATCH | Preserve method, correct identifier and payload |
| Update audit | Removes `updated_by` | `updated_by` required | Inject validated user code |
| Full update | Generic architecture may support update concept | PUT rejected | Never use PUT for Product |
| Logical delete | Collection `/soft_delete/` with `ids` | Detail `/{id}/delete/` with `deleted_by` | Add Product-specific delete adapter |
| Physical delete | Not directly used in inspected Product path | HTTP DELETE rejected | Keep disabled |
| Product price display | Expects multiple embedded price fields | Exposes `price` and `price_gross_amount` | Adapt UI or define additional dp-api projection |
| Internal log | Field still listed in Product view configuration | Never exposed | Remove frontend dependency entirely |
| Authentication | Bearer token from localStorage | Session/Basic currently configured | Validate compatibility before cutover |

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

### 9.4 API authentication mismatch

The frontend Bearer-token strategy and `dp-api` Session/Basic configuration are not currently proven compatible.

An HTTP 401 during Product cutover must be diagnosed as an authentication contract issue, not bypassed by removing authorization or weakening API permissions.

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
- ⏳ Introduce explicit `dp-api` and `sbm-api` client boundaries.
- ⏳ Route Product list and detail to `dp-api`.
- ⏳ Resolve Product identifier contract.
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

Design the smallest safe API-client separation that routes only Product operations to `dp-api` while preserving Franchise, login, and all other internal operations on `sbm-api`.

### 13.2 First task in a new conversation

Begin with an audit without modifications.

Read completely:

```text
PROJECT_CONTEXT.md
package.json
vue.config.js
src/api/axios.js
src/api/franchise.js
src/composables/useAuth.js
src/views/ProductView.vue
src/components/CRUDManagerComponent.vue
src/components/CRUDGridComponent.vue
src/components/SimpleFormComponent.vue
src/components/PropertiesComponent.vue
src/components/CalculationComponent.vue
src/router/index.js
docker-compose.yml
```

Then determine:

1. Which current calls are internal `sbm-api` calls.
2. Which Product calls must move to `dp-api`.
3. How a generic component can select the correct API without changing other screens.
4. Whether the stored `uuid` is a valid `dp-api users.User.code`.
5. Whether the current Bearer token is accepted by `dp-api`.
6. Whether Product detail/update/delete should use integer ID or the API should deliberately expose code lookup.
7. Whether Product code and SKU are generated by the API or entered by the frontend.
8. Which price/calculation fields the Product UI truly requires on initial list versus advanced detail.

Report the exact files and proposed minimal change set before editing.

### 13.3 Initial search terms

Search the full repository for:

```text
products/
ProductView
VUE_APP_API_URL
axios
franchises/
soft_delete
created_by
updated_by
deleted_by
localStorage
uuid
price_configuration
base_net_amount
gross_amount
price_gross_amount
item_group
group_name
.put(
.delete(
```

### 13.4 Initial acceptance criteria

The first implementation step is complete only when:

1. Product requests use the explicit `dp-api` client.
2. Franchise and login still use `sbm-api`.
3. No global base URL replacement occurred.
4. Product list works with the validated pagination contract.
5. Existing dirty-worktree changes remain intact.
6. `yarn build` passes.

Do not proceed to create/update/delete adaptations until list and detail are validated.

### 13.5 Interaction rule

When the user responds only with:

```text
ok
```

it means the previous validation produced exactly the expected result. Continue directly to the next incremental step without asking for the same output again.

---

## 14. Executive summary

`sbm-manager` is the Vue 3 enterprise frontend for SBM Suite. It currently uses one shared Axios client, even though the platform now has two explicit API responsibilities: `dp-api` for Ditaly Pasta client operations and `sbm-api` for internal and critical platform operations.

The first frontend migration is Product. The Product screen already uses some canonical fields such as `item_group` and `item_group_name`, and its generic grid supports standard DRF pagination. However, it still depends on the shared API base, uses Product code where `dp-api` currently expects integer ID, removes required audit user fields, calls an incompatible bulk soft-delete endpoint, and expects embedded pricing fields not present in the validated `dp-api` Product list response.

The immediate task is to introduce a visible, low-risk API-client boundary and move Product reads first, without changing Franchise, login, or other internal consumers. Product create, PATCH, and logical delete must migrate only after list and detail are validated. Existing local changes on the active Orders feature branch must be preserved.

The long-term frontend target is a clear domain-oriented integration where every client operation reaches `dp-api`, every internal critical operation reaches `sbm-api`, and neither developers nor future AI-assisted workflows can accidentally cross that boundary through a single ambiguous base URL.
