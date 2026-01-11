# [Phase 1] PR — UI (States Only)

## Linked Issue
Closes #____

> ⚠️ UI PRs must strictly follow Phase 1 scope.

---

## Scope Declaration (Required)

- [ ] This PR is **States-only**
- [ ] No transitions added
- [ ] No interactions added
- [ ] No timeline UI added
- [ ] No animation logic added

---

## UI Surface Affected

- [ ] State Panel
- [ ] Default State Display
- [ ] State List
- [ ] State Switching (preview-only)
- [ ] Other (must explain below)

---

## Architecture Mapping

| UX Concept | Architecture Section |
|-----------|----------------------|
| State Model | §2 |
| State Scope | §3 |
| Discovery | §4 |
| Preview | §7 |

- [ ] Every UI behavior maps to `architecture.md`
- [ ] No implicit behavior introduced

---

## Screenshots / Video (Required for UI)

> Show:
> - Default state
> - State switching
> - Editing within a state (if applicable)

---

## What This PR Explicitly Does NOT Do

- [ ] No transitions
- [ ] No interaction wiring
- [ ] No hover / click logic
- [ ] No animation previews

---

## Verification Checklist

- [ ] Switching states emits no events
- [ ] Editing commits to active state only
- [ ] Undo/redo works correctly
- [ ] Replay verified

---

## Reviewer Warning

If this UI feels exciting, it is probably incorrect.
