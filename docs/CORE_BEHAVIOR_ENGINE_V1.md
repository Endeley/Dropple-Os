# CORE_BEHAVIOR_ENGINE_V1.md
Status: 🔒 Foundational  
Scope: State • Trigger • Transition • Deterministic Execution  
Applies to: All present and future workspaces

## 0. Purpose

Dropple’s Core Behavior Engine defines how structured interactive systems are modeled and executed.

It ensures that:

- All interaction behavior is deterministic.
- All state transitions are structured.
- All modes build on one unified behavioral model.
- Preview is separate from truth.
- Replay always reproduces identical results.
- No domain forks the engine.

This document is architecturally binding.

## 1. Core Philosophy

Dropple is not a layout engine.  
Dropple is not an animation tool.  
Dropple is not a video editor.

Dropple is:

A deterministic structured behavior engine.

Everything in Dropple can be expressed as:

State  
→ Trigger  
→ Transition  
→ Result

All domains (UIUX, Animation, Video, Podcast, Branding, Education, Dev, etc.) are behavioral lenses over this core.

## 2. The Four Core Layers

These layers must remain strictly separated.

### 2.1 State Layer (Truth Model)

State represents a structured condition of an entity.

A state:

- Has an id.
- Has declarative overrides.
- Does not execute logic.
- Does not contain procedural code.

Example abstract shape:

```
State {
  id
  label
  propertyOverrides
  domainMeta
}
```

Invariants

- States are pure data.
- States never execute.
- States never mutate other states.
- State definitions are replay-safe.
- State storage must be deterministic.

### 2.2 Transition Layer (Declarative Mapping)

A transition describes how change occurs between states.

A transition:

- References fromState
- References toState
- Contains declarative metadata (duration, easing, presetId)
- Does NOT execute
- Does NOT trigger itself

Example shape:

```
Transition {
  id
  fromStateId
  toStateId
  meta {
    duration
    easing
    presetId
  }
}
```

Invariants

- Transitions are declarative only.
- Transitions never mutate truth directly.
- Transitions must be export-safe.
- Transitions must be replay-deterministic.
- Presets resolve deterministically.

### 2.3 Trigger Layer (Activation Model)

Triggers define what causes a state change.

Triggers are abstract types, not UI assumptions.

Allowed trigger types (v1):

- pointer
- time
- command
- condition
- system

Example:

```
Trigger {
  id
  type
  source
  condition
  targetStateId
}
```

Invariants

- Triggers do not execute state change directly.
- Triggers emit intent only.
- Trigger evaluation must be deterministic.
- Trigger types must be extensible.
- Timeline is just one trigger type (time).

### 2.4 Execution Layer (Mutation Boundary)

Execution occurs only via:

Intent → Dispatcher → Reducer → Canonical State

Reducers are the only mutation authority.

Invariants

- No tool mutates truth.
- No preview mutates truth.
- No trigger mutates truth.
- All state changes go through dispatcher.
- Replay must reproduce identical canonical state.

## 3. Preview Isolation Law

Preview is illusion.

Preview:

- May simulate transition.
- May simulate state change.
- Must never alter canonical state.
- Must be removable without affecting truth.
- Must produce identical canonical state if disabled.

Preview layers belong in:

design/canvas/*ghost*

Never inside reducers.

## 4. Canonical Behavior Graph

Each entity may optionally own a behavior graph.

Abstract structure:

```
BehaviorGraph {
  states[]
  transitions[]
  triggers[]
  baseStateId
}
```

Scope

BehaviorGraph may attach to:

- Node
- Component
- Page
- Scene
- Domain object (future)

The graph must not assume UI-only context.

## 5. Determinism Guarantees

The Core Behavior Engine must guarantee:

- Replay hashing stability.
- Undo/redo consistency.
- Export consistency.
- No async mutation inside reducers.
- No hidden state generation.
- No UI-driven side effects.

If any new feature breaks determinism, it is invalid.

## 6. Non-Goals (v1)

The Core Behavior Engine does NOT:

- Auto-generate hidden states.
- Auto-mutate without explicit intent.
- Embed AI mutation inside reducers.
- Allow procedural state logic.
- Replace manual control.

AI and presets may translate intent —
but must resolve into structured deterministic events.

## 7. Domain Expansion Model

All future modes must use this core.

Examples:

UIUX:

- pointer trigger
- state override for layout/style
- transition meta for motion

Animation:

- time trigger emphasis
- timeline as visual editor over transitions

Video:

- segment states
- cut/fade transitions
- time trigger dominant

Podcast:

- audio segment states
- mute/active states
- time trigger dominant

Branding:

- variant states
- token override states
- transition optional

Education:

- step states
- condition triggers

Dev:

- behavior export
- structured state graph export

No mode may redefine the core model.

Modes only:

- Surface tools
- Reweight domains
- Enable trigger types

## 8. Tool Contract Alignment

All behavior tools must:

- Emit intent only.
- Never generate IDs.
- Never mutate truth.
- Never execute transitions.
- Respect capability gating.
- Respect replay guard.

Tools may operate via:

- Manual manipulation
- Preset resolution
- Intent translation

All must resolve into the same intent pipeline.

## 9. Expansion Safety Rule

Before adding a new domain:

Ask:

- Does it fit into State?
- Does it use Trigger?
- Does it use Transition?
- Does it commit via Reducer?

If not, it does not belong in Dropple’s core.

## 10. Vertical Slice v1 (Required)

Before expanding modes:

Implement fully:

1 entity  
2 states  
1 pointer trigger  
1 transition  
Ghost preview  
Deterministic commit  
Replay verification

If this fails, the abstraction is incorrect.

## 11. Core Identity Statement

Dropple is:

A deterministic structured behavior engine  
with expressive multi-layer interaction.

Everything else is a lens.

## 🔒 Final Lock

This blueprint defines the behavioral spine of Dropple.

All future features must conform.

Violation of these laws is an architectural bug, not a design choice.
