# PROJECT_CONTEXT.md

> **Last updated:** 2026-08-11
>
> **Purpose:** Canonical project context for SBM-MANAGER.
>
> **Accuracy note:** Current-state facts are derived from the supplied SBM-MANAGER repository. Historical QA results remain historical until a fresh `qa-check.sh` execution is produced.

## 1. Executive summary

SBM-MANAGER is the Vue 3 frontend of SBM Suite. It provides authenticated management interfaces and routes client-owned operations to DP-API while retaining internal/platform operations in SBM-API.

## 2. Project purpose

Provide a reusable management UI for products, materials, services, catalogs, orders, providers, clients, franchises and platform configuration without bypassing API ownership boundaries.

## 3. Active objectives

| ID | Objective | Status | Priority | Target date | Branch | Documentation |
|---|---|---|---:|---|---|---|
| SBM-MANAGER-001 | Integrar SBM-MANAGER completamente a SBM Suite, incluyendo contextos, lifecycle scripts, QA/SonarQube, registro en sbm-ai-assistant, sincronización global y actualización del diagrama canónico de arquitectura en SUITE_CONTEXT.md. | active | 5 | 2026-08-07 | `FEATURE-integrates-sbm-manager` | `context/documentation/pages/🤖 AI Architect Roadmap/🏢 SBM-Suite 3a50bde8acd580d0a068d6abc3542603.md` |
| SBM-MANAGER-002 | Corregir SBM-MANAGER para consumir correctamente SBM-API y DP-API según ownership canónico. | active | 5 | N/A | BUGFIX-corrects-api-ownership | N/A |

## 4. Pending objectives

| ID | Objective | Status | Priority | Target date | Branch | Documentation |
|---|---|---|---:|---|---|---|
| SBM-MANAGER-003 | Corregir y completar QA de SBM-MANAGER. | pending | 5 | N/A | BUGFIX-completes-manager-qa | N/A |

## 5. Scope and ownership

Repository:

```text
SBM-SUITE/SBM/SBM-MANAGER/
```

Frontend application:

```text
SBM-SUITE/SBM/SBM-MANAGER/sbm-manager/
```

Ownership boundary:

```text
Client operation   → SBM-MANAGER → DP-API
Platform operation → SBM-MANAGER → SBM-API
```

SBM-MANAGER owns presentation, frontend orchestration, reusable CRUD behavior and API-client selection. It does not own backend business rules or PostgreSQL schema changes.

## 6. Architecture

```text
Browser
→ Vue 3 / Vue Router / Vuex
→ explicit Axios client
   ├─ dpApi  → DP-API
   └─ sbmApi → SBM-API
```

Reusable frontend components include CRUD manager/grid, forms, property panels, confirmation flows, calculation components and detail containers.

## 7. Runtime and containers

Local runtime:

```text
Docker Compose
→ service: app
→ container: sbm_manager
→ host port: 8080
→ container port: 8080
→ external network: sbm-network
```

The frontend image uses Node.js 20 Alpine.

## 8. Configuration

Development environment file:

```text
.env.dev
```

Relevant variables:

```text
VUE_APP_API_URL
VUE_APP_SBM_API_URL
VUE_APP_DP_API_URL
VUE_APP_API_USERNAME
VUE_APP_API_PASSWORD
VUE_APP_DP_API_USERNAME
VUE_APP_DP_API_PASSWORD
SONAR_HOST_URL
SONAR_API_URL
SONAR_TOKEN
DOPPLER_PROJECT
AI_ASSISTANT_URL
SBM_SUITE_ROOT
```

`VUE_APP_*` values are browser-delivered configuration and must never be treated as production secret storage.

## 9. Modules

Current source areas include:

```text
src/api
src/components
src/composables
src/constants
src/router
src/utils
src/views
```

Current management views include Product, Material, Service, Catalog, Orders, Provider, Clients, Franchise, Menu and Fiscal Directive.

## 10. Data model ownership

SBM-MANAGER does not own database schemas or migrations.

```text
SBM-DB / Flyway → physical schema authority
DP-API           → client-domain API contracts
SBM-API          → platform-domain API contracts
SBM-MANAGER      → frontend representation and orchestration
```

## 11. API surface

Local API mapping:

```text
SBM-MANAGER → http://localhost:8080
DP-API      → http://localhost:8081/api
SBM-API     → http://localhost:8082/api
```

