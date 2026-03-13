# AI

AI in Dropple is runtime-assisted, not truth-authoritative.

Canonical law:

- AI may emit intents and generation requests
- dispatcher/reducers own canonical truth mutation
- AI request lifecycle lives in runtime state only
- generated artifacts are outputs, not implicit document mutations

Primary modules:

- `ai/runtime/aiRuntime.js`
- `ai/runtime/aiSelectors.js`
- `ai/generation/generateTemplateArtifact.ts`
- `ai/generation/generateVariants.ts`
