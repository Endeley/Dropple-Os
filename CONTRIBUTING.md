# Contributor Guardrails: Collaboration and Real-Time Editing

Dropple deliberately separates live awareness from live editing.

Before contributing, please read:

- README.md#why-no-real-time-editing-yet
- docs/architecture/why-not-realtime-yet.md

This is a foundational architectural decision, not a temporary limitation.

## What Is Allowed (N2 - Live Awareness)

You may contribute to:

- Presence indicators (who is here)
- Cursor sharing (where users point)
- Intent signaling (move / resize / select)
- Soft locks (visual "busy" states only)
- Read-only awareness UI
- Performance, UX polish, and documentation of the above

These features:

- Must never mutate document state
- Must never block user actions
- Must remain advisory only

## What Is Explicitly Disallowed (Without an N3 Design Proposal)

You must not introduce:

- Shared document mutations
- Real-time syncing of layout or nodes
- Implicit background saves or merges
- Conflict resolution logic
- Shared undo/redo
- Hard locks or enforced blocking
- Server-authoritative editor state

If your change makes editing behavior depend on the network, it is out of scope.

## Awareness Is Not Authority (Non-Negotiable)

- Presence does not grant control
- Intent does not imply ownership
- Soft locks are visual courtesy, not enforcement

All document mutations must remain:

- Local-first
- Deterministic
- Explicitly user-initiated

## Proposing Real-Time Editing (N3)

If you believe real-time editing is necessary:

- Do not open a PR
- Start with a design proposal
- Address conflict resolution rules, undo semantics, failure modes, and opt-in strategy
- Reference docs/phases/N3-realtime-editing.md

No real-time editing code will be accepted without prior architectural approval.

## Why These Guardrails Exist

Real-time editing:

- Increases system complexity dramatically
- Introduces subtle failure modes
- Requires long-term maintenance discipline

Dropple prioritizes correctness, clarity, and trust over novelty.

These guardrails protect the system and future contributors from accidental architectural debt.

## In One Line

If a feature mutates shared document state in real time, it is N3, and N3 is design-only.

## Governance: Labels and Review Gates

Use labels to keep collaboration scope explicit:

- `ux-only` for visual or styling changes only
- `n2-awareness` for presence, cursors, intent, or soft locks
- `n3-design-only` for design proposals only (no code)

If a PR touches awareness logic, also add:

- `requires-arch-review`

If a PR crosses N2 boundaries, mark it:

- `blocked-n3`
- `needs-design-doc`

Any PR labeled `blocked-n3` must not be merged.
