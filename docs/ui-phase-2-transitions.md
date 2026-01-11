Phase 2 — Issue #2
Transition UI (Between States) — UX Specification Only

Phase: 2 (Locked)
Scope: UX model + information architecture
Explicitly excluded: preview, triggers, animation, timeline

---

1) Purpose

Provide a clear, boring, predictable UI that lets users declare transitions between existing states.

This UI answers only:
"When moving from State A to State B, how should changes feel?"

It does not answer:
- why the change happens
- when it happens
- how it’s triggered
- how it animates internally

---

2) Preconditions (Hard Gates)

The Transition UI does not exist unless:
- At least two states exist in the same scope
- User has edit permission
- Workspace allows transitions (Graphic, UI/UX)

If these are not met:
- The UI is completely hidden
- No disabled controls
- No upsells
- No empty panels

Rule: No transitions without states.

---

3) Where the UI Lives (Information Architecture)

Primary Location:
State Manager Panel (existing or Phase-1-created)

Transitions are not global and not a top-level tool.
They are secondary metadata attached to states.

Visual Hierarchy:
States
├── Default
├── Hover
│   └── Transitions
│       ├── → Default
│       └── → Pressed
├── Pressed

Key points:
- Transitions are nested
- They are directional
- They are discoverable, not dominant

---

4) Transition Discovery (When Options Appear)

A. No States Selected
- No transition UI visible

B. One State Selected
- No transition UI visible

C. Two States Exist
- Each state shows a "Transitions" disclosure
- Empty by default

D. User clicks "Add transition"
- User must choose target state
- No auto-suggestions
- No inferred behavior

---

5) Transition Creation Flow (Declarative)

Step 1 — Choose Direction
From: [State A]
To:   [State B ▼]

Rules:
- No self-transitions
- No cross-scope transitions
- Direction is explicit

Step 2 — Choose Properties

Multi-select list of allowed properties only:
- [ ] Position (x, y)
- [ ] Opacity
- [ ] Size (width, height)
- [ ] Scale
- [ ] Rotation

Rules:
- No "all properties"
- No implicit inference
- Explicit beats smart

Step 3 — Timing Metadata
Duration: [ 200 ms ]
Easing:   [ ease-out ▼ ]

Rules:
- Presets only
- No curves
- No delays
- No sequencing

Step 4 — Save

Transition is stored.
No preview plays.
No state changes occur.

Rule: Saving a transition must not visually change anything.

---

6) Transition Editing

Editing a transition reopens the same form:
- Change properties
- Change duration
- Change easing
- Change target state

No history of versions.
No keyframes.
No playback.

---

7) Deletion UX

- Transitions can be deleted independently
- Deleting a state deletes its transitions (with confirmation)
- No soft-delete
- No orphan transitions

---

8) Component vs Page States (Critical Distinction)

Component States
- Transitions apply within a component
- Stored under transitions.component[componentId]
- UI scoped to component editor

Page States
- Transitions apply between pages
- Stored under transitions.page
- UI scoped to page/state manager

The UI must never allow mixing these.

---

9) Conflict UX (No Resolution Yet)

If:
- A transition references a missing state
- Or merge introduces conflicting transitions

UX behavior:
- Transition is marked "Invalid"
- User must resolve manually
- No auto-fix
- No silent discard

Rule: Conflicts are visible, never corrected silently.

---

10) Explicit Non-Goals (Must Not Appear)

- Timeline scrubber
- Play / preview buttons
- Interaction triggers
- Hover / click / focus logic
- Motion paths
- "Smart" transitions
- Auto-generated defaults

If any of these appear, Phase 2 is violated.

---

11) Mental Model for Designers (Important)

Designers should understand transitions as:
"CSS-like metadata that describes how state changes feel,
not why or when they happen."

If a designer asks:
"Why didn’t it animate?"

The correct answer is:
"You haven’t defined when the state changes yet."

That’s Phase 3.

---

12) Acceptance Criteria (UX-Only)

This issue is complete when:
- Transitions are discoverable only when valid
- Creation flow is explicit and predictable
- UI does not preview or animate
- No state change occurs when editing transitions
- Removing transitions changes nothing else

---

13) What This Unlocks (Later)

Once this UX exists:
- Preview can be layered safely (Phase 2.5)
- Export mapping is straightforward
- Interactions can reference transitions (Phase 3)

But none of that is implemented here.

---

Definition of Done — Phase 2 Issue #2

- UX spec complete
- No code written (yet)
- No preview logic
- No animation logic
- No interaction logic
