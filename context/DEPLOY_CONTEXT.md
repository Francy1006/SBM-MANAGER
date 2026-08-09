# DEPLOY_CONTEXT.md

> **Last updated:** 2026-08-07
>
> **Purpose:** Deployment and governed context/documentation workflow for SBM-MANAGER.
>
> **Accuracy note:** Runtime paths and configuration names are derived from the supplied repository.

## 1. Scope and ownership

This file covers local Docker execution and SBM Suite context/documentation exchange for:

```text
SBM-SUITE/SBM/SBM-MANAGER/
```

## 2. Required configuration

Local environment file:

```text
.env.dev
```

Required lifecycle variables:

```text
DOPPLER_PROJECT=sbm-manager
AI_ASSISTANT_URL
SBM_SUITE_ROOT
```

Runtime/API and SonarQube variables remain in `.env.dev` but their values must never be exported into generated context/documentation packages.

## 3. Canonical paths

Repository-relative:

```text
SBM-SUITE/SBM/SBM-MANAGER/
```

Expected container/runtime project path:

```text
/suite/sbm/SBM-MANAGER
```

Suite exchange paths from repository root:

```text
../../context/input/
../../context/output/
../../context/backup/
../../context/documentation/input/
../../context/documentation/output/
context/qa-results.md
```

## 4. Context deploy workflow

```text
./scripts/context-deploy.sh <lifecycle_phase> <objective_id> [user_prompt]
→ GET /contexts/contract
→ validate canonical project registration
→ generate global project-tree.txt
→ collect Git and QA evidence excluding .env files
→ POST /contexts/export
→ generate suite-global context package
```

Supported lifecycle phases:

```text
planning-activation
implementation-progress
implementation-closure
```

## 5. Manual review stage

The user uploads only:

```text
../../context/output/context-deploy-package.zip
```

ChatGPT reads the embedded context package and rendered `SYS_PROMPT.md`, then returns:

```text
context-upgrade.zip
```

## 6. Context upgrade workflow

Place:

```text
../../context/input/context-upgrade.zip
```

Run:

```bash
./scripts/context-upgrade.sh
```

Validate:

```text
../../context/output/context-upgrade-response.json
```

## 7. Atomicity and cleanup

- Suite-global input/output exchange directories are used.
- Context input is removed only after successful backend application.
- Backend validation remains authoritative.
- Environment files are excluded from Git evidence packaging.

## 8. Rollback

Backups must use only:

```text
SBM-SUITE/context/backup/<timestamp>_<project>/
```

Backend atomic replacement and rollback remain authoritative.

## 9. Validation performed

Project-side scripts validate:

- required `.env.dev`;
- lifecycle parameters;
- backend published contract;
- canonical project path;
- required ZIP filename and manifest;
- response workflow/project/errors;
- expected input cleanup.

## 10. Current limitations

`sbm-manager` must first be registered in the global context contract and `sbm-ai-assistant` canonical project registry. Until that occurs, project scripts intentionally fail contract preflight rather than bypassing governance.
