#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Uso:
  ./scripts/context-deploy.sh planning-activation <objective_id> <user_prompt>
  ./scripts/context-deploy.sh implementation-progress <objective_id> [user_prompt]
  ./scripts/context-deploy.sh implementation-closure <objective_id> [user_prompt]
EOF
}

[[ "$#" -ge 2 && "$#" -le 3 ]] || { usage >&2; exit 1; }

LIFECYCLE_PHASE="$1"
OBJECTIVE_ID="$2"
USER_PROMPT="${3:-}"

case "${LIFECYCLE_PHASE}" in
  planning-activation|implementation-progress|implementation-closure) ;;
  *) echo "ERROR: Fase no válida: ${LIFECYCLE_PHASE}" >&2; usage >&2; exit 1 ;;
esac

[[ "${OBJECTIVE_ID}" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]] || {
  echo "ERROR: objective_id inválido" >&2
  exit 1
}

if [[ "${LIFECYCLE_PHASE}" == "planning-activation" && -z "${USER_PROMPT//[[:space:]]/}" ]]; then
  echo "ERROR: planning-activation requiere user_prompt" >&2
  exit 1
fi

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/.env.dev"
PROJECT_NAME="sbm-manager"
EXPECTED_CANONICAL_PROJECT_PATH="/suite/sbm/SBM-MANAGER"

[[ -f "${ENV_FILE}" ]] || { echo "ERROR: No existe ${ENV_FILE}" >&2; exit 1; }

get_env() {
  local key="$1"
  awk -v key="${key}" '
    index($0, key "=") == 1 { value = substr($0, length(key) + 2) }
    END { sub(/\r$/, "", value); sub(/^"/, "", value); sub(/"$/, "", value); printf "%s", value }
  ' "${ENV_FILE}"
}

DOPPLER_PROJECT="$(get_env DOPPLER_PROJECT)"
AI_ASSISTANT_URL="$(get_env AI_ASSISTANT_URL)"
SBM_SUITE_ROOT_RAW="$(get_env SBM_SUITE_ROOT)"

[[ "${DOPPLER_PROJECT}" == "${PROJECT_NAME}" ]] || {
  echo "ERROR: DOPPLER_PROJECT debe ser ${PROJECT_NAME}" >&2
  exit 1
}
[[ -n "${AI_ASSISTANT_URL}" ]] || { echo "ERROR: Falta AI_ASSISTANT_URL" >&2; exit 1; }
[[ -n "${SBM_SUITE_ROOT_RAW}" ]] || { echo "ERROR: Falta SBM_SUITE_ROOT" >&2; exit 1; }

