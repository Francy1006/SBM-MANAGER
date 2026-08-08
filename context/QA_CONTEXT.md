# QA_CONTEXT.md

> **Last updated:** 2026-08-07
>
> **Purpose:** Canonical repository-local QA context for SBM-MANAGER.
>
> **Accuracy note:** The `2026-07-21` baseline is historical. Current closure evidence must come from a fresh `context/qa-results.md`.

## 1. Project technical details

| Attribute | Value |
|---|---|
| Project | SBM-MANAGER |
| Language | JavaScript |
| Framework | Vue 3 / Vue CLI 5 |
| Runtime | Node.js 20 Alpine / Docker |
| Test framework | Vitest 3.2.4 + Vue Test Utils 2.4.6 |
| Coverage tool | @vitest/coverage-v8 3.2.4 |
| Static analysis tool | SonarQube / SonarScanner CLI |
| SonarQube project key | SBM-MANAGER |
| QA execution command | `./scripts/qa-check.sh` |

## 2. Project QA scope

Current configured QA scope protects Product behavior and the shared frontend boundaries exercised by Product.

## 3. Required quality gates

- Vitest execution must pass.
- Configured coverage thresholds must pass.
- `sbm-manager/coverage/lcov.info` must exist.
- SonarScanner submission must succeed.
- Server-side SonarQube Quality Gate must return `OK`.
- Final QA evidence must be written to `context/qa-results.md`.

Configured Vitest thresholds:

```text
lines       >= 70%
statements  >= 70%
functions   >= 70%
branches    >= 60%
```

## 4. Test environments

Authoritative QA runtime:

```text
Docker Compose service: app
Node runtime: container only
SonarScanner: disposable Docker container
```

Host Node/Yarn execution is not authoritative for final QA.

## 5. Test structure

```text
sbm-manager/src/
├── api/__tests__/
├── components/__tests__/
└── views/__tests__/
```

## 6. Test inventory

| Test ID | Description | Logic type | Components | Risk | Last execution | Result | Evidence |
|---|---|---|---|---:|---|---|---|
| SBM-MGR-API-001 | API client ownership and authentication boundaries | unit | `src/api/clients.js` | 5 | 2026-07-21 | passed | historical repository context |
| SBM-MGR-PRODUCT-001 | Product view orchestration | unit | `ProductView.vue` | 4 | 2026-07-21 | passed | historical repository context |
| SBM-MGR-CRUD-001 | CRUD manager behavior | unit | `CRUDManagerComponent.vue` | 4 | 2026-07-21 | passed | historical repository context |
| SBM-MGR-GRID-001 | CRUD grid behavior | unit | `CRUDGridComponent.vue` | 4 | 2026-07-21 | passed | historical repository context |
| SBM-MGR-FORM-001 | Generic form behavior | unit | `SimpleFormComponent.vue` | 4 | 2026-07-21 | passed | historical repository context |
| SBM-MGR-PROP-001 | Product property behavior | unit | `PropertiesComponent.vue` | 4 | 2026-07-21 | passed | historical repository context |
| SBM-MGR-CONFIRM-001 | Confirmation behavior | unit | `ConfirmComponent.vue` | 3 | 2026-07-21 | passed | historical repository context |

## 7. Test data and fixtures

Tests use deterministic mocks for Axios clients, localStorage, browser APIs and component boundaries. Unit tests must not call real APIs or mutate persistent business data.

## 8. Unit tests

Current repository contains seven Product/reference-slice spec files and historically records 40 passing tests.

## 9. Integration tests

No dedicated frontend integration-test suite is evidenced in the supplied repository.

## 10. API tests

API contracts are mocked at the Axios client boundary. Real backend API acceptance remains outside this unit/component suite.

## 11. Database tests

N/A. SBM-MANAGER does not own PostgreSQL access.

## 12. Security tests

Current tests protect API-client authentication separation and avoid real environment credentials. Dedicated security/E2E testing is not evidenced.

## 13. Static analysis

SonarQube project:

```text
SBM-MANAGER
```

Current scanner scope is defined in root `sonar-project.properties`.

## 14. Coverage

Historical Vitest/V8 baseline from `2026-07-21`:

```text
statements 70.03%
lines      70.03%
functions  72.83%
branches   66.90%
```

Expected current artifact:

```text
sbm-manager/coverage/lcov.info
```

## 15. SonarQube

Historical `2026-07-21` baseline:

```text
Quality Gate: PASSED / API status OK
Sonar coverage: 69.6%
Reliability: C
Security: A
Maintainability: A
Security hotspots: 0
Duplicated lines density: 1.9%
```

Historical findings are technical debt and do not become current evidence automatically.

## 16. Current validated evidence

No fresh QA execution is included with this context bootstrap.

Run:

```bash
./scripts/qa-check.sh
```

to generate:

```text
context/qa-results.md
```

## 17. Known defects

Historical Sonar baseline recorded 10 bugs and 52 code smells. Their current status must be revalidated.

## 18. Accepted exceptions

- Product/reference-slice coverage is accepted as the initial frontend QA baseline.
- Full repository E2E coverage is not part of the current configured gate.

## 19. Pending QA work

- Run fresh QA after context lifecycle integration.
- Reconcile new QA evidence into project and global QA contexts.
- Expand scope beyond Product only through an explicit objective.

## 20. Related documentation

```text
SBM-SUITE/SBM/SBM-MANAGER/context/PROJECT_CONTEXT.md
SBM-SUITE/SBM/SBM-MANAGER/context/DEPLOY_CONTEXT.md
SBM-SUITE/context/QA_CONTEXT.md
```

## 21. Document boundary

This file defines SBM-MANAGER QA scope, gates, evidence and known limitations. It does not claim current test, coverage or SonarQube success without a fresh generated report.
