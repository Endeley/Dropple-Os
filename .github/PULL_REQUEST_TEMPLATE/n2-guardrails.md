# Pull Request Checklist — Collaboration and Awareness (N2 Guardrails)

This checklist is mandatory for any PR touching presence, cursors, intent, collaboration UI, or editor runtime behavior.

Before requesting review, confirm all applicable items.

## 1. Scope Declaration (Required)

- [ ] This PR does not touch collaboration or awareness code (skip N2 sections below)
- [ ] This PR touches N2 live awareness code (presence, cursors, intent, soft locks)

If you checked the second option, all sections below must pass.

## 2. N2 vs N3 Boundary Confirmation (Critical)

- [ ] No shared document mutations were added
- [ ] No editor behavior depends on server acknowledgement
- [ ] No background syncing or implicit merging introduced
- [ ] No shared undo/redo logic added
- [ ] No hard locks or enforced blocking introduced

Failing any item above blocks this PR.

## 3. Awareness Is Advisory Only (Non-Negotiable)

- [ ] Presence updates do not mutate document state
- [ ] Cursor data does not affect hit-testing or selection
- [ ] Intent signals do not reserve or lock nodes
- [ ] Soft locks are visual only (no pointer disabling)
- [ ] Awareness failure degrades silently (no errors surfaced)

## 4. Permission and Role Safety

- [ ] Viewers do not emit presence, cursors, or intent
- [ ] Editors/owners emit awareness only
- [ ] Server mutations re-check role permissions
- [ ] No client-side role assumptions without server enforcement

## 5. Performance Discipline

- [ ] Presence heartbeat frequency is unchanged or justified
- [ ] Cursor updates are throttled
- [ ] No hot loops or per-frame mutations added
- [ ] No awareness layer causes canvas re-layout

If timings were changed, explain why and how it was profiled.

## 6. UX Integrity (Phase 6 Compliance)

- [ ] Awareness UI does not obscure primary interaction
- [ ] No modal dialogs or blocking warnings added
- [ ] Visuals are subtle and non-authoritative
- [ ] Failure looks like absence, not error

## 7. Documentation and Invariants

- [ ] Inline comments reinforce N2 boundaries
- [ ] Code references the real-time editing doc where relevant
- [ ] No TODOs implying "we will just sync this later"

## 8. Reviewer Confirmation (Required)

Reviewer must explicitly confirm:

- [ ] This PR stays entirely within N2 (live awareness)
- [ ] No N3 (real-time editing) behavior is implied or enabled
- [ ] The architecture remains local-first and deterministic

If not confirmed, request changes.

## Automatic Block Conditions

This PR must not be merged if it introduces:

- Shared document state mutation
- Server-authoritative editor state
- Conflict resolution logic
- Shared undo semantics
- Hard locks or enforced exclusivity

These require an N3 design proposal, not a PR.

## In One Line (Reviewer Rule)

If a change mutates shared document state in real time, it is N3 — and N3 is design-only.

Optional (Recommended):

- docs/architecture/why-not-realtime-yet.md
- docs/phases/N2-live-awareness.md
