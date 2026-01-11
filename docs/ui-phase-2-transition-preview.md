Phase 2 — Issue #3
Transition Preview (Read-Only Illusion)

Phase: 2 (Locked)
Scope: Preview UX + behavioral rules
Explicitly excluded: state mutation, events, timeline, interactions

---

1) Purpose (Non-Negotiable)

Transition Preview exists to answer one question only:
"If I move from State A to State B, how will it feel?"

It does not:
- make state changes real
- emit events
- affect undo/redo
- persist anything
- imply triggers or timing

Preview is illusion. State is truth.

---

2) Hard Rule (Absolute)

Preview must be completely disposable.

If preview leaks into:
- runtime state
- document state
- history
- persistence

...the system is corrupted.

A reload must erase preview completely.

---

3) Preconditions (When Preview Exists)

Preview is available only if all are true:
- Source state exists
- Target state exists
- A transition exists between them
- User is editing (not viewer)
- Workspace allows transitions

If any condition fails:
- No preview affordance
- No disabled buttons
- UI is silent

---

4) Where Preview Is Triggered (UX Placement)

Preview is not global.
It is scoped to state switching.

Allowed preview triggers:
- Clicking another state in the State Manager
- Switching state via dropdown

Forbidden preview triggers:
- Hover
- Timeline scrubbing
- Play buttons
- "Preview transition" buttons

Rule: Preview happens only when the user would change state.

---

5) Preview Behavior (Strict Sequence)

Step 1 — User Initiates State Switch
User selects target state.

Step 2 — Preview Layer Activates
System checks:
- Is there a transition from current → target?
  - Yes → preview applies
  - No → instant state switch (no animation)

Step 3 — Interpolation Happens (Illusion Only)
Interpolation uses:
- transition properties
- duration
- easing

Uses preview-only render state.
Does not touch document state.

Step 4 — Preview Ends
After duration:
- Preview layer is discarded
- Runtime state is set to target state
- No events were emitted
- No history entries created

---

6) Cancellation & Interruptions

A) User switches states mid-preview
- Current preview is cancelled
- New preview starts (if transition exists)
- No partial states persist

B) User cancels action (Esc / Undo)
- Preview immediately discarded
- State reverts to last committed state
- Undo stack unchanged

---

7) Undo / Redo Contract (Very Important)

- Preview must not appear in undo history
- Undo reverts last committed state only
- Redo does not replay preview

If undo "replays" animation, preview is leaking.

---

8) Failure & Edge UX

Missing or invalid transition:
- State switches instantly
- No warning
- No fallback animation

Invalid transition data:
- Preview is skipped
- Transition is flagged "Invalid" in UI
- No auto-fix

---

9) Component vs Page Preview

Component States:
- Preview scoped to component canvas
- Parent layout unaffected
- No page reflow animation

Page States:
- Preview scoped to page canvas
- No routing
- No URL changes

---

10) Forbidden Concepts (Phase Guardrails)

- Timeline scrubbing
- Playback controls
- Animation curves
- Keyframes
- Interaction triggers
- Looping
- Delays

If preview feels like an animation tool, it’s wrong.

---

11) Designer Mental Model (Critical)

Designers should understand preview as:
"A temporary visual interpolation that disappears as soon as it finishes."

If they ask:
"Why didn’t it save the animation?"

Correct answer:
"Because preview never saves anything."

---

12) Acceptance Criteria

This issue is complete when:
- Preview never mutates state
- Reload removes all preview effects
- Undo/redo unaffected
- Preview only happens on state switch
- Removing preview code does not affect behavior

---

13) Relationship to Other Phases

Phase | Responsibility
Phase 1 | Defines what states exist
Phase 2 | Defines how change feels
Phase 3 | Defines when change happens
Phase 4 | Defines expressive motion

Preview belongs only to Phase 2.

---

Definition of Done — Phase 2 Issue #3

- Preview UX specified
- Behavioral guarantees written
- No code written yet
- No state mutation paths introduced
