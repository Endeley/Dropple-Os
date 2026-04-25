# AI

AI in Dropple is runtime-assisted, not truth-authoritative.

Canonical law:

- AI may emit intents and generation requests
- dispatcher/reducers own canonical truth mutation
- AI request lifecycle lives in runtime state only
- generated artifacts are outputs, not implicit document mutations
- AI runtime may dispatch only `AI_REQUEST_ENQUEUE`, `AI_REQUEST_COMPLETE`, and `AI_REQUEST_FAIL`

Primary modules:

- `ai/runtime/aiRuntime.js`
- `ai/runtime/aiSelectors.js`
- `ai/generation/generateTemplateArtifact.ts`
- `ai/generation/generateVariants.ts`
