#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
APP_DIR="${PROJECT_ROOT}/sbm-manager"
ENV_FILE="${PROJECT_ROOT}/.env.dev"
LCOV_REPORT="${APP_DIR}/coverage/lcov.info"

cd "${PROJECT_ROOT}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker es obligatorio; no se permite ejecutar Node/Yarn en el host." >&2
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Error: no existe ${ENV_FILE}." >&2
  exit 1
fi

if ! docker compose --env-file "${ENV_FILE}" config --services | grep -qx 'app'; then
  echo "Error: no existe el servicio Docker Compose 'app'." >&2
  exit 1
fi

if ! docker compose --env-file "${ENV_FILE}" run --rm --no-deps app test -x /app/node_modules/.bin/vitest; then
  echo "Error: faltan dependencias QA en la imagen." >&2
  echo "Ejecuta: docker compose --env-file \"${ENV_FILE}\" build app" >&2
  exit 1
fi

docker compose --env-file "${ENV_FILE}" run --rm --no-deps app yarn test:coverage

if [[ ! -s "${LCOV_REPORT}" ]]; then
  echo "Error: no se generó ${LCOV_REPORT}." >&2
  exit 1
fi

echo "Coverage generado: ${LCOV_REPORT}"