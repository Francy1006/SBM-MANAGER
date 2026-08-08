#!/usr/bin/env bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONTEXT_DIR="${PROJECT_ROOT}/context"
RESULT_FILE="${CONTEXT_DIR}/qa-results.md"
COVERAGE_LOG="$(mktemp)"
SONAR_LOG="$(mktemp)"
trap 'rm -f "${COVERAGE_LOG}" "${SONAR_LOG}"' EXIT

mkdir -p "${CONTEXT_DIR}"
GENERATED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

TEST_EXIT=1
SONAR_EXIT=1
SCANNER_STATUS="not_run"
QUALITY_GATE="not_run"
TEST_SUMMARY="N/A"
TEST_FILES_SUMMARY="N/A"
COVERAGE_RESULT="N/A"
OVERALL_STATUS="failed"

echo "1/2 Ejecutando pruebas y coverage..."
if "${SCRIPT_DIR}/coverage.sh" > >(tee "${COVERAGE_LOG}") 2>&1; then
  TEST_EXIT=0
fi

TEST_FILES_SUMMARY="$(grep -E '^[[:space:]]*Test Files[[:space:]]' "${COVERAGE_LOG}" | tail -n 1 | sed 's/^[[:space:]]*//' || true)"
TEST_SUMMARY="$(grep -E '^[[:space:]]*Tests[[:space:]]' "${COVERAGE_LOG}" | tail -n 1 | sed 's/^[[:space:]]*//' || true)"
[[ -n "${TEST_FILES_SUMMARY}" ]] || TEST_FILES_SUMMARY="N/A"
[[ -n "${TEST_SUMMARY}" ]] || TEST_SUMMARY="N/A"

LCOV_FILE="${PROJECT_ROOT}/sbm-manager/coverage/lcov.info"
if [[ -s "${LCOV_FILE}" ]]; then
  COVERAGE_RESULT="$(python3 - "${LCOV_FILE}" <<'PY'
import sys
lf = lh = 0
for line in open(sys.argv[1], encoding="utf-8", errors="ignore"):
    if line.startswith("LF:"): lf += int(line[3:].strip())
    elif line.startswith("LH:"): lh += int(line[3:].strip())
print(f"{(100.0*lh/lf):.2f}%" if lf else "N/A")
PY
)"
fi

if [[ "${TEST_EXIT}" -eq 0 ]]; then
  echo "2/2 Ejecutando SonarScanner..."
  if "${SCRIPT_DIR}/sonar-scan.sh" > >(tee "${SONAR_LOG}") 2>&1; then
    SONAR_EXIT=0
  fi
  if grep -q 'SonarScanner: SUCCESS' "${SONAR_LOG}"; then SCANNER_STATUS="success"; else SCANNER_STATUS="failed"; fi
  QUALITY_GATE="$(awk -F': ' '/^Quality Gate:/{print $2}' "${SONAR_LOG}" | tail -n 1)"
  [[ -n "${QUALITY_GATE}" ]] || QUALITY_GATE="unknown"
fi

if [[ "${TEST_EXIT}" -eq 0 && "${SONAR_EXIT}" -eq 0 && "${QUALITY_GATE}" == "OK" ]]; then
  OVERALL_STATUS="passed"
fi

cat > "${RESULT_FILE}" <<EOF
# QA Results

Generated timestamp: ${GENERATED_AT}
Project: sbm-manager
Overall status: ${OVERALL_STATUS}

## Tests and coverage

Test exit code: ${TEST_EXIT}
Test files: ${TEST_FILES_SUMMARY}
Tests: ${TEST_SUMMARY}
Coverage result: ${COVERAGE_RESULT}
Coverage artifact: sbm-manager/coverage/lcov.info

## SonarQube

SonarScanner exit code: ${SONAR_EXIT}
Scanner execution result: ${SCANNER_STATUS}
Server-side Quality Gate result: ${QUALITY_GATE}

## Evidence

QA execution command: ./scripts/qa-check.sh
Runtime: Docker
EOF

echo
echo "QA evidence: ${RESULT_FILE}"

if [[ "${OVERALL_STATUS}" != "passed" ]]; then
  echo "ERROR: QA no pasó todos los gates." >&2
  exit 1
fi

echo "QA frontend completado correctamente."
