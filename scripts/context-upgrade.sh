#!/usr/bin/env bash
set -euo pipefail

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

AI_ASSISTANT_URL="$(get_env AI_ASSISTANT_URL)"
SBM_SUITE_ROOT_RAW="$(get_env SBM_SUITE_ROOT)"
[[ -n "${AI_ASSISTANT_URL}" ]] || { echo "ERROR: Falta AI_ASSISTANT_URL" >&2; exit 1; }
[[ -n "${SBM_SUITE_ROOT_RAW}" ]] || { echo "ERROR: Falta SBM_SUITE_ROOT" >&2; exit 1; }

if [[ "${SBM_SUITE_ROOT_RAW}" = /* ]]; then
  SBM_SUITE_ROOT="${SBM_SUITE_ROOT_RAW}"
else
  SBM_SUITE_ROOT="$(cd "${PROJECT_ROOT}/${SBM_SUITE_ROOT_RAW}" && pwd)"
fi

CONTEXT_ROOT="${SBM_SUITE_ROOT}/context"
INPUT_DIR="${CONTEXT_ROOT}/input"
OUTPUT_DIR="${CONTEXT_ROOT}/output"
UPGRADE_ZIP="${INPUT_DIR}/context-upgrade.zip"
RESPONSE_FILE="${OUTPUT_DIR}/context-upgrade-response.json"
CONTRACT_FILE="$(mktemp)"
PREFLIGHT_FILE="$(mktemp)"
trap 'rm -f "${CONTRACT_FILE}" "${PREFLIGHT_FILE}"' EXIT

[[ -f "${UPGRADE_ZIP}" ]] || { echo "ERROR: No existe ${UPGRADE_ZIP}" >&2; exit 1; }
[[ "$(find "${INPUT_DIR}" -maxdepth 1 -type f -name '*.zip' | wc -l | tr -d ' ')" == "1" ]] || {
  echo "ERROR: Debe existir exactamente un ZIP en ${INPUT_DIR}" >&2
  exit 1
}

STATUS="$(curl --silent --show-error --output "${CONTRACT_FILE}" --write-out "%{http_code}" \
  --request GET "${AI_ASSISTANT_URL%/}/contexts/contract")"
[[ "${STATUS}" == "200" ]] || { echo "ERROR: /contexts/contract HTTP ${STATUS}" >&2; exit 1; }

python3 - "${CONTRACT_FILE}" "${UPGRADE_ZIP}" "${PROJECT_NAME}" "${EXPECTED_CANONICAL_PROJECT_PATH}" "${PREFLIGHT_FILE}" <<'PY'
import hashlib, json, re, stat, sys, zipfile
from pathlib import Path, PurePosixPath

contract_path, zip_path, project, expected_path, preflight_path = sys.argv[1:]
contract = json.loads(Path(contract_path).read_text(encoding="utf-8"))
version = contract.get("contract_version")
canonical = contract.get("canonical_projects", {}).get(project)
supported = set(contract.get("supported_patch_paths", []))
phases = set(contract.get("lifecycle_phases", []))
if not version or canonical != expected_path:
    raise SystemExit("ERROR: contrato/canonical project inválido")

target_map = {
    "patches/global-project-context.json": "SBM-SUITE/context/PROJECT_CONTEXT.md",
    "patches/completed-objectives.json": "SBM-SUITE/context/COMPLETED_OBJECTIVES.md",
    "patches/suite-context.json": "SBM-SUITE/context/SUITE_CONTEXT.md",
    "patches/business-context.json": "SBM-SUITE/context/BUSINESS_CONTEXT.md",
    "patches/global-qa-context.json": "SBM-SUITE/context/QA_CONTEXT.md",
    "patches/security-context.json": "SBM-SUITE/context/SECURITY_CONTEXT.md",
    "patches/data-context.json": "SBM-SUITE/context/DATA_CONTEXT.md",
    "patches/decisions-context.json": "SBM-SUITE/context/DECISIONS_CONTEXT.md",
    "patches/global-readme.json": "SBM-SUITE/context/README.md",
    "patches/project-context.json": "SBM-SUITE/sbm/SBM-MANAGER/context/PROJECT_CONTEXT.md",
    "patches/project-qa-context.json": "SBM-SUITE/sbm/SBM-MANAGER/context/QA_CONTEXT.md",
    "patches/project-deploy-context.json": "SBM-SUITE/sbm/SBM-MANAGER/context/DEPLOY_CONTEXT.md",
    "patches/project-readme.json": "SBM-SUITE/sbm/SBM-MANAGER/README.md",
}

with zipfile.ZipFile(zip_path) as z:
    infos = z.infolist()
    names = [i.filename for i in infos if not i.is_dir()]
    if len(names) != len(set(names)):
        raise SystemExit("ERROR: ZIP contiene rutas duplicadas")
    for i in infos:
        p = PurePosixPath(i.filename)
        if "\\" in i.filename or p.is_absolute() or ".." in p.parts or stat.S_ISLNK(i.external_attr >> 16):
            raise SystemExit(f"ERROR: ruta insegura: {i.filename}")
    if "manifest.json" not in names:
        raise SystemExit("ERROR: falta manifest.json")
    manifest = json.loads(z.read("manifest.json"))
    if manifest.get("project_name") != project or manifest.get("workflow") != "context-upgrade":
        raise SystemExit("ERROR: manifest project/workflow inválido")
    if manifest.get("canonical_project_path") != expected_path:
        raise SystemExit("ERROR: canonical_project_path inválido")
    phase = manifest.get("lifecycle_phase")
    if phase not in phases:
        raise SystemExit("ERROR: lifecycle_phase no soportada")
    objective = manifest.get("objective_id")
    if not isinstance(objective, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", objective):
        raise SystemExit("ERROR: objective_id inválido")
    physical = set(names)
    allowed = manifest.get("allowed_files")
    updated = manifest.get("updated_files")
    hashes = manifest.get("content_hashes")
    if set(allowed or []) != physical:
        raise SystemExit("ERROR: allowed_files no coincide con ZIP")
    expected_updated = physical - {"manifest.json"}
    if set(updated or []) != expected_updated or set((hashes or {}).keys()) != expected_updated:
        raise SystemExit("ERROR: updated_files/content_hashes no coinciden")
    for name in expected_updated:
        if hashlib.sha256(z.read(name)).hexdigest() != hashes[name]:
            raise SystemExit(f"ERROR: hash inválido: {name}")
    patches = {n for n in physical if n.startswith("patches/")}
    if not patches.issubset(supported):
        raise SystemExit("ERROR: ZIP contiene patches no soportados")
    for patch in patches:
        if patch not in target_map:
            raise SystemExit(f"ERROR: falta target mapping para {patch}")
        payload = json.loads(z.read(patch))
        if payload.get("target_file") != target_map[patch]:
            raise SystemExit(f"ERROR: target_file inválido en {patch}")
    if phase == "implementation-closure":
        required = {
            "patches/completed-objectives.json",
            "patches/global-project-context.json",
            "patches/project-context.json",
            "patches/global-qa-context.json",
            "patches/project-qa-context.json",
        }
        if not required.issubset(patches):
            raise SystemExit("ERROR: faltan patches obligatorios de cierre")
        if manifest.get("qa", {}).get("status") not in {"passed", "success"}:
            raise SystemExit("ERROR: cierre requiere qa.status passed/success")

Path(preflight_path).write_text(json.dumps({
    "contract_version": version,
    "lifecycle_phase": phase,
    "objective_id": objective,
    "canonical_project_path": expected_path,
}), encoding="utf-8")
print(f"Preflight validado: {phase} / {objective}")
PY

mkdir -p "${OUTPUT_DIR}"
rm -f "${RESPONSE_FILE}"

HTTP_STATUS="$(
  curl --silent --show-error --output "${RESPONSE_FILE}" --write-out "%{http_code}" \
    --request POST "${AI_ASSISTANT_URL%/}/contexts/upgrade" \
    --header "Content-Type: application/json" \
    --data-binary "$(
      PROJECT_NAME="${PROJECT_NAME}" PREFLIGHT_FILE="${PREFLIGHT_FILE}" python3 <<'PY'
import json, os
from pathlib import Path
p = json.loads(Path(os.environ["PREFLIGHT_FILE"]).read_text(encoding="utf-8"))
print(json.dumps({
    "project_name": os.environ["PROJECT_NAME"],
    "workflow": "context-upgrade",
    **p,
}))
PY
    )"
)"

if [[ "${HTTP_STATUS}" -lt 200 || "${HTTP_STATUS}" -ge 300 ]]; then
  echo "ERROR: context-upgrade HTTP ${HTTP_STATUS}" >&2
  cat "${RESPONSE_FILE}" >&2 || true
  exit 1
fi

python3 - "${RESPONSE_FILE}" "${PROJECT_NAME}" <<'PY'
import json, sys
from pathlib import Path
p = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
project = sys.argv[2]
if p.get("workflow") != "context-upgrade" or p.get("project_name") != project:
    raise SystemExit("ERROR: respuesta de upgrade inválida")
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

[[ ! -e "${UPGRADE_ZIP}" ]] || { echo "ERROR: context-upgrade.zip no fue eliminado" >&2; exit 1; }
echo "Contextos actualizados correctamente."
