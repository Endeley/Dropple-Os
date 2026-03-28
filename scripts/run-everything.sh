#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${ROOT_DIR}/logs"
STAMP="$(date +"%Y%m%d-%H%M%S")"
LOG_FILE="${LOG_DIR}/run-everything-${STAMP}.log"

mkdir -p "${LOG_DIR}"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but was not found in PATH." >&2
  exit 1
fi

cd "${ROOT_DIR}"

exec > >(tee "${LOG_FILE}") 2>&1

echo "Run started: $(date)"
echo "Repo: ${ROOT_DIR}"
echo "Log: ${LOG_FILE}"
echo

run_step() {
  local label="$1"
  shift

  echo "==> ${label}"
  echo "Command: $*"
  "$@"
  echo
}

run_step "Lint" npm run lint
run_step "Dropple Laws" npm run enforce:laws
run_step "Export Gate" npm run lint:export
run_step "Core Tests" npm run test:all
run_step "System Tests" npm run test:system:all
run_step "Determinism" npm run determinism
run_step "Architecture CI" npm run architecture:ci
run_step "Template Verification" npm run template:verify-all

echo "Run completed successfully: $(date)"