The frontend uses explicit `dpApi` and `sbmApi` clients. Product and Material client operations are evidenced as DP-API consumers.

## 12. Authentication and authorization

`sbmApi` uses the current localStorage token as Bearer authentication.

`dpApi` uses the configured development Basic Authentication boundary and must not be overwritten with the SBM Bearer token.

Current localStorage identity fields:

```text
uuid
email
name
token
```

This is current implementation state, not a final security design.

## 13. Integrations

| Integration | Direction | Purpose | Status |
|---|---|---|---|
| DP-API | SBM-MANAGER → DP-API | Client-owned business operations | active |
| SBM-API | SBM-MANAGER → SBM-API | Internal/platform operations | active |
| SonarQube | SBM-MANAGER → SonarQube | Static analysis and Quality Gate | active |
| sbm-ai-assistant | Global Context/Documentation scripts → AI assistant | Centralized lifecycle and multi-project Documentation reconciliation | active |

## 14. Implemented behavior

Verified repository capabilities include:

- Vue 3 management frontend with protected routes;
- explicit DP-API/SBM-API client separation;
- reusable CRUD components;
- Product CRUD and logical-delete flow;
- Material management flow;
- Docker-based development;
- Vitest unit/component QA;
- LCOV coverage generation;
- local SonarQube integration.

## 15. Validation evidence

Historical repository context records a validated baseline on `2026-07-21`:

```text
7 test suites
40 tests passing
Vitest statements/lines: 70.03%
Vitest functions: 72.83%
Vitest branches: 66.90%
SonarQube Quality Gate: passed / API status OK
Sonar coverage: 69.6%
```

This baseline is historical. Fresh lifecycle closure must use a new `context/qa-results.md`.

## 16. Database and migration impact

No database or migration ownership exists in this frontend repository.

## 17. Security considerations

- Never commit `.env.dev`, tokens or credentials.
- `VUE_APP_*` variables are exposed to browser bundles.
- Maintain DP-API and SBM-API authentication separation.
- Do not allow frontend context/documentation workflows to package environment values.
- localStorage authentication remains a known transitional boundary.

## 18. Accepted risks and constraints

- Current Product QA covers a defined frontend slice, not every repository module.
- Historical Sonar findings remain technical debt even when the Quality Gate passes.
- Context and Documentation lifecycle behavior depends on the global scripts and the contracts published by `sbm-ai-assistant`.

## 19. Completed work

- Product-focused Vitest/coverage baseline established.
- SonarQube project `SBM-MANAGER` established.
- DP-API and SBM-API client ownership separated.
- `.env.dev` adopted by Docker Compose.

## 20. Pending work

- Synchronize SBM-MANAGER into global PROJECT, SUITE and QA contexts.
- Execute a fresh `qa-check.sh` after lifecycle integration.
- Extend QA scope only when explicitly approved.

## 21. Required behavior

- Preserve API ownership boundaries.
- Run frontend tests and SonarScanner through Docker.
- Require a server-side SonarQube Quality Gate for final QA when SonarQube applies.
- Generate `context/qa-results.md` as bounded QA evidence.
- Keep Context/Documentation lifecycle scripts exclusively in `SBM-SUITE/context/scripts/`; SBM-MANAGER must not provide local wrappers.
- Use suite-global Context/Documentation input, output and backup directories.
- Use only `SBM-SUITE/context/scripts/project-tree.sh` for Project Tree generation.
- Treat Documentation generation and reconciliation as global and multi-project.
- Never package `.env*` values into context or documentation exports.

## 22. Historical decisions

- Product is the reference frontend QA slice.
- Vue CLI remains the current build/runtime toolchain.
- Vitest is the current unit/component test runner.
- Context and Documentation use the centralized, governed SBM Suite lifecycle and the canonical `objectives[]` contract.

## 23. Related documentation

```text
SBM-SUITE/context/SUITE_CONTEXT.md
SBM-SUITE/context/PROJECT_CONTEXT.md
SBM-SUITE/context/QA_CONTEXT.md
SBM-SUITE/context/documentation/
SBM-SUITE/context/scripts/project-tree.sh
```

## 24. Document boundary

This file describes SBM-MANAGER project state and lifecycle boundaries. It does not replace global SBM Suite context, backend API contracts, database authority, executed QA evidence or documentation pages.
