#!/usr/bin/env bash
set -e

# Ensure ripgrep is available
if ! command -v rg >/dev/null 2>&1; then
  echo "❌ ripgrep (rg) is required but not installed."
  echo "Install it with:"
  echo "  macOS: brew install ripgrep"
  echo "  Ubuntu: sudo apt install ripgrep"
  exit 1
fi

echo "🔍 Checking Phase 5 UX Mode guardrails..."

EXCLUDES=(
  --glob '!docs/**'
  --glob '!node_modules/**'
  --glob '!tests/**'
  --glob '!**/*.md'
)

TARGETS=(
  runtime/dispatcher
  workspace/WorkspaceRoot/DispatcherProvider
  ui
)

function fail_if_matches() {
  local pattern="$1"
  local label="$2"
  local matches
  matches=$(rg -n "$pattern" "${TARGETS[@]}" "${EXCLUDES[@]}" || true)
  if [ -n "$matches" ]; then
    echo "❌ Guardrail violation: $label"
    echo "$matches"
    exit 1
  fi
}

fail_if_matches "\\bconfirm\\s*\\(" "confirm() usage in Phase 5 paths"
fail_if_matches "\\b(block|deny|prevent)\\b" "enforcement keywords in Phase 5 paths"
DISPATCH_CONDITIONAL_RETURN=$(rg -n "if\\s*\\([^\\)]*(profile|intent)[^\\)]*\\)\\s*return" runtime/dispatcher/dispatch.js "${EXCLUDES[@]}" || true)
if [ -n "$DISPATCH_CONDITIONAL_RETURN" ]; then
  echo "❌ Guardrail violation: conditional return based on profile/intent in dispatcher"
  echo "$DISPATCH_CONDITIONAL_RETURN"
  exit 1
fi

if [ -d runtime/dispatcher/ux ]; then
  AWARENESS_MATCHES=$(rg -n "\\bthrow\\b" runtime/dispatcher/ux "${EXCLUDES[@]}" || true)
  if [ -n "$AWARENESS_MATCHES" ]; then
    echo "❌ Guardrail violation: throw in dispatcher awareness paths"
    echo "$AWARENESS_MATCHES"
    exit 1
  fi
fi

WARN_PATHS=(workspace/WorkspaceRoot/DispatcherProvider ui)
WARN_MODAL_MATCHES=$(rg -n "\\b(Modal|Dialog)\\b" "${WARN_PATHS[@]}" "${EXCLUDES[@]}" || true)
if [ -n "$WARN_MODAL_MATCHES" ]; then
  echo "❌ Guardrail violation: modal/dialog usage in UX warning paths"
  echo "$WARN_MODAL_MATCHES"
  exit 1
fi

echo "✅ Phase 5 UX Mode guardrails passed"
