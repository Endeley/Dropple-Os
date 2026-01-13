# Phase 4 — Issue #0
Animation Architecture Lock (Authoritative)

This document freezes the scope, ownership, and invariants of Animation Mode in Dropple OS.
Any Phase-4 code that violates this document must be rejected.

## 1. Purpose of Phase 4

Phase 4 exists to describe how motion unfolds over time.

Animation in Dropple OS is:
- Declarative
- Timeline-authored
- Deterministic
- Replay-safe
- Export-derivable

Animation does not decide:
- when something happens
- why something happens
- which state is active
- which interaction fires

Those concerns are already solved by Phases 1–3.

## 2. Animation’s Place in the System

Final separation of responsibility

Interaction (Phase 3) → decides WHEN  
State identity (Phase 1) → decides WHAT  
Transition (Phase 2) → decides IF motion exists  
Animation (Phase 4) → decides HOW motion behaves over time

Animation never executes logic.
It is data + evaluation only.

## 3. Ownership Rules (Hard Lock)

### 3.1 Where animation data lives

Animation data lives only in the timeline domain:

designState.timeline

It must not live in:
- nodes
- interactions
- transitions
- runtime state
- animated store

### 3.2 Who may mutate animation data

Layer | May mutate animation data
--- | ---
Reducers | ✅ (via animation events)
Dispatcher | ❌
UI | ❌
Preview engine | ❌
Export | ❌

All animation edits must flow through:

Event → Reducer → State

## 4. Animation vs Transition (Locked Distinction)

Concept | Role
--- | ---
Transition | Bridges two states
Animation | Defines time-based motion

Rules:
- A transition may reference animation metadata
- Animation never references states
- Animation never triggers transitions
- Transitions never execute animation

If this boundary blurs, Phase 4 is invalid.

## 5. Timeline Semantics (Frozen)

### 5.1 Timeline is authoritative for motion

All animations exist on a timeline

Timeline time unit is milliseconds

All sampling is deterministic

No wall-clock time

No randomness

### 5.2 Timeline evaluation rules

Timeline evaluation is pure

Evaluation may read:
- timeline data
- current cursor time

Evaluation may NOT:
- mutate state
- dispatch events
- write to runtime truth

Preview is an illusion.

## 6. Preview Rules (Reaffirmed)

Animation preview:
- Writes only to useAnimatedRuntimeStore
- Is cancelable
- Never commits history
- Never touches persistence
- Never runs during replay

Preview is:
“What would this look like if played?”

Commit is:
“What is the document?”

## 7. Export Rules (Phase 4 Boundary)

Animation export:
- Reads only from state
- Produces deterministic output
- Must be normalizable
- Must be diffable

Export never:
- reads preview state
- depends on runtime timing
- executes animation logic

## 8. Forbidden Actions (Absolute)

The following are explicitly forbidden in Phase 4:

❌ Animation triggering interactions  
❌ Animation changing active state  
❌ Animation mutating runtime truth  
❌ Reducers playing animation  
❌ Preview scheduling commits  
❌ UI invoking animation directly

Any of these = rollback.

## 9. Phase 4 Deliverables (Locked Scope)

Phase 4 may include only:
- Animation schema (pure data)
- Timeline animation reducers
- Timeline evaluation extensions
- Preview wiring (illusion only)
- Export adapters

Phase 4 may not include:
- UI editors
- smart behaviors
- interaction logic
- conditional rules

## 10. Phase 4 Definition of Done

Phase 4 is complete when:
- Animations are fully declarative
- Timeline edits are undoable
- Preview is isolated
- Replay ignores preview
- Export is deterministic
- No coupling to interactions or states

## 11. Authority Statement

This document overrides:
- feature requests
- UI convenience
- implementation shortcuts

If Phase-4 code cannot be explained within this document,
it does not belong in Dropple OS.

✅ Phase 4 Issue #0 Status

Architecture locked.
