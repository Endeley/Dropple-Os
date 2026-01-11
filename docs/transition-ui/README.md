# Transition UI (UX Mental Model)

Goal: let users add motion without timelines, keyframes, or animation tools, and without breaking Dropple OS laws.

This is a UX model only. No implementation. No UI widgets.

---

## 1) First Principle (Language Shapes Behavior)

Never say:
- Animate this
- Add keyframes
- Edit timeline
- Motion curve

Always say:
- When this changes...
- Transition from → to
- How should it feel?
- Duration / easing

---

## 2) Core Mental Model (User Perspective)

Users think in states, not motion:
- "I have two versions of something."
- "When it changes from one to the other, I want it to feel smooth."

Three nouns anchor the UI:
- State
- Change
- Feel

---

## 3) The Three Pillars

Pillar 1 — States (anchors)
- A transition can only exist between two valid states.
- No free-floating motion.

Pillar 2 — Transition (relationship)
- A transition is attached to a state change, not a node.
- UX phrasing: "When switching from Default → Hover..."

Pillar 3 — Feel (controls)
- Duration (fast/medium/slow or ms)
- Easing (linear, ease in, ease out, ease in out)
- Properties (position, opacity, size, rotation optional)
- No curves, no graphs, no scrubbing.

---

## 4) Core Surface (Conceptual)

Entry point:
- Appears only when a state exists, a component has variants, or a screen link is selected.
- Label: "Add transition..."

Transition editor layout:
Transition
From: Default
To: Hover
Animate: Position, Opacity, Size, Rotation
Duration: 200ms
Easing: Ease Out
[Preview]

No timeline. No keyframes. No curves.

---

## 5) Preview Experience (Always Read-Only)

Preview flow:
- User clicks Preview
- System temporarily switches state
- Interpolates visually
- Returns to original state

Rules:
- No scrubbing
- No persistence
- Preview never changes truth

---

## 6) Boundary vs Animation Mode

Graphic / UIUX:
- No timeline visible
- No keyframes
- Motion feels incidental

Animation Mode:
- Timeline is front and center
- Motion is the content
- Curves and timing matter

Users should feel the boundary without explanation.

---

## 7) Scale Across Modes

Graphic:
- Visual states and storytelling

UI/UX:
- Hover / pressed / open
- Screen navigation and component transitions

Animation:
- Transitions exist, but timeline motion dominates

Transitions are universal. Animation is specialized.

---

## 8) UX Constraints (Never Offer These)

Never offer:
- Add another keyframe
- Edit curve
- Move transition in time
- Overlap transitions

If users request these, they want Animation Mode.

---

## 9) Why This Works (Dropple-Safe)

- Matches Transition Contract 1:1
- Produces deterministic data
- Avoids timeline corruption
- Keeps export trustworthy
- Aligns with Figma mental model
- Preserves replay, merge, and codegen

---

## Final Rule

Transitions answer: "How should change feel?"
Animations answer: "What motion is the content?"

Keep that line clear and Dropple stays pure.

---

# State UX (Mental Model)

States are named snapshots of valid design truth.
They are not keyframes, versions, or timeline data.

---

## 1) First Principle

States are NOT:
- Keyframes
- Versions
- Undo steps
- Timelines
- Modes

States ARE:
- Named configurations
- Comparable snapshots
- Transition anchors
- Exportable truths

Rule: if a state cannot be exported, it should not exist.

---

## 2) Core Model

Every workspace has:
- One active state
- Zero or more named states
- Exactly one default state

Example:
States
• Default
  Hover
  Active
  Open

---

## 3) Where States Live (Conceptual)

Good places:
- Component context
- Selection context
- Page / frame context
- Screen navigation context

Bad places:
- Global toolbar
- Timeline
- Mode switcher

States belong to design intent, not global controls.

---

## 4) Creating a State (Flow)

Entry points:
- Component selected
- Frame / screen selected
- Variant exists

Language:
- "Add state..."

Flow:
- User selects design
- Chooses Add state
- Names it (Hover, Active, Open, Error)
- System clones current state, marks new one inactive
- Switches view to it

Rule: creating a state does not change appearance until edited.

---

## 5) Editing a State

When a state is active:
- All edits apply only to that state
- Nothing else changes

UI signal:
- Subtle "Editing: Hover" indicator
- Never modal

---

## 6) Switching States (Preview vs Truth)

Switching state:
- Preview only
- No events emitted

Editing while in a state:
- Emits events scoped to that state

Viewing ≠ changing.

---

## 7) Understanding Differences

Prefer visual cues:
- Subtle highlights on changed properties
- "Changed in this state" indicators
- Optional "Reset to Default" per property

Avoid:
- Raw diff tables
- JSON views
- Event logs in UI

---

## 8) Deletion Rules

Deleting a state:
- Removes its snapshot
- Removes transitions referencing it

Default:
- Cannot be deleted

---

## 9) State → Transition Relationship

No state = no transition.
No exception.

Flow:
- User has 2+ states
- UI offers Add transition
- Transition editor references from/to states

---

## 10) Mode Scaling

Graphic:
- Visual variants, optional

UI/UX:
- Interaction logic, central

Animation:
- Timeline dominates, states still valid

---

## Final Rule

States define "what is."
Transitions define "how it changes."
Animation defines "motion as content."

---

# State + Transition Discovery

Discovery is contextual, progressive, and earned.

---

## 1) Discovery Philosophy

Never:
- Global "States" button
- Empty state panel
- Timeline-first discovery
- "Add animation" buttons

Always:
- Context-driven appearance
- Only show options when valid
- Reveal power after intent

---

## 2) State Discovery

Rule 1: Only when something meaningful is selected:
- Component
- Frame / screen
- Semantic group

Rule 2: Appear near what they affect:
- Context menu
- Frame header
- Properties panel (only when relevant)

Rule 3: Default state is implicit:
- Not advertised
- Exists silently
- Cannot be deleted

Progression:
- First time: "Add state..." only
- After state exists: state switcher + "Editing: Hover" indicator

---

## 3) Transition Discovery

Rule 1: No transitions unless 2+ states exist.
Rule 2: Show only after a state switch occurs.
Rule 3: Discover between states, not on nodes.

Phrasing:
- "Add transition from Default → Hover"

---

## 4) Where Transitions Appear

Good:
- Between state tabs
- State comparison view
- Contextual side panel after switch

Bad:
- Toolbar
- Timeline
- Node inspector by default

---

## 5) Progressive Disclosure

Stage 1: No states
- No transitions

Stage 2: One state
- "Add state" only

Stage 3: Two states
- State switcher
- "Add transition" after switching

Stage 4: Transition exists
- Summary + Preview
- No advanced controls

---

## 6) Safeguards

Never:
- Auto-create transitions
- Assume intent
- Add motion silently
- Apply transitions globally

Every transition is:
- Explicit
- Named
- Reviewable
- Deletable

---

## Final Rule

States are discovered when identity exists.
Transitions are discovered when change is observed.
