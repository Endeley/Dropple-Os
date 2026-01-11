# Dropple UI Architecture
States, Transitions & Interactions (Authoritative UX Plan)

Status: Locked Design
Scope: UX model only (no UI implementation details)
Audience: Core contributors, UI engineers, product designers
Applies to: Graphic Workspace, UI/UX Workspace, Animation Workspace (contrast)

---

## 1) Purpose of This Document

This document defines the authoritative UX model for:
- States
- Transitions
- Interactions
- Conflict handling
- Export expectations

It exists to ensure that all UI implementation remains:
- Deterministic
- Replay-safe
- Export-safe
- Aligned with Dropple OS laws

If a UI feature contradicts this document, the UI feature is invalid.

---

## 2) Core UX Principles

2.1 Truth Before Motion
- State is truth
- Motion is derived
- Preview is illusion
- Export is consequence

2.2 No Implicit Behavior
- Nothing animates unless explicitly defined
- Nothing changes unless caused by an interaction
- Nothing exports unless it is deterministic

2.3 Progressive Discovery
- UI reveals power only when intent is clear
- No global controls for local concepts
- No empty panels

---

## 3) State Model (UX-Level)

3.1 What a State Is

A State is a named snapshot of valid design truth.

States are:
- Explicit
- Named
- Exportable
- Deterministic

States are not:
- Keyframes
- Versions
- Undo steps
- Animations

3.2 Default State
- Every scope has exactly one Default state
- Default is implicit
- Default cannot be deleted
- Default is the baseline for export

---

## 4) State Scope (Critical Distinction)

4.1 Component States (Local Scope)

Belong to reusable components.

Examples:
- Button: Default / Hover / Pressed
- Card: Collapsed / Expanded

Characteristics:
- Scoped
- Reusable
- Exportable as component logic

4.2 Page States (Global Scope)

Belong to pages, screens, or flows.

Examples:
- Page A / Page B
- Modal Open / Closed

Characteristics:
- Contextual
- Non-reusable
- Exportable as navigation or app state

4.3 Scope Rules
- A state belongs to exactly one scope
- Component states and Page states never merge
- Transitions never cross scope directly

---

## 5) State Discovery (When UI Appears)

5.1 When "Add State" Is Shown
- "Add State" appears only when:
  - A component is selected (component state)
  - A page/frame is selected (page state)
- It never appears globally.

5.2 State Switching
- Switching states is preview-only
- No events are emitted when viewing a state
- Editing while in a state commits changes to that state only

---

## 6) Transition Model (UX-Level)

6.1 What a Transition Is

A Transition describes how change feels between two states.

Transitions:
- Connect State A → State B
- Define duration and easing
- Apply to selected properties
- Are optional

Transitions are not animations.

6.2 Transition Discovery

"Add Transition" appears only when:
- At least two states exist
- The user has switched between states
- A meaningful comparison is happening

6.3 Transition Controls (Bounded)

Users can define:
- Duration
- Easing
- Properties to interpolate

Users cannot define:
- Keyframes
- Curves
- Timelines
- Ordering

---

## 7) Interaction Model (How State Changes Happen)

7.1 What an Interaction Is

An Interaction is a cause that triggers a state change.

Examples:
- On Click
- On Hover
- On Focus

Interactions never define motion.

7.2 Interaction Flow (UX)
- User selects an interactive element
- Chooses a trigger (e.g. On Click)
- Chooses a target state
- Transition (if present) is applied automatically

7.3 Interaction Scope Rules
- Component interactions → Component states
- Component interactions → Page states (navigation)
- Page interactions → Page states

Illegal combinations are never shown in UI.

---

## 8) Preview Rules (Non-Negotiable)

- Preview never mutates state
- Preview never emits events
- Preview always reverts
- Preview is clearly labeled
- Preview exists to understand experience, not to define truth

---

## 9) Conflict UX (When States Diverge)

9.1 What a Conflict Is

A conflict occurs when:
- The same state
- In the same scope
- Has diverging truths

Conflicts are not errors.

9.2 Conflict Discovery

Conflicts appear only:
- During merge preview
- When switching branches
- When opening divergent documents

9.3 Conflict Resolution

Conflicts are resolved at the smallest unit possible:
- Property
- State
- Transition
- Component
- Page

Users preview outcomes before committing.

---

## 10) Export Mental Model

10.1 Designer Promise

If it works in Dropple, it will work in code.

Export is:
- Deterministic
- Derived from state
- Previewable via diff
- Never magical

10.2 Mental Mapping
- Components → Components
- States → Props / Conditions
- Interactions → Handlers
- Transitions → Code transitions
- Page states → Routes / App state

Designers do not need to read code to trust export.

---

## 11) Relationship to Animation Mode

- Transitions exist in all modes
- Animation Mode is where motion becomes content
- Timeline authoring exists only in Animation Mode
- UI must never blur this boundary

---

## 12) Implementation Guardrails

Before implementing any UI feature, ask:
- Does this mutate state?
- Does it emit an event?
- Is it preview-only?
- Is it exportable?
- Does it respect scope?

If unsure, stop.

---

## 13) Final UX Law

States define truth.
Interactions cause change.
Transitions shape feeling.
Animation tells stories.
Export reflects reality.

This document is binding.
