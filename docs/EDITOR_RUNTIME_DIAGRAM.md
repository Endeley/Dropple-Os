# Dropple Editor Runtime Diagram

Version: v1  
Scope: End-to-end editor interaction flow  
Purpose: Explain how a single user interaction flows through the Dropple system.

## 1. Overview

This document describes the runtime execution path for a typical editing action.

Example action:

User drags a node on the canvas

Dropple processes this interaction through several deterministic stages.

## 2. High-Level Interaction Flow

User Input  
↓  
UI Event  
↓  
Intent Creation  
↓  
UI Bridge  
↓  
Runtime Input Bridge  
↓  
Interaction Session  
↓  
Frame Pipeline  
↓  
Engine Computation  
↓  
Renderer

If the interaction commits a change:

Session Commit  
↓  
Dispatcher Event  
↓  
Reducers  
↓  
Runtime State Update  
↓  
Frame Pipeline  
↓  
Renderer

## 3. Step-by-Step Interaction Example (Drag Node)

Step 1 — Pointer Input

The user presses the mouse on a node.

pointerdown

Handled by the canvas UI layer.

Location example:

ui/canvas/Canvas.jsx

UI determines:
- selected node
- active tool
- pointer position

## 4. Intent Creation

UI converts the raw event into a Dropple intent.

Example:

intent.move

Intent contains:
- target node id
- pointer position
- selection state

Example structure:

```
{
  type: "intent.move",
  nodeId: "node_123",
  pointer: { x, y }
}
```

## 5. UI Bridge

UI does not directly interact with runtime.

Instead it passes the intent through a UI bridge.

ui/interaction/bridges/

Example bridge:

nodeDragBridge.js

Purpose:
- normalize UI events
- send to runtime input bridge

## 6. Runtime Input Bridge

Location:

runtime/input/

The runtime input bridge translates UI intents into runtime behavior.

Flow:

intent.move  
↓  
InputSessionManager  
↓  
create MoveSession

## 7. Interaction Session

Location:

runtime/input/sessions/

A MoveSession is created.

Session lifecycle:

pointerdown  
↓  
create session  
↓  
pointermove updates  
↓  
pointerup commit

Session state includes:
- node ids
- initial positions
- pointer start position

## 8. Session Update (Pointer Move)

Each pointer movement triggers:

MoveSession.update()

Update process:

pointer delta  
↓  
snap engine  
↓  
guide engine  
↓  
layout detection  
↓  
preview transform

Preview transforms are stored inside the session, not runtime state.

## 9. Frame Pipeline Trigger

After session update, Dropple runs the frame pipeline.

runtime/frame/

Pipeline stages:

runtime state  
↓  
layout pass  
↓  
spatial index build  
↓  
guide computation  
↓  
layout inference  
↓  
apply preview transforms  
↓  
render frame

This produces the visual update.

## 10. Engine Computation During Drag

The frame pipeline invokes several engine modules.

Example flow:

MoveSession delta  
↓  
Constraint Engine  
↓  
Spatial Index Query  
↓  
Guide Engine  
↓  
Layout Inference

Outputs include:
- snap guides
- alignment guides
- spacing guides
- layout suggestions

These are passed to the renderer.

## 11. Rendering the Frame

Location:

canvas/render/renderFrame.js

Renderer draws:
- nodes
- preview transforms
- selection overlay
- guides
- layout suggestions

Renderer is stateless.

It never mutates runtime state.

## 12. Pointer Release (Commit Phase)

When the user releases the mouse:

pointerup

The session commits the final transform.

MoveSession.commit()

This generates a runtime event.

Example:

node/move

## 13. Dispatcher Event

The event enters the dispatcher.

runtime/dispatcher/dispatch.js

Flow:

node/move  
↓  
applyEvent()  
↓  
reducers  
↓  
runtime state updated

This is the only allowed mutation path.

## 14. Reducer Execution

Example reducer:

nodeReducers.js

Reducer applies the transform to runtime state.

Example:

node.position = newPosition

Reducers must remain:
- pure
- deterministic
- side-effect free

## 15. Runtime State Update

After reducers run:

runtime state updated

Example changes:
- node positions
- selection
- layout containers

State change triggers the frame pipeline again.

## 16. Frame Pipeline Re-execution

With updated state:

runtime state  
↓  
layout pass  
↓  
guide computation  
↓  
layout inference  
↓  
renderer

Now the preview transform becomes permanent state.

## 17. Deterministic Replay Guarantee

The entire interaction can be replayed.

event log  
↓  
dispatcher  
↓  
reducers  
↓  
runtime state

Verification:

state hash equality

Guarantee:

same events  
= identical runtime state

## 18. Structural Editing Path (Future)

Structural editing modifies layout containers rather than node positions.

Example interaction:

drag row boundary  
↓  
update container gap  
↓  
dispatch layout/update  
↓  
layout pass recompute

Children remain passive.

## 19. Complete Interaction Flow

Full diagram:

User Input  
↓  
UI Event  
↓  
Intent  
↓  
UI Bridge  
↓  
Runtime Input Bridge  
↓  
Interaction Session  
↓  
Session Update  
↓  
Frame Pipeline  
↓  
Engine Computation  
↓  
Renderer  
↓  
(pointer release)  
↓  
Session Commit  
↓  
Dispatcher Event  
↓  
Reducers  
↓  
Runtime State  
↓  
Frame Pipeline  
↓  
Renderer

## 20. Why This System Matters

This architecture ensures:
- single mutation authority
- deterministic replay
- architecture safety
- predictable editing

Even complex interactions remain traceable.

## Closing

Dropple treats every editor interaction as a structured runtime process, not ad-hoc UI behavior.

This architecture allows the editor to scale into a deterministic creative operating system.
