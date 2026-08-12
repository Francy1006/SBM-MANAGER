# DEPLOY_CONTEXT.md

> **Last updated:** 2026-08-11
>
> **Purpose:** Deployment and governed Context/Documentation workflow for SBM-MANAGER.

## 1. Scope and ownership

SBM-MANAGER does not own Context or Documentation entry points. The canonical lifecycle scripts, contracts, Project Registry integration, QA/Git collection, HTTP exchange, payload construction, ZIP handling, patch application and cleanup live exclusively in:

```text
SBM-SUITE/context/scripts/
```

All lifecycle commands must be run from `SBM-SUITE/context`; there are no local wrappers in SBM-MANAGER.

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
SBM-SUITE/context/scripts/project-tree.sh
```

It is invoked by the global workflows; SBM-MANAGER does not own a copy or wrapper.

## 3. Context deploy

From `SBM-SUITE/context`, run:

```bash
./scripts/context-deploy.sh sbm-manager <lifecycle_phase> '<objectives-json-array>' [user_prompt]
```

Supported lifecycle phases are `planning-activation`, `objective-activation`, `implementation-progress` and `implementation-closure`. The canonical contract is `objectives[]`; SBM-MANAGER does not translate or validate lifecycle arguments locally.

## 4. Context upgrade

Place the returned package at the global input path expected by the canonical workflow. From `SBM-SUITE/context`, run:

```bash
./scripts/context-upgrade.sh
```

The global script obtains `project_name` from the package manifest and owns validation, application, backup and cleanup.

## 5. Documentation deploy

From `SBM-SUITE/context`, run:

```bash
./scripts/documentation-deploy.sh
```

Documentation collection and reconciliation are suite-global and multi-project. SBM-MANAGER neither selects an originating project nor reads or filters objectives, constructs payloads or owns an entry point.

## 6. Documentation upgrade

Place the returned package at the global Documentation input path expected by the canonical workflow. From `SBM-SUITE/context`, run:

```bash
./scripts/documentation-upgrade.sh
```

Validation and patch application remain exclusively in the global workflow.

## 7. Runtime configuration and boundaries

Runtime/API and SonarQube settings may remain in the project `.env.dev`, but lifecycle behavior is governed centrally. Environment values must never be exported into Context or Documentation packages.

The global scripts and `sbm-ai-assistant` are authoritative for Project Registry mappings, API contracts, exchange filenames, responses, atomic updates and rollback behavior.
