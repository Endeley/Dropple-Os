#!/usr/bin/env bash
set -e

echo "🔍 Checking for duplicate message buses..."

BUS_COUNT=$(rg "new MessageBus" ui | wc -l)

if [ "$BUS_COUNT" -gt 1 ]; then
  echo "❌ Multiple message bus implementations detected"
  exit 1
fi

echo "✅ Single canonical message bus confirmed"
