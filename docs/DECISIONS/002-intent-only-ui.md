# 002 - Intent-Only UI

Status: Accepted

## Decision

UI never dispatches truth. UI emits intent only.

Legal flow:

`UI -> intent.* -> resolver/bridge -> dispatcher.dispatch(...) -> reducers`

## Why

- Keeps authority explicit
- Prevents silent mutations from UI code paths
- Makes AI and user interactions auditable/replayable

## Enforcement

- ESLint rule: `dropple-architecture/no-ui-truth-dispatch`
- Authority allowlist limited to resolvers/bridges/session binding

## References

- `docs/LAW.md`
- `docs/UI-AUTHORITY.md`
- `docs/ESLINT-GUARDRAILS.md`
