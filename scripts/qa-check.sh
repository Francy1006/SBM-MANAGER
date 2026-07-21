#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "1/2 Ejecutando pruebas y coverage..."
"${SCRIPT_DIR}/coverage.sh"

echo "2/2 Ejecutando SonarScanner..."
"${SCRIPT_DIR}/sonar-scan.sh"

echo "QA frontend completado correctamente."
