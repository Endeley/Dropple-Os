# Dropple OS Architecture

> State is a consequence, not a source of truth. Events are the only source of truth.

## High-Level Flow

```
UI
↓
MessageBus
↓
Dispatcher (single mutation gate)
↓
Reducers (pure)
↓
Runtime State
↓
Zustand (render mirror)
```

No layer may bypass the Dispatcher.

## Event Sourcing

```
initialState
→ apply event 1
→ apply event 2
→ apply event 3
→ currentState
```

Replay must always produce the same result.

## Branching & Merge
- Branches are logical event streams
- Merge is explicit and previewable
- Merge preview never mutates real state

Preview path:
```
Branch A events ─┐
                 ├─► mergePlan → simulateMergeState (NO mutation)
Branch B events ─┘
       │                 │                 │
       ▼                 ▼                 ▼
   Event Diff       Visual Diff       Export Diff
```

## Timeline & Animation
- Preview = read-only sampling (AnimatedRuntimeStore)
- Commit = reducer events
- Timeline data is serializable

## Export Trust Chain

```
state
→ exportMotion(state, format)
→ normalized output
→ before/after diff
```

If export cannot be diffed, it cannot be trusted.

## Collaboration Model
- Remote events: Convex append → streamEvents → local dispatcher
- Presence/cursors/intent: Convex presence tables → UI overlays (ephemeral)
- Reducers never handle auth/identity

## Persistence
- Snapshot save/load
- Append-only events
- Strict schema; IDs not regenerated
- Autosave is debounced and skipped on runtime error

## Security & Permissions
- Roles: owner/editor/viewer
- Server-side permission guards (Convex)
- Client UX guards are advisory only

## Stability & Recovery
- Global and editor error boundaries
- Dispatcher try/catch with rollback
- Autosave paused on error
- No partial commits

## Performance
- Guarded layout pass
- Memoized node rendering
- Throttled animation, timeline preview, and collab signals
- Perf tracker + optional HUD (avg/max/count)

## Absolute Flow (one line)

```
Intent → Event → Reducer → State → Export → Diff → Trust
```

---

# Architecture Addendum
States, Transitions & Interaction UX (Authoritative)

This section extends the Dropple OS architecture with the authoritative UX model for States, Transitions, and Interactions.
It defines how users reason about behavior without altering core event, reducer, or dispatcher laws.

If any UI implementation contradicts this section, the implementation is invalid.

## 1) UX Architecture Principles

Dropple UI is not a free-form interface. It is a projection of system law.

Core UX Invariants
- State is truth
- Motion is derived
- Preview is illusion
- Export is consequence
- Nothing happens implicitly

UX must reveal system behavior, never invent it.

## 2) State Model (UX-Level Architecture)

### 2.1 Definition of State

A State is a named snapshot of valid design truth.

States are:
- Explicit
- Deterministic
- Replayable
- Exportable

States are not:
- Keyframes
- Undo steps
- Versions
- Animations

If a state cannot be exported deterministically, it must not exist.

### 2.2 Default State

Every scope has exactly one Default State.

Rules:
- Default is implicit
- Default cannot be deleted
- Default is the baseline for export and replay

## 3) State Scope (Critical Architectural Distinction)

### 3.1 Component States (Local Scope)

Component states belong to reusable entities.

Examples:
- Button: Default / Hover / Pressed
- Card: Collapsed / Expanded

Properties:
- Scoped to component
- Reusable
- Portable
- Exportable as component logic

### 3.2 Page States (Global Scope)

Page states belong to screens, frames, or flows.

Examples:
- Page A / Page B
- Modal Open / Closed
- Step 1 / Step 2

Properties:
- Contextual
- Non-reusable
- Exportable as navigation or app-level state

### 3.3 Scope Rules (Hard Law)

- A state belongs to exactly one scope
- Component states and Page states never merge
- Transitions never cross scope directly
- Scope boundaries must be enforced by UX before system enforcement

## 4) State Discovery (UX Enforcement)

### 4.1 When "Add State" Appears

"Add State" is shown only when:
- A component is selected → Component State
- A page/frame is selected → Page State

States are never created globally.

### 4.2 State Switching

- Switching states is preview-only
- No events are emitted when viewing a state
- Editing while in a state emits events scoped to that state

This preserves replay and undo correctness.

## 5) Transition Model (UX-Level Architecture)

### 5.1 Definition of Transition

A Transition describes how change feels between two states.

Transitions:
- Connect State A → State B
- Define duration and easing
- Apply to selected properties
- Are optional

Transitions are not animations.

### 5.2 Transition Discovery Rules

"Add Transition" appears only when:
- At least two states exist
- The user has switched between states
- A meaningful comparison is occurring

No state comparison → no transition UI.

### 5.3 Transition Constraints

Users may define:
- Duration
- Easing
- Properties to interpolate

Users may not define:
- Keyframes
- Motion curves
- Timelines
- Ordering

If these are required, the user must switch to Animation Mode.

## 6) Interaction Model (Cause of State Change)

### 6.1 Definition of Interaction

An Interaction is a deterministic trigger that causes a state change.

Examples:
- On Click
- On Hover
- On Focus
- On Toggle

Interactions never define motion.

### 6.2 Interaction Flow (UX Law)

- User selects an interactive element
- Chooses a trigger
- Chooses a target state
- Transition (if defined) is applied automatically

Interactions describe intent, not motion.

### 6.3 Interaction Scope Rules

Allowed:
- Component → Component State
- Component → Page State (navigation)
- Page → Page State

Forbidden:
- Direct cross-scope state mutation
- Multiple state changes per interaction
- Motion definitions inside interactions

Illegal combinations must never appear in UI.

## 7) Preview Architecture (UX Contract)

Preview is a derived simulation, not truth.

Rules:
- Preview never mutates state
- Preview never emits events
- Preview always reverts
- Preview is clearly labeled
- Preview exists to understand experience, not to define data

## 8) Conflict UX (Divergent Truth Handling)

### 8.1 Definition of Conflict

A conflict occurs when:
- The same state
- In the same scope
- Has diverging truths

Conflicts are not errors.

### 8.2 Conflict Discovery

Conflicts appear only:
- During merge preview
- When switching branches
- When opening divergent documents

Conflicts never interrupt normal editing.

### 8.3 Conflict Resolution Granularity

Conflicts are resolved at the smallest meaningful unit:
- Property
- State
- Transition
- Component
- Page

Resolution always supports preview before commit.

## 9) Export Mental Model (UX → System Alignment)

### 9.1 Export Guarantee

If it works in Dropple, it will work in code.

Export is:
- Deterministic
- Derived from state
- Previewable via diff
- Never inferred from preview or DOM

### 9.2 Mental Mapping (Designer Perspective)

Design Concept | Export Meaning
Component | Component
State | Prop / Condition
Interaction | Handler
Transition | Code transition
Page State | Route / App State

Designers do not need to read code to trust export.

## 10) Relationship to Animation Mode

- Transitions exist in all modes
- Animation Mode is where motion becomes content
- Timeline authoring exists only in Animation Mode
- UI must never blur this boundary

## 11) UI Implementation Guardrails

Before implementing any UI feature, confirm:
- Does this mutate state?
- Does it emit an event?
- Is it preview-only?
- Is it exportable?
- Does it respect state scope?

If uncertain, stop implementation.

## 12) Final Architectural UX Law

States define truth.
Interactions cause change.
Transitions shape feeling.
Animation tells stories.
Export reflects reality.

This section is binding and part of the Dropple OS architecture.
