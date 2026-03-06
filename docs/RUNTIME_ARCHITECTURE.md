# Dropple Runtime Architecture

Version: v1  
Status: Authoritative reference  
Scope: Execution layer of Dropple

## 1. Overview

The Dropple Runtime is the execution layer responsible for:
- state authority
- event dispatch
- interaction sessions
- frame pipeline
- projection
- deterministic replay

The runtime orchestrates the system but does not perform heavy computation.  
All computation is delegated to the engine layer.

## 2. Runtime Position in the System

Runtime sits between UI interaction and engine computation.

UI  
↓  
Intent  
↓  
Runtime Input Bridge  
↓  
Dispatcher  
↓  
Reducers  
↓  
Runtime State  
↓  
Frame Pipeline  
↓  
Engine Computation  
↓  
Renderer

Runtime acts as the system kernel of Dropple.

## 3. Runtime Responsibilities

The runtime performs six major roles.

1. State Authority

Runtime owns the authoritative document state.

Examples:
- scene graph
- nodes
- selection
- timeline
- layout containers
- workspace state

No other layer may mutate this state.

2. Event Dispatch

All state mutations pass through the dispatcher.

event  
↓  
dispatcher  
↓  
reducers  
↓  
state update

This guarantees:
- single mutation funnel
- deterministic replay
- consistent history

3. Interaction Sessions

Interactive editing is handled through sessions.

Examples:
- MoveSession
- ResizeSession
- RotateSession

Sessions compute temporary preview transforms during pointer movement.

They do not commit state directly.

4. Frame Pipeline

Runtime converts state into renderable frame data.

runtime state  
↓  
selection overlay  
↓  
spatial index  
↓  
guide computation  
↓  
layout inference  
↓  
preview transforms  
↓  
renderer

This pipeline runs every frame.

5. Projection

Runtime exposes read-only projections for UI.

runtime state  
↓  
projection  
↓  
UI consumption

Projection ensures UI cannot mutate runtime.

6. Deterministic Replay

Runtime can rebuild state from an event log.

event log  
↓  
dispatcher  
↓  
reducers  
↓  
state reconstruction

This guarantees:
- debug reproducibility
- collaboration merging
- export verification

## 4. Dispatcher

Location:

runtime/dispatcher/

The dispatcher is the single mutation gate.

Flow:

event  
↓  
dispatch()  
↓  
applyEvent()  
↓  
reducers  
↓  
state

Dispatcher responsibilities:
- validate events
- apply reducers
- record history
- trigger projections

Dispatcher must remain deterministic.

## 5. Reducers

Location:

core/events/reducers/

Reducers transform runtime state.

Rules:
- pure functions
- no side effects
- immutable updates

Example reducer flow:

node/create  
↓  
nodeReducers.js  
↓  
new runtime state

Reducers must not perform:
- IO
- engine queries
- UI interaction

## 6. Runtime State

Runtime state represents the live document.

Typical structure:

runtimeState  
  nodes  
  sceneGraph  
  timeline  
  selection  
  workspace  
  layoutContainers

Rules:
- immutable updates
- single source of truth
- mutated only by reducers

## 7. Input Bridge

Location:

runtime/input/

Input bridges translate UI intents into runtime events.

Flow:

UI intent  
↓  
UI bridge  
↓  
runtime input bridge  
↓  
dispatcher event

Example:

drag node  
↓  
intent.move  
↓  
MoveSession

This isolates runtime from UI.

## 8. Interaction Sessions

Sessions represent active editing interactions.

Location:

runtime/input/sessions/

Sessions exist during pointer interactions.

Example lifecycle:

pointer down  
↓  
create session  
↓  
pointer move  
↓  
update session  
↓  
preview transforms  
↓  
pointer up  
↓  
dispatch event

Sessions never mutate runtime state directly.

## 9. Move Session

Handles node translation.

Responsibilities:
- compute drag delta
- apply snapping
- update preview transforms
- detect layout reorder

Uses:
- snap engine
- spatial index
- layout system

## 10. Resize Session

Handles node resizing.

Responsibilities:
- resize bounds
- apply snap constraints
- emit resize guides

Special rule:

auto-layout children cannot be resized  

Resize attempts on auto-layout children are blocked.

## 11. Rotate Session

Handles node rotation.

Responsibilities:
- compute rotation delta
- snap to angles
- update preview transforms

## 12. Frame Pipeline

Location:

runtime/frame/

The frame pipeline produces renderable output.

Typical pipeline:

runtime state  
↓  
apply layout pass  
↓  
build spatial index  
↓  
compute guides  
↓  
compute layout inference  
↓  
apply preview transforms  
↓  
render frame

Pipeline stages must remain deterministic.

## 13. Layout Pass

Location:

runtime/layout/applyLayoutPass.js

Layout pass applies auto-layout rules.

Example:

container  
↓  
layout rules  
↓  
child positions

Layout containers control:
- gap
- padding
- direction
- alignment

Children do not directly control their position.

## 14. Projection System

Location:

runtime/projection/

Projection produces UI-friendly data.

Examples:
- render graph
- selection overlay
- timeline view

Projection rules:
- read-only
- derived from runtime state
- stateless

UI must never access runtime state directly.

## 15. Deterministic Replay

Replay reconstructs runtime state.

Process:

event log  
↓  
dispatcher  
↓  
reducers  
↓  
runtime state

Verification:

state hash comparison

This ensures identical results across environments.

## 16. Runtime Collaboration Support

Runtime integrates with collaboration systems.

Examples:
- remote events
- presence updates
- cursor sync
- optimistic transactions

Collaboration events still pass through the dispatcher.

This preserves deterministic replay.

## 17. Runtime Invariants

Runtime enforces several invariants.

Examples:
- scene graph integrity
- node ownership
- layout container structure
- timeline ordering

Violations cause runtime errors.

## 18. Runtime Safety Guarantees

Runtime ensures:
- single mutation funnel
- deterministic event processing
- architecture boundaries
- replay stability

This protects Dropple from:
- state corruption
- race conditions
- nondeterminism
- architecture drift

## 19. Runtime as Dropple’s Kernel

Runtime acts as the operating system kernel of Dropple.

It manages:
- state
- interaction
- execution flow
- deterministic replay

While delegating computation to the engine layer.

## Closing

The Dropple Runtime is responsible for coordinating the entire system while preserving determinism.

Together with the engine and architecture laws, it ensures Dropple remains:
- deterministic
- replayable
- architecturally stable

These guarantees allow Dropple to scale from a design tool into a full creative operating system.
