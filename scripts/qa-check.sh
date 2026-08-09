#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
QA_RESULTS_FILE="${PROJECT_ROOT}/context/qa-results.md"

TEMP_DIRECTORY="$(mktemp -d)"
COVERAGE_LOG="${TEMP_DIRECTORY}/coverage.log"
SONAR_LOG="${TEMP_DIRECTORY}/sonar.log"

cleanup() {
  rm -rf "${TEMP_DIRECTORY}"
}
trap cleanup EXIT

mkdir -p "${PROJECT_ROOT}/context"

COVERAGE_STATUS=0
SONAR_STATUS=0

echo "1/2 Ejecutando pruebas y coverage..."
set +e
"${SCRIPT_DIR}/coverage.sh" 2>&1 | tee "${COVERAGE_LOG}"
COVERAGE_STATUS="${PIPESTATUS[0]}"
set -e

if [[ "${COVERAGE_STATUS}" -eq 0 ]]; then
  echo "2/2 Ejecutando SonarScanner..."
  set +e
  "${SCRIPT_DIR}/sonar-scan.sh" 2>&1 | tee "${SONAR_LOG}"
  SONAR_STATUS="${PIPESTATUS[0]}"
  set -e
else
  SONAR_STATUS=1
  echo "SonarScanner no ejecutado porque tests/coverage fallaron." > "${SONAR_LOG}"
fi

TEST_LINE="$(
  grep -E '^[[:space:]]*Tests[[:space:]]' "${COVERAGE_LOG}" \
    | tail -1 || true
)"

TESTS_TOTAL="$(
  printf '%s\n' "${TEST_LINE}" \
    | sed -nE 's/.*\(([0-9]+)\).*/\1/p'
)"

TESTS_PASSED="$(
  printf '%s\n' "${TEST_LINE}" \
    | sed -nE 's/.*[^0-9]([0-9]+)[[:space:]]+passed.*/\1/p'
)"

TESTS_FAILED="$(
  printf '%s\n' "${TEST_LINE}" \
    | sed -nE 's/.*[^0-9]([0-9]+)[[:space:]]+failed.*/\1/p'
)"

TESTS_TOTAL="${TESTS_TOTAL:-N/A}"
TESTS_PASSED="${TESTS_PASSED:-0}"
TESTS_FAILED="${TESTS_FAILED:-0}"

COVERAGE_RESULT="$(
  awk -F'|' '
    /^All files[[:space:]]*\|/ {
      gsub(/^[ \t]+|[ \t]+$/, "", $2)
      print $2 "%"
      exit
    }
  ' "${COVERAGE_LOG}"
)"
COVERAGE_RESULT="${COVERAGE_RESULT:-N/A}"

SCANNER_RESULT="failed"
if grep -q 'EXECUTION SUCCESS' "${SONAR_LOG}"; then
  SCANNER_RESULT="success"
fi

QUALITY_GATE="N/A"
if grep -q 'QUALITY GATE STATUS: PASSED' "${SONAR_LOG}"; then
  QUALITY_GATE="PASSED"
elif grep -q 'QUALITY GATE STATUS: FAILED' "${SONAR_LOG}"; then
  QUALITY_GATE="FAILED"
fi

OVERALL_STATUS="passed"
if [[ "${COVERAGE_STATUS}" -ne 0 \
   || "${SONAR_STATUS}" -ne 0 \
   || "${QUALITY_GATE}" != "PASSED" ]]; then
  OVERALL_STATUS="failed"
fi

cat > "${QA_RESULTS_FILE}" <<EOF
# QA Results

Generated timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Project: sbm-manager
Overall status: ${OVERALL_STATUS}

## Tests and coverage

Test exit code: ${COVERAGE_STATUS}
Collected tests: ${TESTS_TOTAL}
Passed tests: ${TESTS_PASSED}
Failed tests: ${TESTS_FAILED}
Coverage result: ${COVERAGE_RESULT}
Coverage artifact: sbm-manager/coverage/lcov.info

## SonarQube

SonarScanner exit code: ${SONAR_STATUS}
Scanner execution result: ${SCANNER_RESULT}
Server-side Quality Gate result: ${QUALITY_GATE}

## Evidence

QA execution command: ./scripts/qa-check.sh
Runtime: Docker
EOF

echo
echo "Evidencia QA generada en: ${QA_RESULTS_FILE}"

[[ "${COVERAGE_STATUS}" -eq 0 ]] || exit "${COVERAGE_STATUS}"
[[ "${SONAR_STATUS}" -eq 0 ]] || exit "${SONAR_STATUS}"
[[ "${QUALITY_GATE}" == "PASSED" ]] || exit 1

echo "QA frontend completado correctamente."