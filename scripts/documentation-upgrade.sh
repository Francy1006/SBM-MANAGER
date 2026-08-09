#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/.env.dev"
[[ -f "${ENV_FILE}" ]] || { echo "ERROR: No existe ${ENV_FILE}" >&2; exit 1; }

get_env() {
  local key="$1"
  awk -v key="${key}" '
    index($0, key "=") == 1 { value = substr($0, length(key) + 2) }
    END { sub(/\r$/, "", value); sub(/^"/, "", value); sub(/"$/, "", value); printf "%s", value }
  ' "${ENV_FILE}"
}

PROJECT_NAME="$(get_env DOPPLER_PROJECT)"
AI_ASSISTANT_URL="$(get_env AI_ASSISTANT_URL)"
SBM_SUITE_ROOT_RAW="$(get_env SBM_SUITE_ROOT)"
[[ "${PROJECT_NAME}" == "sbm-manager" ]] || { echo "ERROR: DOPPLER_PROJECT debe ser sbm-manager" >&2; exit 1; }

if [[ "${SBM_SUITE_ROOT_RAW}" = /* ]]; then
  SBM_SUITE_ROOT="${SBM_SUITE_ROOT_RAW}"
else
  SBM_SUITE_ROOT="$(cd "${PROJECT_ROOT}/${SBM_SUITE_ROOT_RAW}" && pwd)"
fi

DOCUMENTATION_ROOT="${SBM_SUITE_ROOT}/context/documentation"
INPUT_DIR="${DOCUMENTATION_ROOT}/input"
OUTPUT_DIR="${DOCUMENTATION_ROOT}/output"
UPGRADE_ZIP="${INPUT_DIR}/documentation-upgrade.zip"
RESPONSE_FILE="${OUTPUT_DIR}/documentation-upgrade-response.json"

mkdir -p "${INPUT_DIR}" "${OUTPUT_DIR}" "${SBM_SUITE_ROOT}/context/backup"
rm -f "${RESPONSE_FILE}"
[[ -f "${UPGRADE_ZIP}" ]] || { echo "ERROR: No existe ${UPGRADE_ZIP}" >&2; exit 1; }
[[ "$(find "${INPUT_DIR}" -maxdepth 1 -type f -name '*.zip' | wc -l | tr -d ' ')" == "1" ]] || {
  echo "ERROR: Debe existir exactamente un ZIP en ${INPUT_DIR}" >&2
  exit 1
}

HTTP_STATUS="$(
  curl --silent --show-error --output "${RESPONSE_FILE}" --write-out "%{http_code}" \
    --request POST "${AI_ASSISTANT_URL%/}/documentation/upgrade" \
    --header "Content-Type: application/json" \
    --data-binary "$(PROJECT_NAME="${PROJECT_NAME}" python3 <<'PY'
import json, os
print(json.dumps({"project_name": os.environ["PROJECT_NAME"], "workflow": "documentation-upgrade"}))
PY
    )"
)"

if [[ "${HTTP_STATUS}" -lt 200 || "${HTTP_STATUS}" -ge 300 ]]; then
  echo "ERROR: documentation-upgrade HTTP ${HTTP_STATUS}" >&2
  cat "${RESPONSE_FILE}" >&2 || true
  exit 1
fi

python3 - "${RESPONSE_FILE}" "${PROJECT_NAME}" <<'PY'
import json, sys
from pathlib import Path
p = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
if p.get("workflow") != "documentation-upgrade" or p.get("project_name") != sys.argv[2]:
    raise SystemExit("ERROR: respuesta inválida")
if p.get("errors") not in ([], None):
    raise SystemExit(f"ERROR: backend informó errores: {p.get('errors')}")
if p.get("input_cleaned") is not True:
    raise SystemExit("ERROR: input no fue limpiado")
files = p.get("updated_files")
if not isinstance(files, list) or not files:
    raise SystemExit("ERROR: no hay updated_files")
print("Archivos actualizados:")
for f in files:
    print(f"- {f}")
print(f"Backup generado: {p.get('backup_directory')}")
PY

[[ ! -e "${UPGRADE_ZIP}" ]] || { echo "ERROR: documentation-upgrade.zip no fue eliminado" >&2; exit 1; }
echo "Documentación actualizada correctamente."
