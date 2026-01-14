Phase 1 UI Plan — States Only
(No Transitions, No Interactions, No Motion)

Status: Approved scope
Goal: Make states visible, editable, and trustworthy
Non-Goal: Experience, motion, logic, or behavior wiring

---

1) Phase Objective

Phase 1 introduces States as first-class UX entities.

At the end of this phase:
- Designers can define state identities
- Designers can switch between states
- Designers can edit state-specific truth
- Replay, undo, and export remain correct
- Nothing else

---

2) Explicitly Out of Scope (Hard Stop)

Phase 1 must NOT include:
- Transitions
- Interactions
- Timeline UI
- Preview buttons
- Hover / click logic
- Animation
- Auto-generated behavior
- Export previews

If any of these appear, the phase has failed.

---

3) Supported Scopes (Only These)

Phase 1 supports exactly two scopes:
- Component States
- Page States

No other state types exist.

---

4) UI Surfaces Introduced

4.1 State Panel (New)

A State Panel is introduced in the inspector area.

It is:
- Contextual
- Scoped
- Read-only until a valid target is selected

4.2 Selection Dependency

The State Panel shows:

Selection | Panel Behavior
Nothing selected | Panel hidden
Component selected | Component states
Page/frame selected | Page states
Multiple selection | Panel hidden

No ambiguity allowed.

---

5) Default State UX

Rules:
- Every scope shows a Default state
- Default is visually distinct
- Default cannot be renamed or deleted
- Default is always first in the list

This teaches baseline thinking immediately.

---

6) Defining States (Minimal UX)

Allowed Actions:
- Define a new state identity
- Name the state
- Remove non-default state identities

UX Flow:
- User selects a valid scope
- State Panel appears
- User clicks "Add State"
- State identity is added (empty diff from Default)

No templates.
No suggestions.
No auto-naming beyond placeholders.

---

7) Switching States (Preview-Only)

Rules:
- Switching states does NOT emit events
- Switching states does NOT affect undo history
- Switching states updates the canvas view only

Visual cue:
"Viewing state: Hover"

---

8) Editing While in a State (Truth Commit)

When a user edits while a non-Default state is active:
- Changes are committed as events
- Events are scoped to that state
- Undo/redo applies correctly within that state
- Replay rebuilds state correctly

The UI must clearly indicate:
"Edits apply to this state"

---

9) State Deletion UX

Rules:
- Default state cannot be deleted
- Deleting a state:
  - Removes its state-specific diffs
  - Does not affect Default state
- Confirmation required
- No cascade effects

---

10) Visual Differentiation (Subtle, Not Fancy)

Allowed visual cues:
- Highlighted state label
- Small badge: "Viewing"
- Muted canvas overlay (optional)

Not allowed:
- Animations
- Transitions
- Motion blur
- Timeline indicators

---

11) Undo / Redo Expectations

Undo/redo:
- Operates within the active state
- Never crosses state boundaries
- Never reorders states
- Switching states does not affect undo stack

---

12) Persistence Expectations

States are saved as part of document state.

- Reload restores last active state
- Snapshot load restores states accurately
- No silent migrations

---

13) Phase Completion Checklist

Phase 1 is complete only when:
- [ ] States are visible and scoped
- [ ] Default state is enforced
- [ ] State switching is preview-only
- [ ] Editing commits state-scoped events
- [ ] Undo/redo works correctly
- [ ] Replay from scratch reconstructs states
- [ ] No transitions exist in UI
- [ ] No interactions exist in UI
- [ ] No timeline UI exists

---

14) What Phase 1 Enables (Quietly)

Once this is stable:
- Transitions become obvious
- Interactions feel natural
- Export mapping is intuitive
- Animation mode stays clean

Phase 1 is the foundation — not a feature.

---

15) Exit Criteria (Hard Gate)

Do not move to Phase 2 unless:
- You are bored using the UI
- Nothing feels magical
- Everything feels predictable

That boredom is correctness.

---

16) Next Phase (Preview Only)

Phase 2: Transitions UI (Declarative, No Timeline)
Only after Phase 1 passes all checks.

---

Final Phase Law

If states are not boring, they are wrong.
