# ESLint Guardrails

This document defines architecture enforcement by static analysis.

Constitutional precedence:

- `docs/LAW.md`

## Active Guardrail

- `dropple-architecture/no-ui-truth-dispatch`

Rule source:

- `tools/eslint/dropple-architecture.js`
- `eslint.config.mjs`

## What It Enforces

Inside `ui/**`:

- no dispatcher imports/usage
- no `useDispatcher()` usage
- no `.dispatch(...)` truth mutation
- no UI `NODE_CREATE` truth emit

## Authority Allowlist

The following translator boundaries are exempt:

- `ui/interaction/*Resolver.js`
- `ui/interaction/sessionBinding.js`
- `ui/interaction/dispatcher.js`
- `ui/timeline/*Bridge.js`
- `ui/timeline/editEventBridge.js`
- `ui/bridges/**`

## Architectural Test

- `tests/architecture/dispatcherOwnership.test.ts`

This test ensures only one JSX `<DispatcherProvider` instance exists and that it lives in:

- `workspace/WorkspaceRoot/WorkspaceRoot.jsx`

## Related

- `docs/UI-AUTHORITY.md`
- `docs/DECISIONS/001-single-dispatcher.md`
