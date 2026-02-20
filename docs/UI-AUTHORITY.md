# UI Authority Model

This document enforces the Dropple OS Law. In case of conflict, the Law wins.

See:

- `docs/LAW.md`
- `docs/ARCHITECTURE.md`

## Core Rule

UI must never dispatch truth. UI may emit intent only.

Legal mutation flow:

`UI -> intent.* -> resolver/bridge -> dispatcher.dispatch(domainEvent) -> reducers -> runtime`

## UI Layer Boundaries

UI may:

- render state
- capture input
- emit `intent.*`

UI may not:

- import dispatcher authority
- call `.dispatch(...)`
- emit reducer/domain truth directly

## Authority Translators (allowed to dispatch truth)

- `ui/interaction/*Resolver.js`
- `ui/interaction/sessionBinding.js`
- `ui/interaction/bridges/**`
- `ui/timeline/*Bridge.js`
- `ui/timeline/editEventBridge.js`
- `ui/bridges/**`

## Related Enforcement

- `docs/ESLINT-GUARDRAILS.md`
- `docs/DECISIONS/002-intent-only-ui.md`
