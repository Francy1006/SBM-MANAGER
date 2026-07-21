#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LCOV_REPORT="${PROJECT_ROOT}/sbm-manager/coverage/lcov.info"

cd "${PROJECT_ROOT}"

if [[ -n "${ENV_FILE:-}" ]]; then
  SBM_MANAGER_ENV_PATH="${ENV_FILE}"
elif [[ -f "${PROJECT_ROOT}/.env.dev" ]]; then
  SBM_MANAGER_ENV_PATH=".env.dev"
else
  # Temporary compatibility until the current .env is renamed to .env.dev.
  SBM_MANAGER_ENV_PATH=".env"
fi

if [[ "${SBM_MANAGER_ENV_PATH}" != /* ]]; then
  SBM_MANAGER_ENV_PATH="${PROJECT_ROOT}/${SBM_MANAGER_ENV_PATH}"
fi

if [[ ! -f "${SBM_MANAGER_ENV_PATH}" ]]; then
  echo "Error: no existe el archivo de entorno ${SBM_MANAGER_ENV_PATH}." >&2
  exit 1
fi

if ! grep -Eq '^[[:space:]]*SONAR_HOST_URL=.+$' "${SBM_MANAGER_ENV_PATH}"; then
  echo "Error: SONAR_HOST_URL no está definida en ${SBM_MANAGER_ENV_PATH}." >&2
  exit 1
fi

if ! grep -Eq '^[[:space:]]*SONAR_TOKEN=.+$' "${SBM_MANAGER_ENV_PATH}"; then
  echo "Error: SONAR_TOKEN no está definida en ${SBM_MANAGER_ENV_PATH}." >&2
  exit 1
fi

if [[ ! -s "${LCOV_REPORT}" ]]; then
  echo "Error: falta ${LCOV_REPORT}. Ejecuta primero ./scripts/coverage.sh." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker es obligatorio para ejecutar SonarScanner." >&2
  exit 1
fi

mkdir -p "${PROJECT_ROOT}/.sonar/cache"

docker run --rm --platform linux/amd64 \
  --env-file "${SBM_MANAGER_ENV_PATH}" \
  -v "${PROJECT_ROOT}:/usr/src:ro" \
  -v "${PROJECT_ROOT}/.sonar/cache:/opt/sonar-scanner/.sonar/cache" \
  -w /usr/src \
  sonarsource/sonar-scanner-cli
