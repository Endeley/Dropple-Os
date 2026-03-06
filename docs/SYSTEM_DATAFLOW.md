# Dropple System Dataflow

Version: v1  
Status: System reference  
Scope: End-to-end system pipelines

## 1. Purpose

This document explains how data moves through Dropple.

Dropple contains several independent pipelines:
- Interaction Pipeline
- State Mutation Pipeline
- Frame Rendering Pipeline
- Layout Pipeline
- Timeline Pipeline
- Export Pipeline
- Collaboration Pipeline

Understanding these pipelines is essential for maintaining determinism and architecture integrity.

## 2. System Overview

The entire Dropple system can be summarized as:

User Input  
↓  
Intent System  
↓  
Runtime Dispatcher  
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

This flow guarantees:
- single mutation authority
- deterministic replay
- consistent rendering

## 3. Interaction Pipeline

Handles user interaction with the canvas.

User Input  
(pointer / keyboard)

↓  
UI Event Handler

↓  
Intent Creation  
(intent.move / intent.resize / intent.rotate)

↓  
UI Bridge  
(ui/interaction/bridges)

↓  
Runtime Input Bridge

↓  
Interaction Session  
(MoveSession / ResizeSession / RotateSession)

During pointer movement:

pointer move  
↓  
session.update()  
↓  
preview transform  
↓  
frame pipeline  
↓  
render preview

On pointer release:

pointer up  
↓  
session.commit()  
↓  
dispatcher event  
↓  
reducers  
↓  
runtime state update

## 4. State Mutation Pipeline

All state mutations pass through the dispatcher.

Intent  
↓  
Runtime Input Bridge  
↓  
Dispatcher  
↓  
applyEvent()  
↓  
Reducers  
↓  
Runtime State Update

Example:

intent.align.left  
↓  
align/nodes event  
↓  
dispatcher  
↓  
layoutReducers  
↓  
runtimeState.nodes updated

This guarantees:
- single mutation funnel
- replay compatibility
- deterministic state evolution

## 5. Frame Rendering Pipeline

Runs continuously during editing.

Runtime State  
↓  
Selection Overlay  
↓  
Layout Pass  
↓  
Spatial Index Build  
↓  
Guide Computation  
↓  
Layout Inference  
↓  
Preview Transforms  
↓  
Renderer

Each stage is deterministic.

Stage 1 — Layout Pass  
runtime/layout/applyLayoutPass.js

Applies container layout rules:

container  
↓  
autoLayout rules  
↓  
child positions

Stage 2 — Spatial Index  
engine/spatial/

Builds spatial lookup structures:

nodes  
↓  
spatialIndex.build()  
↓  
grid / bounds map

Used by:
- snap engine
- guide engine
- layout inference

Stage 3 — Guide Computation  
engine/guides/

Detects spatial relationships.

Examples:
- alignment guides
- distance guides
- spacing guides
- grid patterns
- symmetry axes

Output:

guide objects

These are used only for visualization.

Stage 4 — Layout Inference  
engine/layout/

Detects layout structures:
- rows
- columns
- stacks
- grids

Used to show layout suggestions.

Stage 5 — Preview Transforms

Active sessions apply temporary transforms:
- MoveSession
- ResizeSession
- RotateSession

Transforms are applied only for rendering.

Runtime state is not mutated yet.

Stage 6 — Rendering

Renderer draws the frame.

canvas/render/renderFrame.js

Rendering includes:
- nodes
- selection overlays
- guides
- layout suggestions

## 6. Layout System Pipeline

Dropple layout evolves through several stages.

Free Nodes  
↓  
Layout Inference  
↓  
Layout Suggestion  
↓  
Layout Conversion  
↓  
AutoLayout Container  
↓  
Layout Pass

Layout Conversion  
engine/layout/convertLayout.js

Example:

3 nodes aligned horizontally  
↓  
detectRows()  
↓  
convertLayout()  
↓  
autoLayout container

Layout Interaction

Once nodes are inside auto-layout:
- drag child → slot reorder
- resize child → blocked
- resize container → container resize

## 7. Timeline Pipeline

Handles animation evaluation.

Timeline State  
↓  
Evaluation Engine  
↓  
Channel Blending  
↓  
Track Resolution  
↓  
Frame Evaluation

Engine modules:
- engine/timeline/
- engine/evaluation/

Example:

time = 1.2s  
↓  
evaluateTimeline()  
↓  
node transform values

## 8. Export Pipeline

Converts runtime state into export targets.

Runtime State  
↓  
Evaluation Snapshot  
↓  
IR Generation  
↓  
Framework Translator  
↓  
Export Output

Targets may include:
- React
- Vue
- HTML/CSS

Export must produce identical output when:
- same state
- same evaluation

## 9. Collaboration Pipeline

Handles multi-user editing.

Local Intent  
↓  
Event Envelope  
↓  
Network Transport  
↓  
Remote Event Stream  
↓  
Merge Events  
↓  
Dispatcher  
↓  
Reducers  
↓  
Runtime State

Collaboration modules:
- collab/eventLog.js
- collab/mergeEvents.js
- collab/lamportClock.js

## 10. Deterministic Replay Pipeline

Replay reconstructs state from an event log.

Event Log  
↓  
Dispatcher  
↓  
Reducers  
↓  
Runtime State

Verification:

runtimeStateHash(A)  
==  
runtimeStateHash(B)

Replay must produce identical results across machines.

## 11. Pipeline Safety Rules

Every pipeline must obey these constraints.

Engine Purity  
engine modules  
must be deterministic

Dispatcher Authority  
state mutations  
only through dispatcher

Renderer Purity  
renderer  
must not mutate state

UI Isolation  
UI cannot import runtime state

## 12. Why These Pipelines Matter

These pipelines guarantee Dropple remains:
- deterministic
- replayable
- architecture-safe

They allow the system to scale while preventing:
- hidden mutations
- nondeterministic behavior
- architecture drift

## Closing

Dropple is built around clear data movement pipelines rather than ad-hoc function calls.

Understanding these pipelines ensures that contributors can extend Dropple without violating its architectural guarantees.
