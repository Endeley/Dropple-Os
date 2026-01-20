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

echo "🔍 Checking for illegal event IDs in event intents..."

# Match object literals that contain BOTH `type:` and `id:`
# This targets event-shaped objects, not arbitrary IDs.
MATCHES=$(rg -n \
  "\{[^}]*type\s*:\s*['\"][^'\"]+['\"][^}]*id\s*:" \
  --glob '!runtime/dispatcher/**' \
  --glob '!tests/**' \
  --glob '!core/ccm/**' \
  || true)

if [ -n "$MATCHES" ]; then
  echo "❌ Illegal event ID(s) found in event intents:"
  echo "$MATCHES"
  echo
  echo "Event IDs must be assigned by the dispatcher only."
  exit 1
fi

echo "✅ No illegal event IDs found in event intents"
