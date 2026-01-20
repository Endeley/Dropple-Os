# Dropple OS Architecture

> State is a consequence, not a source of truth. Events are the only source of truth.

## 🔒 Architecture Lock Legend

This document contains **LOCKED sections** that define non-negotiable system law.

**Legend**
- 🔒 **LOCKED** — Must never change without a full architectural reset (Dropple v2)
- 🧊 **CONTRACT-LOCKED** — Rules are frozen, UI/UX may evolve
- 🟡 **EXTENSIBLE** — Safe to extend within locked invariants

If a feature or tool contradicts a 🔒 LOCKED section, it is invalid by definition.

## Related Architecture Notes

- docs/architecture/why-not-realtime-yet.md

## 🔒 Core Philosophy (LOCKED)

> This philosophy is permanent. Violating it breaks replay, merge, and export guarantees.

## 🔒 Event → State Pipeline (LOCKED)

This pipeline order is immutable.
No tool, preview system, or optimization may bypass or reorder these steps.

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

## 🔒 Message Bus Architecture (LOCKED)

### 1. Purpose of the Message Bus

The Message Bus exists to coordinate ephemeral UI intent and interaction state.

It is used for:
- pointer movement
- drag / resize sessions
- transient UI coordination
- tool intent signaling

It is not used for state mutation.

### 2. Canonical Message Bus (Single Source)

Dropple uses exactly one Message Bus implementation.

This bus is the canonical bus and the only one allowed:

`ui/canvasBus.js`

(If renamed in the future, this section must be updated.)

Any additional message bus implementations are forbidden.

### 3. What the Message Bus Is NOT

The Message Bus:
- ❌ does NOT mutate runtime state
- ❌ does NOT generate events
- ❌ does NOT assign IDs
- ❌ does NOT bypass the dispatcher
- ❌ does NOT write to history
- ❌ does NOT affect replay truth

All state mutation must go through the dispatcher.

### 4. Relationship to the Dispatcher

The Message Bus and Dispatcher have strictly separate roles:

Message Bus → UI intent (ephemeral)
Dispatcher  → State mutation (authoritative)

The Message Bus may trigger intent that results in events,
but it may never apply events itself.

### 5. Allowed Data on the Message Bus

Allowed:
- pointer events
- session objects
- transient geometry
- UI-only metadata

Forbidden:
- event IDs
- reducer payloads
- state mutations
- timeline operations

If data must be replayable, auditable, or persisted,
it must not go through the Message Bus.

### 6. Enforcement & Cleanup Policy

Only one Message Bus file may exist in the repository.

Any duplicate or experimental buses must be removed.

New contributors must use the canonical bus only.

Violations are architectural errors, not stylistic ones.

### 7. Mental Model

The Message Bus is for coordination.
The Dispatcher is for truth.

## Legacy Dispatcher Adapter (DEPRECATED)

The file `ui/interaction/dispatcher.js` exists solely to support
legacy callsites during migration.

Rules:
- It must never create a dispatcher
- It must never own lifecycle
- It must only accept an injected dispatcher
- It must not be used by new code

All new UI, Canvas, Sessions, and Bridges MUST use
`useDispatcher()` from WorkspaceRoot.

This adapter will be removed once all legacy callsites are migrated.

## 🔒 Reducers & Replay Determinism (LOCKED)

Reducers are pure, deterministic, and replay-safe.
They must never infer intent, compute animation, or access runtime/UI state.

```
initialState
→ apply event 1
→ apply event 2
→ apply event 3
→ currentState
```

Replay must always produce the same result.

## Layout & Derived State (LOCKED)

### 1. Layout Is Derived, Not Authored

Layout in Dropple is **derived state**.

It is computed from authored runtime state but is:
- not persisted
- not recorded in history
- not replayed as an event
- not merge-relevant

Reducers define truth.
Layout derives presentation.

---

### 2. When Layout Runs

Layout may run:
- immediately after reducers
- before commit to runtime stores
- during live interaction
- during preview

Layout must NOT:
- run during replay commit
- mutate reducer-owned state
- depend on time, randomness, or environment

---

### 3. Determinism Requirement

Layout must be:
- pure
- deterministic
- idempotent

