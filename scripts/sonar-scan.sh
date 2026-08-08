#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/.env.dev"
REPORT_FILE="${PROJECT_ROOT}/report-task.txt"

[[ -f "${ENV_FILE}" ]] || { echo "ERROR: No existe ${ENV_FILE}" >&2; exit 1; }

get_env() {
  local key="$1"
  awk -v key="${key}" '
    index($0, key "=") == 1 { value = substr($0, length(key) + 2) }
    END { sub(/\r$/, "", value); sub(/^"/, "", value); sub(/"$/, "", value); printf "%s", value }
  ' "${ENV_FILE}"
}

SONAR_HOST_URL="$(get_env SONAR_HOST_URL)"
SONAR_API_URL="$(get_env SONAR_API_URL)"
SONAR_TOKEN="$(get_env SONAR_TOKEN)"

[[ -n "${SONAR_HOST_URL}" ]] || { echo "ERROR: Falta SONAR_HOST_URL" >&2; exit 1; }
[[ -n "${SONAR_API_URL}" ]] || { echo "ERROR: Falta SONAR_API_URL" >&2; exit 1; }
[[ -n "${SONAR_TOKEN}" ]] || { echo "ERROR: Falta SONAR_TOKEN" >&2; exit 1; }
[[ -s "${PROJECT_ROOT}/sbm-manager/coverage/lcov.info" ]] || {
  echo "ERROR: falta sbm-manager/coverage/lcov.info. Ejecute coverage.sh primero." >&2
  exit 1
}

rm -f "${REPORT_FILE}"
mkdir -p "${PROJECT_ROOT}/.sonar/cache"

docker run --rm --platform linux/amd64 \
  --env-file "${ENV_FILE}" \
  -v "${PROJECT_ROOT}:/usr/src" \
  -v "${PROJECT_ROOT}/.sonar/cache:/opt/sonar-scanner/.sonar/cache" \
  -w /usr/src \
  sonarsource/sonar-scanner-cli \
  -Dsonar.host.url="${SONAR_HOST_URL}" \
  -Dsonar.scanner.metadataFilePath=/usr/src/report-task.txt

[[ -f "${REPORT_FILE}" ]] || { echo "ERROR: No se generó ${REPORT_FILE}" >&2; exit 1; }

CE_TASK_URL="$(awk -F= '$1=="ceTaskUrl"{print substr($0,index($0,"=")+1)}' "${REPORT_FILE}")"
[[ -n "${CE_TASK_URL}" ]] || { echo "ERROR: No se encontró ceTaskUrl" >&2; exit 1; }
CE_TASK_PATH="${CE_TASK_URL#*://}"
CE_TASK_PATH="/${CE_TASK_PATH#*/}"

echo "Esperando procesamiento de SonarQube..."
while true; do
  CE_RESPONSE="$(curl --silent --show-error --fail \
    --header "Authorization: Bearer ${SONAR_TOKEN}" \
    "${SONAR_API_URL%/}${CE_TASK_PATH}")"
  CE_STATUS="$(printf '%s' "${CE_RESPONSE}" | python3 -c 'import json,sys; print(json.load(sys.stdin)["task"]["status"])')"
  case "${CE_STATUS}" in
    SUCCESS) break ;;
    FAILED|CANCELED) echo "ERROR: Compute Engine ${CE_STATUS}" >&2; exit 1 ;;
    PENDING|IN_PROGRESS) sleep 2 ;;
    *) echo "ERROR: Estado CE desconocido: ${CE_STATUS}" >&2; exit 1 ;;
  esac
done

ANALYSIS_ID="$(printf '%s' "${CE_RESPONSE}" | python3 -c 'import json,sys; print(json.load(sys.stdin)["task"].get("analysisId",""))')"
[[ -n "${ANALYSIS_ID}" ]] || { echo "ERROR: No se obtuvo analysisId" >&2; exit 1; }

QUALITY_RESPONSE="$(curl --silent --show-error --fail \
  --header "Authorization: Bearer ${SONAR_TOKEN}" \
  "${SONAR_API_URL%/}/api/qualitygates/project_status?analysisId=${ANALYSIS_ID}")"
QUALITY_STATUS="$(printf '%s' "${QUALITY_RESPONSE}" | python3 -c 'import json,sys; print(json.load(sys.stdin)["projectStatus"]["status"])')"

echo "SonarScanner: SUCCESS"
echo "Quality Gate: ${QUALITY_STATUS}"

case "${QUALITY_STATUS}" in
  OK) ;;
  *) echo "ERROR: Quality Gate no aprobado: ${QUALITY_STATUS}" >&2; exit 1 ;;
esac
