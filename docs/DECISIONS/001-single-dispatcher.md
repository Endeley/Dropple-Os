# 001 - Single Dispatcher Ownership

Status: Accepted

## Decision

There is exactly one dispatcher authority per workspace lifecycle.

Owner:

- `workspace/WorkspaceRoot/WorkspaceRoot.jsx`

No other subtree may instantiate `DispatcherProvider`.

## Why

- Prevent split-brain state
- Preserve undo/redo determinism
- Preserve replay/animation correctness

## Enforcement

- ESLint guardrail in `tools/eslint/dropple-architecture.js`
- Test: `tests/architecture/dispatcherOwnership.test.ts`

## References

- `docs/LAW.md`
- `docs/UI-AUTHORITY.md`