resolve_suite_root() {
  local configured="$1"
  local candidate
  if [[ "${configured}" = /* ]]; then candidate="${configured}"; else candidate="${PROJECT_ROOT}/${configured}"; fi
  [[ -d "${candidate}" ]] || { echo "ERROR: No existe SBM_SUITE_ROOT: ${candidate}" >&2; return 1; }
  (cd "${candidate}" && pwd)
}

SBM_SUITE_ROOT="$(resolve_suite_root "${SBM_SUITE_ROOT_RAW}")"
CONTEXT_ROOT="${SBM_SUITE_ROOT}/context"
INPUT_DIR="${CONTEXT_ROOT}/input"
OUTPUT_DIR="${CONTEXT_ROOT}/output"
PROMPT_TEMPLATE="${CONTEXT_ROOT}/SYS_PROMPT.md"
FORMAT_CONTEXT_FILE="${CONTEXT_ROOT}/FORMAT_CONTEXT.md"
QA_RESULTS_FILE="${PROJECT_ROOT}/context/qa-results.md"
PROJECT_TREE_SCRIPT="${CONTEXT_ROOT}/project-tree.sh"
PROJECT_TREE_FILE="${CONTEXT_ROOT}/project-tree.txt"
RESPONSE_FILE="${OUTPUT_DIR}/context-export-response.json"
CONTRACT_FILE="$(mktemp)"
META_FILE="$(mktemp)"
trap 'rm -f "${CONTRACT_FILE}" "${META_FILE}"' EXIT

HTTP_STATUS="$(
  curl --silent --show-error --output "${CONTRACT_FILE}" --write-out "%{http_code}" \
    --request GET "${AI_ASSISTANT_URL%/}/contexts/contract"
)"
[[ "${HTTP_STATUS}" == "200" ]] || { echo "ERROR: /contexts/contract HTTP ${HTTP_STATUS}" >&2; exit 1; }

python3 - "${CONTRACT_FILE}" "${PROJECT_NAME}" "${EXPECTED_CANONICAL_PROJECT_PATH}" "${LIFECYCLE_PHASE}" "${META_FILE}" <<'PY'
import json, sys
from pathlib import Path
contract = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
project, expected, phase, meta_path = sys.argv[2:]
version = contract.get("contract_version")
phases = contract.get("lifecycle_phases")
projects = contract.get("canonical_projects")
patches = contract.get("supported_patch_paths")
if not isinstance(version, str) or not version:
    raise SystemExit("ERROR: contract_version inválido")
if not isinstance(phases, list) or phase not in phases:
    raise SystemExit(f"ERROR: lifecycle phase no publicada: {phase}")
if not isinstance(projects, dict) or projects.get(project) != expected:
    raise SystemExit(f"ERROR: {project} no está registrado con canonical path {expected}")
if not isinstance(patches, list):
    raise SystemExit("ERROR: supported_patch_paths inválido")
required = {"patches/global-project-context.json", "patches/project-context.json"}
if phase == "implementation-closure":
    required |= {
        "patches/completed-objectives.json",
        "patches/global-qa-context.json",
        "patches/project-qa-context.json",
    }
missing = sorted(required - set(patches))
if missing:
    raise SystemExit("ERROR: contrato incompleto: " + ", ".join(missing))
Path(meta_path).write_text(json.dumps({"contract_version": version}), encoding="utf-8")
print(f"Contrato validado: {version}")
PY

[[ -f "${PROMPT_TEMPLATE}" ]] || { echo "ERROR: No existe ${PROMPT_TEMPLATE}" >&2; exit 1; }
[[ -f "${FORMAT_CONTEXT_FILE}" ]] || { echo "ERROR: No existe ${FORMAT_CONTEXT_FILE}" >&2; exit 1; }
[[ -x "${PROJECT_TREE_SCRIPT}" ]] || { echo "ERROR: project-tree.sh no disponible/ejecutable" >&2; exit 1; }

mkdir -p "${INPUT_DIR}" "${OUTPUT_DIR}"
find "${INPUT_DIR}" -mindepth 1 ! -name ".gitkeep" -delete
find "${OUTPUT_DIR}" -mindepth 1 ! -name ".gitkeep" -delete

python3 - "${PROMPT_TEMPLATE}" "${OUTPUT_DIR}/SYS_PROMPT.md" "${META_FILE}" "${PROJECT_NAME}" "${LIFECYCLE_PHASE}" "${OBJECTIVE_ID}" <<'PY'
import json, re, sys
from pathlib import Path
src, dst, meta, project, phase, objective = sys.argv[1:]
version = json.loads(Path(meta).read_text(encoding="utf-8"))["contract_version"]
text = Path(src).read_text(encoding="utf-8")
for k, v in {
    "{{PROJECT_NAME}}": project,
    "{{CONTRACT_VERSION}}": version,
    "{{LIFECYCLE_PHASE}}": phase,
    "{{OBJECTIVE_ID}}": objective,
}.items():
    text = text.replace(k, v)
if re.search(r"\{\{[A-Z0-9_]+\}\}", text):
    raise SystemExit("ERROR: SYS_PROMPT.md conserva placeholders sin resolver")
Path(dst).write_text(text, encoding="utf-8")
PY

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

QA_RESULTS=""
[[ -f "${QA_RESULTS_FILE}" ]] && QA_RESULTS="$(cat "${QA_RESULTS_FILE}")"
if [[ "${LIFECYCLE_PHASE}" == "implementation-closure" && -z "${QA_RESULTS//[[:space:]]/}" ]]; then
  echo "ERROR: implementation-closure requiere ${QA_RESULTS_FILE}" >&2
  exit 1
fi

PAYLOAD="$(
  PROJECT_NAME="${PROJECT_NAME}" LIFECYCLE_PHASE="${LIFECYCLE_PHASE}" OBJECTIVE_ID="${OBJECTIVE_ID}" \
  USER_PROMPT="${USER_PROMPT}" CHANGE_SUMMARY="${CHANGE_SUMMARY}" CHANGED_FILES="${CHANGED_FILES}" \
  GIT_DIFF="${GIT_DIFF}" QA_RESULTS="${QA_RESULTS}" PROJECT_ROOT_CANONICAL="${EXPECTED_CANONICAL_PROJECT_PATH}" \
  python3 <<'PY'
import json, os
print(json.dumps({
    "project_name": os.environ["PROJECT_NAME"],
    "workflow": "context-deploy",
    "lifecycle_phase": os.environ["LIFECYCLE_PHASE"],
    "objective_id": os.environ["OBJECTIVE_ID"],
    "user_prompt": os.environ["USER_PROMPT"] or None,
    "project_root": os.environ["PROJECT_ROOT_CANONICAL"],
    "source_context_root": "/suite",
    "format_context_path": "/suite/context/FORMAT_CONTEXT.md",
    "output_directory": "/suite/context/output",
    "change_summary": os.environ["CHANGE_SUMMARY"],
    "changed_files": [x for x in os.environ["CHANGED_FILES"].splitlines() if x.strip()],
    "git_diff": os.environ["GIT_DIFF"],
    "qa_results": os.environ["QA_RESULTS"],
}))
PY
)"

curl --fail-with-body --silent --show-error \
  --request POST "${AI_ASSISTANT_URL%/}/contexts/export" \
  --header "Content-Type: application/json" \
  --data-binary "${PAYLOAD}" \
  --output "${RESPONSE_FILE}"

python3 - "${RESPONSE_FILE}" "${PROJECT_NAME}" "${LIFECYCLE_PHASE}" "${OBJECTIVE_ID}" <<'PY'
import json, sys
from pathlib import Path
p = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
project, phase, objective = sys.argv[2:]
if p.get("status") != "completed" or p.get("workflow") != "context-deploy":
    raise SystemExit("ERROR: context-deploy no terminó correctamente")
if p.get("project_name") != project or p.get("lifecycle_phase") != phase or p.get("objective_id") != objective:
    raise SystemExit("ERROR: respuesta no coincide con la solicitud")
if p.get("errors") not in ([], None):
    raise SystemExit(f"ERROR: backend informó errores: {p.get('errors')}")
print("Exportación de contexto completada.")
print(f"Proyecto: {project}")
print(f"Fase: {phase}")
print(f"Objetivo: {objective}")
PY
