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

echo "🔍 Checking Phase 6 UX Mode guardrails..."

EXCLUDES=(
  --glob '!docs/**'
  --glob '!node_modules/**'
  --glob '!scripts/ci/**'
  --glob '!tests/**'
  --glob '!**/*.md'
)

CONFIRM_MODAL_PATH="workspace/WorkspaceRoot/DispatcherProvider/UI/UXConfirmModal.jsx"
CONFIRM_LOGIC_PATH="runtime/dispatcher/ux/shouldConfirmUXAction.js"

UNAUTHORIZED_CONFIRM_CALLS=$(rg -n "requestUXConfirmation" "${EXCLUDES[@]}" \
  --glob '!runtime/dispatcher/dispatch.js' \
  --glob '!runtime/dispatcher/ux/uxConfirmBus.js' || true)
if [ -n "$UNAUTHORIZED_CONFIRM_CALLS" ]; then
  echo "❌ Guardrail violation: requestUXConfirmation used outside dispatcher"
  echo "$UNAUTHORIZED_CONFIRM_CALLS"
  exit 1
fi

if [ ! -f "$CONFIRM_LOGIC_PATH" ]; then
  echo "❌ Guardrail violation: missing confirm gate logic"
  exit 1
fi

PROFILE_GATE=$(rg -n "profile\\s*===\\s*'ux-validation'" "$CONFIRM_LOGIC_PATH" "${EXCLUDES[@]}" || true)
INTENT_GATE=$(rg -n "intent\\s*===\\s*UXIntent\\.HARD_UNSAFE" "$CONFIRM_LOGIC_PATH" "${EXCLUDES[@]}" || true)
TIER_GATE=$(rg -n "uxEnforcementTier\\s*===\\s*UXEnforcementTier\\.CONFIRM" "$CONFIRM_LOGIC_PATH" "${EXCLUDES[@]}" || true)

if [ -z "$PROFILE_GATE" ] || [ -z "$INTENT_GATE" ] || [ -z "$TIER_GATE" ]; then
  echo "❌ Guardrail violation: confirm gate missing triple-check"
  exit 1
fi

if [ -f "$CONFIRM_MODAL_PATH" ]; then
  COPY_CHECK=$(rg -n "Confirm Structural Change|This action performs a structural change while in UX Validation Mode\\." \
    "$CONFIRM_MODAL_PATH" "${EXCLUDES[@]}" || true)
  if [ -z "$COPY_CHECK" ]; then
    echo "❌ Guardrail violation: confirm modal copy missing or altered"
    exit 1
  fi
fi

PERSISTENCE_MATCHES=$(rg -n "\\b(localStorage|sessionStorage|indexedDB)\\b" \
  runtime/dispatcher/ux "$CONFIRM_MODAL_PATH" "${EXCLUDES[@]}" || true)
if [ -n "$PERSISTENCE_MATCHES" ]; then
  echo "❌ Guardrail violation: confirmation memory persists beyond session"
  echo "$PERSISTENCE_MATCHES"
  exit 1
fi

TIMER_MATCHES=$(rg -n "\\b(setTimeout|setInterval)\\b" \
  runtime/dispatcher/ux "$CONFIRM_MODAL_PATH" "${EXCLUDES[@]}" || true)
if [ -n "$TIMER_MATCHES" ]; then
  echo "❌ Guardrail violation: confirmation uses timers"
  echo "$TIMER_MATCHES"
  exit 1
fi

echo "✅ Phase 6 UX Mode guardrails passed"
