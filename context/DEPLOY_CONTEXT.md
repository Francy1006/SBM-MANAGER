# DEPLOY_CONTEXT.md

> **Last updated:** 2026-08-10
>
> **Purpose:** Deployment and governed Context/Documentation workflow for SBM-MANAGER.

## 1. Scope and ownership

SBM-MANAGER keeps only local entry points. The canonical lifecycle implementation, contracts, Project Registry integration, QA/Git collection, HTTP exchange, payload construction, ZIP handling, patch application and cleanup live in:

```text
SBM-SUITE/context/scripts/
```

The wrappers resolve `SBM_SUITE_ROOT` from the repository layout and require the corresponding global script to be executable.

## 2. Canonical paths

Project:

```text
SBM-SUITE/SBM/SBM-MANAGER/
```

Global lifecycle and exchange areas:

```text
SBM-SUITE/context/scripts/
SBM-SUITE/context/input/
SBM-SUITE/context/output/
SBM-SUITE/context/backup/
SBM-SUITE/context/documentation/input/
SBM-SUITE/context/documentation/output/
```

The only Project Tree implementation is:

```text
SBM-SUITE/context/project-tree.sh
```

It is invoked by the global workflows; SBM-MANAGER does not own a copy or wrapper.

## 3. Context deploy

Local command:

```bash
./scripts/context-deploy.sh <lifecycle_phase> '<objectives-json-array>' [user_prompt]
```

The wrapper delegates literally to:

```bash
SBM-SUITE/context/scripts/context-deploy.sh sbm-manager "$@"
```

Supported lifecycle phases are `planning-activation`, `implementation-progress` and `implementation-closure`. The canonical contract is `objectives[]`; the local wrapper does not translate legacy single-objective arguments or validate lifecycle data.

## 4. Context upgrade

Place the returned package at the global input path expected by the canonical workflow, then run:

```bash
./scripts/context-upgrade.sh
```

The wrapper delegates all arguments unchanged to `SBM-SUITE/context/scripts/context-upgrade.sh`. The global script obtains `project_name` from the package manifest and owns validation, application, backup and cleanup.

## 5. Documentation deploy

Run:

```bash
./scripts/documentation-deploy.sh
```

The wrapper delegates to the global workflow with `sbm-manager` as the originating project. Documentation collection and reconciliation are suite-global and multi-project: the local entry point neither reads or filters SBM-MANAGER objectives nor constructs payloads.

## 6. Documentation upgrade

Place the returned package at the global Documentation input path expected by the canonical workflow, then run:

```bash
./scripts/documentation-upgrade.sh
```

The wrapper delegates all arguments unchanged to `SBM-SUITE/context/scripts/documentation-upgrade.sh`. Validation and patch application remain exclusively global.

## 7. Runtime configuration and boundaries

Runtime/API and SonarQube settings may remain in the project `.env.dev`, but lifecycle behavior is governed centrally. Environment values must never be exported into Context or Documentation packages.

The global scripts and `sbm-ai-assistant` are authoritative for Project Registry mappings, API contracts, exchange filenames, responses, atomic updates and rollback behavior.
