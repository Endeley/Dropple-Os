# Rules of Dropple OS

These rules are **non-negotiable**.

## Absolute Invariants

- Replay must always work
- Undo must always work
- Merge must be previewable
- Export must be deterministic
- Permissions must be server-enforced

## Forbidden Actions

- Mutating Zustand directly
- Mutating state in components
- Side effects in reducers
- UI-only security
- Silent data fixes

## Authority Chain

Events → Reducers → Dispatcher → Server

Breaking this chain is a hard stop.
