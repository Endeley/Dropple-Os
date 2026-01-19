#!/usr/bin/env bash

# Rebuild JS runtime validator from TS source
# Source of truth: core/ccm/validate/validateTemplateArtifact.ts
# NOTE: --skipLibCheck avoids unrelated node_modules type errors

npx tsc core/ccm/validate/validateTemplateArtifact.ts \
  --target ES2020 \
  --module ESNext \
  --outDir core/ccm/validate \
  --declaration false \
  --emitDeclarationOnly false \
  --skipLibCheck

echo "CCM validator JS regenerated"
