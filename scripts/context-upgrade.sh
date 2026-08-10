#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SBM_SUITE_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
GLOBAL_SCRIPT="${SBM_SUITE_ROOT}/context/scripts/context-upgrade.sh"

[[ -x "${GLOBAL_SCRIPT}" ]] || {
  echo "ERROR: ${GLOBAL_SCRIPT} no está disponible o no es ejecutable" >&2
  exit 1
}

exec "${GLOBAL_SCRIPT}" "$@"