Given the same input state, layout must always produce the same output.

If this cannot be guaranteed, the logic must move behind authored events.

---

### 4. Replay Safety Rule

During replay:
- reducers reconstruct authored state
- layout may be recomputed locally
- layout must not affect history or cursor position

Replay correctness must never depend on layout logic.

---

### 5. Mental Model

> **Reducers define truth.  
> Layout defines appearance.  
> Appearance must never change history.**

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

## 🔒 Preview Systems (LOCKED)

Preview is an illusion.

Preview systems:
- Write only to animated runtime stores
- Must be cancelable
- Must reset to truth
- Must never run during replay, undo, or redo

Preview must never emit events or write history.

## 🧊 Timeline Authoring UI (Contract-Locked)

UI may evolve, but must obey locked animation and reducer contracts.

## Timeline & Animation
- Preview = read-only sampling (AnimatedRuntimeStore)
- Commit = reducer events
- Timeline data is serializable
- Layered responsibilities:
  - Pure evaluation (math + sampling) is export-safe and deterministic
  - UI/runtime preview glue writes only to AnimatedRuntimeStore
  - Runtime easing helpers are isolated from export and reducers

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

# 🔒 Authoring Tool Contracts (LOCKED)

Dropple authoring tools do not mutate truth directly.

**All tools must:**
- Express user intent
- Optionally preview (illusion only)
- Emit explicit events
- Go through the dispatcher
- Be fully replayable

Preview systems are read-only and must never affect:
- history
- persistence
- replay
- export

See: Animate Between States, Interaction Tools, Timeline Authoring.

# 🔒 Animate Between States (LOCKED)

Animate Between States is a declarative relationship system.

It:
- Does not generate keyframes
- Does not compute animation
- Does not infer values
- Stores animation truth only

All animation math is deferred to evaluation and preview layers.

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

State identity changes are represented only by `STATE_SET`.
There are no `STATE_CREATE` or `STATE_DELETE` events.

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
- Phase 4 lock: see docs/ui-phase-4-animations.md
- Phase 4H lock: see docs/phase-4h-playback.md

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

---

# Phase 5G — Authoring Tools Contract
(Architecture Lock)

This document defines what authoring tools are allowed to be in Dropple OS, where they may operate, and what they are forbidden from doing.

It is intentionally UI-agnostic.

## 1) Purpose

Authoring tools translate user intent into deterministic design truth while preserving:
- Event-sourced correctness
- Replay determinism
- Undo/redo integrity
- Branch/merge safety
- Export trust

No tool may bypass these guarantees.

## 2) Definition: What Is a Tool?

A tool is any system that:
- Interprets user intent (gesture, click, rule, automation, preset)
- Optionally performs computation or assistance
- Emits explicit, replayable state changes or produces pure preview illusion

A tool is not defined by UI or complexity, but by what layer it touches.

## 3) Tool Categories (Hard-Separated)

### 3.1 Truth-Mutating Tools (Core Tools)

These tools change design state.

Examples:
- Animation authoring (keyframes, transitions)
- Transform tools (move, rotate, scale)
- Shadow/light parameters (numeric, explicit)
- State-based animation authoring

Rules:
- MUST emit events
- MUST use pure reducers
- MUST be replayable from scratch
- MUST be exportable or ignorable deterministically
- MUST be diffable

Forbidden:
- Side effects
- Runtime store mutation
- Reading DOM or time
- Implicit state changes

### 3.2 Procedural / Generative Tools (Assisted Truth)

These tools compute results, but only commit explicit outputs.

Examples:
- Motion presets
- Auto-shadow generators
- "Animate between states"
- Constraint-based motion solvers
- AI-assisted layout or animation

Rules:
- Computation may be complex or non-deterministic
- Final committed output MUST be explicit
- Only final output is stored as truth
- Generation process is not replayed

Pattern:
Intent → Generator → Explicit values → Events → Reducers

### 3.3 Preview-Only Tools (Illusion Layer)

These tools never affect truth.

Examples:
- Live animation preview
- Light/shadow exaggeration while scrubbing
- Motion ghosting
- Camera orbit / 3D parallax preview

