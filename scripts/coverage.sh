#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
APP_DIR="${PROJECT_ROOT}/sbm-manager"
LCOV_REPORT="${APP_DIR}/coverage/lcov.info"

cd "${PROJECT_ROOT}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker es obligatorio; no se permite ejecutar Node/Yarn en el host." >&2
  exit 1
fi

if ! docker compose config --services | grep -qx 'app'; then
  echo "Error: no existe el servicio Docker Compose 'app'." >&2
  exit 1
fi

if ! docker compose run --rm --no-deps app test -x /app/node_modules/.bin/vitest; then
  echo "Error: faltan dependencias QA en la imagen. Ejecuta: docker compose build app" >&2
  exit 1
fi

docker compose run --rm --no-deps app yarn test:coverage

if [[ ! -s "${LCOV_REPORT}" ]]; then
  echo "Error: no se generó ${LCOV_REPORT}." >&2
  exit 1
fi

echo "Coverage generado: ${LCOV_REPORT}"
