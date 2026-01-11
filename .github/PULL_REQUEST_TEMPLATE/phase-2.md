# [Phase 2] PR — Transition Model (Declarative)

## Linked Issue
Closes #____

> ⚠️ Phase 2 PRs without a linked Phase 2 issue will be closed.

---

## Scope Declaration (Required)

- [ ] This PR implements **exactly one Phase 2 issue**
- [ ] Transitions are **State → State only**
- [ ] No interactions added
- [ ] No timeline UI added
- [ ] No keyframes or animation authoring added

---

## Architecture Alignment

- [ ] Reviewed `docs/architecture.md` §5 (Transition Model)
- [ ] Reviewed `docs/ui-phase-2-transitions.md` (if present)
- [ ] Transitions remain declarative and optional
- [ ] Replay remains deterministic

---

## What This PR Changes

Describe the **minimum necessary change**:

- Transition schema / model changes:
- Reducer or runtime changes (if any):
- Validation or guards added:

---

## What This PR Explicitly Does NOT Do

- [ ] No trigger logic (click / hover / focus)
- [ ] No timeline or keyframe concepts
- [ ] No preview mutation
- [ ] No animation presets

---

## Verification Checklist

- [ ] Replay from scratch verified
- [ ] Undo/redo verified
- [ ] State behavior unchanged without transitions
- [ ] No dispatcher bypass

---

## Reviewer Warning

If this PR feels expressive or powerful, it is probably violating Phase 2.
