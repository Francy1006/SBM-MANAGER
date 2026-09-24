#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SUITE_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
source "${SUITE_ROOT}/context/scripts/sonar-scanner-common.sh"
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

SONAR_ARCH="$(sbm_sonar_detect_arch)"
SONAR_SCANNER_PLATFORM="$(sbm_sonar_platform)"
SONAR_CACHE_DIR="$(sbm_sonar_cache_dir "${PROJECT_ROOT}" "${SONAR_ARCH}")"
SONAR_CONTAINER_NAME="sbm-sonar-${SONAR_ARCH}-$$"
mkdir -p "${SONAR_CACHE_DIR}"

docker_args=(
  docker
  run
  --rm
  --name
  "${SONAR_CONTAINER_NAME}"
  --platform
  "${SONAR_SCANNER_PLATFORM}"
  --env-file
  "${SBM_MANAGER_ENV_PATH}"
  -v
  "${PROJECT_ROOT}:/usr/src:ro"
  -v
  "${SONAR_CACHE_DIR}:/opt/sonar-scanner/.sonar/cache"
  -w
  "/usr/src"
  "$(sbm_sonar_image)"
  "-Dsonar.working.directory=/tmp/.scannerwork"
)

sbm_sonar_ensure_image
sbm_sonar_run "${docker_args[@]}"
