# [Phase 2] PR — Transition UI (Between States)

## Linked Issue
Closes #____

> ⚠️ This PR must not introduce Interactions or Timelines.

---

## Scope Declaration (Required)

- [ ] UI only for **State-to-State transitions**
- [ ] No interaction triggers
- [ ] No timeline UI
- [ ] No animation curves or keyframes

---

## UI Surface Affected

- [ ] Transition list (between states)
- [ ] Transition creation affordance
- [ ] Duration control
- [ ] Easing preset selector
- [ ] Property selection UI

---

## Architecture Mapping

| UX Element | Architecture Section |
|-----------|----------------------|
| Transition definition | §5 |
| Preview behavior | §7 |
| Export expectation | §9 |

- [ ] All UI behavior maps to architecture.md
- [ ] No implicit behavior added

---

## Screenshots / Video (Required)

Show:
- Transition creation between states
- Editing transition properties
- Behavior when no transition exists

---

## Forbidden (Confirm All)

- [ ] No interaction wiring
- [ ] No timeline metaphors
- [ ] No animation playback controls
- [ ] No auto-generated transitions

---

## Verification Checklist

- [ ] States still function without transitions
- [ ] Preview does not mutate truth
- [ ] Undo/redo unaffected
- [ ] Replay verified

---

## Reviewer Warning

If this UI feels like animation tooling, it must be rejected.
