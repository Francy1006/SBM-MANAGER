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
[[ -n "${AI_ASSISTANT_URL}" && -n "${SBM_SUITE_ROOT_RAW}" ]] || { echo "ERROR: Falta configuración lifecycle" >&2; exit 1; }

if [[ "${SBM_SUITE_ROOT_RAW}" = /* ]]; then
  SBM_SUITE_ROOT="${SBM_SUITE_ROOT_RAW}"
else
  SBM_SUITE_ROOT="$(cd "${PROJECT_ROOT}/${SBM_SUITE_ROOT_RAW}" && pwd)"
fi

DOCUMENTATION_ROOT="${SBM_SUITE_ROOT}/context/documentation"
INPUT_DIR="${DOCUMENTATION_ROOT}/input"
OUTPUT_DIR="${DOCUMENTATION_ROOT}/output"
FORMAT_CONTEXT_FILE="${DOCUMENTATION_ROOT}/FORMAT_CONTEXT.md"
SYSTEM_PROMPT_FILE="${DOCUMENTATION_ROOT}/SYS_PROMPT.md"
QA_RESULTS_FILE="${PROJECT_ROOT}/context/qa-results.md"
PROJECT_TREE_SCRIPT="${SBM_SUITE_ROOT}/context/project-tree.sh"
PROJECT_TREE_FILE="${SBM_SUITE_ROOT}/context/project-tree.txt"
RESPONSE_FILE="${OUTPUT_DIR}/documentation-export-response.json"

[[ -f "${FORMAT_CONTEXT_FILE}" && -f "${SYSTEM_PROMPT_FILE}" ]] || {
  echo "ERROR: faltan contratos de documentación globales" >&2
  exit 1
}
[[ -x "${PROJECT_TREE_SCRIPT}" ]] || { echo "ERROR: project-tree.sh no disponible" >&2; exit 1; }

mkdir -p "${INPUT_DIR}" "${OUTPUT_DIR}"
find "${INPUT_DIR}" -mindepth 1 ! -name ".gitkeep" -delete
find "${OUTPUT_DIR}" -mindepth 1 ! -name ".gitkeep" -delete

"${PROJECT_TREE_SCRIPT}"
[[ -f "${PROJECT_TREE_FILE}" ]] || { echo "ERROR: No se generó project-tree.txt" >&2; exit 1; }

cd "${PROJECT_ROOT}"
GIT_DIFF="$(
  {
    git diff --no-ext-diff -- . ':(exclude).env' ':(exclude).env.*' ':(exclude)**/.env' ':(exclude)**/.env.*'
    git diff --cached --no-ext-diff -- . ':(exclude).env' ':(exclude).env.*' ':(exclude)**/.env' ':(exclude)**/.env.*'
  } 2>/dev/null
)"
CHANGED_FILES="$(
  {
    git diff --name-only -- . ':(exclude).env' ':(exclude).env.*' ':(exclude)**/.env' ':(exclude)**/.env.*'
    git diff --cached --name-only -- . ':(exclude).env' ':(exclude).env.*' ':(exclude)**/.env' ':(exclude)**/.env.*'
    git ls-files --others --exclude-standard
  } 2>/dev/null | awk '!/(^|\/)\.env($|\.)/' | sort -u
)"
if [[ -n "${CHANGED_FILES}" ]]; then
  CHANGE_SUMMARY="Current ${PROJECT_NAME} changes affect: $(printf '%s\n' "${CHANGED_FILES}" | awk 'NF' | paste -sd ',' - | sed 's/,/, /g')."
else
  CHANGE_SUMMARY="No uncommitted changes detected in ${PROJECT_NAME}."
fi
if [[ -f "${QA_RESULTS_FILE}" ]]; then QA_RESULTS="$(cat "${QA_RESULTS_FILE}")"; else QA_RESULTS="QA evidence not supplied"; fi
PROJECT_TREE="$(cat "${PROJECT_TREE_FILE}")"

PAYLOAD="$(
  PROJECT_NAME="${PROJECT_NAME}" \
  CHANGE_SUMMARY="${CHANGE_SUMMARY}" CHANGED_FILES="${CHANGED_FILES}" GIT_DIFF="${GIT_DIFF}" \
  QA_RESULTS="${QA_RESULTS}" python3 <<'PY'
import json, os
print(json.dumps({
    "project_name": os.environ["PROJECT_NAME"],
    "workflow": "documentation-deploy",
    "change_summary": os.environ["CHANGE_SUMMARY"],
    "changed_files": [x for x in os.environ["CHANGED_FILES"].splitlines() if x.strip()],
    "git_diff": os.environ["GIT_DIFF"],
    "qa_results": os.environ["QA_RESULTS"],
    "retrieved_context_chunks": [],
}))
PY
)"

curl --fail-with-body --silent --show-error \
  --request POST "${AI_ASSISTANT_URL%/}/documentation/export" \
  --header "Content-Type: application/json" \
  --data-binary "${PAYLOAD}" \
  --output "${RESPONSE_FILE}"

python3 - "${RESPONSE_FILE}" "${PROJECT_NAME}" <<'PY'
import json, sys
from pathlib import Path
p = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
if p.get("status") != "completed" or p.get("workflow") != "documentation-deploy":
    raise SystemExit("ERROR: documentation-deploy no terminó correctamente")
if p.get("project_name") != sys.argv[2]:
    raise SystemExit("ERROR: project_name no coincide")
if p.get("collection_name") != "sbm_documentation":
    raise SystemExit("ERROR: colección inesperada")
if p.get("errors") not in ([], None):
    raise SystemExit(f"ERROR: backend informó errores: {p.get('errors')}")
print("Exportación de documentación completada.")
print(f"Paquete: {p.get('documentation_zip_path')}")
PY

echo
echo "Generado en: ../../context/documentation/output"
echo "Respuesta: ../../context/documentation/output/documentation-export-response.json"
