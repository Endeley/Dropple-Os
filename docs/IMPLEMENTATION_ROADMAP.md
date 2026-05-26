# Dropple Implementation Roadmap

Status: Active  
Owner: Product + Runtime

## How Tracking Works

Rule: every implementation commit updates this file.

A slice is `done` only when all are true:

- targeted tests pass
- `npm run preflight` passes
- `npm run test:release:operator-surfaces` passes
- no mixed generated drift in feature commit

## Vision Board

### Now

- `in_progress` Workspace/UI embodiment under constitutional/runtime law
- `in_progress` Golden workflows for `design/uiux`, `media/animation`, `versioning`

### Next

- `todo` Workspace product depth slices (UIUX, animation timeline ergonomics, marketplace install resilience)
- `todo` CI signal clarity and contract-lock coverage expansion

### Later

- `todo` Remaining workspace depth (education/review, conversion/automation)
- `todo` Perf budget tightening on critical deterministic workflows

## Execution Log

### UIUX-SLICE-ALIGN-PARITY

- status: `done`
- commit: `209ccf0`
- summary: added keyboard alignment shortcut parity in UIUX shell
- verification:
- `PLAYWRIGHT_SKIP_BUILD=1 PLAYWRIGHT_PORT=3115 npx playwright test tests/e2e/uiux-template-generation.spec.js --workers=1 -g "uiux authoring roundtrip publishes from the toolbar flow and installs into a fresh workspace"`
- `PLAYWRIGHT_SKIP_BUILD=1 PLAYWRIGHT_PORT=3115 npx playwright test tests/e2e/uiux-template-generation.spec.js --workers=1 -g "uiux transition timeline can author a motion keyframe through lawful intents"`
- `npm run preflight`
- `npm run test:release:operator-surfaces`

### RUNTIME-SLICE-DUPLICATE-INTENT-FIX

- status: `done`
- commit: `ebeed0f`
- summary: pending-move promotion now honors drag-start duplicate intent as authoritative
- verification:
- targeted runtime duplicate tests
- `npm run preflight`
- `npm run test:release:operator-surfaces`

### UI-SLICE-ALT-RELEASE-CONTRACT

- status: `done`
- commit: `79cf076`
- summary: e2e contract updated to require duplication when alt released before threshold if drag-start intent requested duplicate
- verification:
- targeted workspace interactions e2e
- `npm run preflight`
- `npm run test:release:operator-surfaces`

### RUNTIME-SLICE-DUPLICATE-INTENT-CONTRACT

- status: `done`
- commit: `8721f8f`
- summary: dedicated runtime contract test for duplicate intent authority during move promotion
- verification:
- targeted runtime duplicate tests
- `npm run preflight`
- `npm run test:release:operator-surfaces`

### GOVERNANCE-SLICE-CI-CONCURRENCY-GUIDANCE

- status: `done`
- commit: `ccb1cb9`
- summary: locked CI concurrency policy in architecture tests and documented expected cancellation annotations
- verification:
- targeted architecture tests
- `npm run preflight`
- `npm run test:release:operator-surfaces`

### GOVERNANCE-SLICE-GENERATED-DRIFT-CENTRALIZATION

- status: `done`
- commits: `8b77295`, `0bdde94`
- summary: centralized generated drift/clean targets and locked doc alignment with architecture/release tests
- verification:
- targeted architecture + release trust cleanup tests
- `npm run preflight`
- `npm run test:release:operator-surfaces`

## Slice Template (Copy For Next Work)

### <SLICE-ID>

- status: `todo`
- owner: `<name>`
- commit: `<hash>`
- summary: `<one sentence>`
- success commands:
- `<targeted command 1>`
- `<targeted command 2>`
- `npm run preflight`
- `npm run test:release:operator-surfaces`
- notes:
- `<blockers or decisions>`

