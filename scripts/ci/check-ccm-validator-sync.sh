#!/usr/bin/env bash
set -e

echo "🔄 Regenerating CCM validator JS..."
scripts/build-ccm-validator.sh

if ! git diff --quiet; then
  echo "❌ CCM validator JS is out of sync with TS source"
  echo "Run scripts/build-ccm-validator.sh and commit the result"
  git diff
  exit 1
fi

echo "✅ CCM validator is in sync"