Rules:
- MUST write only to animated/preview stores
- MUST not emit events
- MUST not write to persistence
- MUST be cancelable
- MUST be blocked during replay

Preview is illusion. Commit is truth.

### 3.4 Media / Asset Tools (Pipeline Tools)

These tools produce new assets, not state mutations.

Examples:
- Image background removal
- Image upscaling
- Texture synthesis
- Relighting

Rules:
- Tool produces a new asset
- Design state references the asset ID
- No reducer logic for "how" asset was created
- Replay sees only asset reference changes

Allowed Event:
NODE_UPDATE { imageSrc: assetId }

## 4) Explicitly Allowed Domains (Future-Safe)

The following domains are allowed provided they obey category rules:
- Numeric lighting models (2D/3D parameters)
- Shadow systems (explicit, animatable values)
- Motion curves and easing editors
- State-driven animation
- Interaction-triggered motion
- AI-assisted generation (commit explicit results only)

## 5) Explicitly Forbidden (Hard Stop)

The following are never allowed:
- Tools that mutate runtime state directly
- Tools that store non-deterministic data in truth
- GPU-only effects without export mapping
- Timeline mutation outside reducer events
- UI-only security enforcement
- Hidden state mutation
- "Magic" behavior that cannot be diffed or exported

If a tool cannot be explained as events + reducers + export, it does not belong.

## 6) Tool → Event Boundary

All truth-mutating tools MUST cross this boundary:

UI / Tool
   ↓
Intent Capture
   ↓
Event(s)
   ↓
Dispatcher
   ↓
Pure Reducers
   ↓
Runtime Truth

Tools MAY NOT:
- Call reducers directly
- Write to stores
- Commit history

## 7) Relationship to Other Phases

- Phase 5: establishes animation truth
- Phase 5G: defines what tools may exist
- Phase 6+: implements unique Dropple tools safely

This contract intentionally does not define UI.

## 8) Design Principle (Non-Negotiable)

Dropple tools may feel magical,
but their results must be explicit, inspectable, replayable, and exportable.

Magic in preview is allowed.
Magic in truth is not.

## 9) Contract Status

Status: Draft (Architecture-Locked)

Scope: Authoring tools only

Breaking change policy: Any violation requires rollback.

---

# Dropple-Only Tool Candidates (Contract-Safe)

This is a design backlog aligned to the Phase 5G Authoring Tools Contract.
No implementation implied.

## I) State-Driven Animation Tools

1) Animate Between States
- User selects two states (A → B)
- Dropple auto-generates transitions for all changed properties
- Procedural / Generative Tool → commits explicit transitions

2) State Rebase Animation
- Re-target existing animations after layout/structure change
- Assisted truth (generator → explicit updates)

3) State Transition Inspector
- Shows exactly what properties animate between states
- Read-only analysis tool

## II) Interaction-Driven Motion Tools

4) Interaction → Motion Mapper
- Bind interaction to a state transition
- Truth-mutating metadata + preview illusion

5) Interaction Conflict Resolver
- Detect overlapping interaction rules
- Validation / inspection tool

## III) Motion Intelligence Tools (Safe “Smart” Tools)

6) Motion Preset Compiler
- Preset → explicit curves/keyframes
- Procedural → explicit truth

7) Curve Normalizer
- Align curves to consistent timing
- Truth-mutating (explicit rewrite)

## IV) Lighting & Visual Depth (Safe Version)

8) Numeric Lighting System
- Numeric light params, animatable
- Core truth tool

9) Shadow Stack Animator
- Animate explicit shadow arrays
- Truth-mutating animation

## V) Preview-Only “Magic” (Illusion Layer)

10) Motion Ghost Trails
- Preview-only

11) Temporal Onion Skin
- Preview-only

## VI) Branch-Aware Tools

12) Animation Merge Preview
- Deterministic merge simulation
- Analysis / preview tool

13) Animation Diff Viewer
- Export diff inspection
- Inspection tool

## VII) Media / Asset Tools

14) Background Removal Pipeline
- Asset pipeline tool

## VIII) Meta-Tools (Power User)

15) “What Changed?” Motion Explainer
- Read-only analysis
