# Dropple Runtime Expansion Plan

This document turns the current Dropple direction into a concrete implementation plan.

It is intentionally aligned with:

- [LAW.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/LAW.md)
- [TIMELINE_ENGINE_V2_DAG.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/TIMELINE_ENGINE_V2_DAG.md)
- the current shared media workspace implementation

It defines the next runtime domains and the order they should be implemented.

## Core Rules

These rules are fixed for every phase in this plan.

- Unified timeline owns time, playback, markers, tracks, and sequencing structure.
- Motion channels own animation truth.
- Rigs own control structure and constraint relationships.
- Sequencer owns shot and clip arrangement.
- Physics owns runtime-only simulation state.
- Graphs own deterministic value relationships and procedural structure.
- UI emits intents and reads projections only.
- Canonical document state is mutated only through the dispatcher funnel.
- Runtime evaluation must remain deterministic for identical document state, inputs, and time.

## Canonical Document Model

The target canonical document surface is:

```txt
document.motion
document.rigs
document.sequences
document.physics
document.graphs
```

Responsibility split:

- `document.motion`: clips, channels, keyframes, easing, animation truth
- `document.rigs`: controllers, bones, constraints, rig definitions
- `document.sequences`: shots, cinematic tracks, sequence clips, sequence markers
- `document.physics`: authored physical setup, colliders, rigid body config, simulation config
- `document.graphs`: serialized graph definitions, nodes, edges, params, graph categories

## Runtime Model

The target runtime evaluation surface is:

```txt
runtime.rigging
runtime.sequencer
runtime.physics
runtime.graph
```

Rules:

- runtime state is derived from canonical document state, time, and deterministic inputs
- runtime systems may compute scene output, but they do not become canonical document truth during playback
- runtime systems do not bypass the dispatcher or reducer chain

## Unified Timeline

The timeline remains shared across all time-based media.

```txt
Unified Timeline
  ├─ animation projection
  ├─ video projection
  ├─ podcast projection
  ├─ rig controller projection
  └─ sequencer projection
```

The timeline owns:

```txt
timeline
  id
  duration
  frameRate
  currentTime
  playhead
  loopRange
  markers[]
  tracks[]
  groups[]
  selection
```

The timeline does not own:

- rig solving
- camera logic
- FX logic
- waveform analysis
- animation semantics
- physics simulation

Rule:

- timeline owns sequencing, not domain meaning

## Graph Runtime

Graphs are a deterministic visual programming layer.

Graphs do not own time.

```txt
Timeline
   ↓
Channels evaluate
   ↓
Graph evaluates
   ↓
Scene output
```

Graphs describe relationships and transformations, not playback.

Canonical storage:

```txt
document.graphs
  rigGraphs
  fxGraphs
  shaderGraphs
  animationModifierGraphs
  cameraGraphs
  logicGraphs
```

Each graph:

```txt
graph
  id
  type
  nodes[]
  edges[]
```

Each node:

```txt
node
  id
  type
  inputs
  outputs
  params
```

Each edge:

```txt
edge
  fromNode
  fromPort
  toNode
  toPort
```

Graph evaluation rules:

- nodes are stateless
- graphs evaluate as DAGs
- evaluation order is topologically sorted
- no async evaluation
- no hidden mutable UI state
- no randomness without deterministic seeds

Additional graph laws:

- graph nodes are pure functions only: `output = f(inputs)`
- no hidden internal counters, caches, or previous-frame memory inside nodes
- graphs compile into execution plans when graph structure changes
- runtime executes compiled plans, not ad-hoc graph sorting every frame
- cycles are illegal and UI must reject cyclical connections
- graphs may read timeline time but never own or advance time
- graphs produce derived runtime outputs, never canonical document mutations
- graph evaluation must be bounded by node-count and execution-depth limits

Safe graph pipeline:

```txt
document.graphs
    ↓
compileGraph()
    ↓
executionPlan
    ↓
runtime evaluation
    ↓
derived outputs
```

## Animation State Machines

State machines manage animation selection and transition logic.

```txt
State Machine
      ↓
Select animation clip
      ↓
Motion channels evaluate
      ↓
Final animation output
```

Rules:

- state machines select animation clips, they do not generate animation data
- canonical state machine definitions live in `document.stateMachines`
- runtime state machines depend only on deterministic inputs and timeline time
- transitions are pure, ordered, and replay-safe
- layered state machines are allowed, but layering remains explicit and deterministic

Target structures:

```txt
stateMachine
  id
  states[]
  transitions[]
  entryState
  parameters[]
  layers[]

state
  id
  animationRef
  blendDuration

transition
  from
  to
  condition
  blendDuration
```

## Animation Blending Engine

The blending engine is the runtime math layer that combines active clip samples into one deterministic output.

```txt
state machine / sequencer / graph
        ↓
active animation clips + weights
        ↓
Animation Blending Engine
        ↓
final blended channel values
        ↓
rig / scene evaluation
```

Rules:

- blending never owns animation truth
- blending never owns time
- blending never mutates canonical document state
- blending is pure for identical inputs
- blend ordering must be stable

Supported blend modes:

- override
- linear weighted blend
- additive blend
- masked blend

Target runtime surface:

```txt
runtime/animation/blending/
  blendEngine.js
  blendLayers.js
  blendMasks.js
  sampleClipChannels.js
  normalizeWeights.js
  applyAdditiveBlend.js
  applyMaskedBlend.js
```

## Character Animation Pipeline

This is the full evaluation chain Dropple is converging toward.

```txt
Timeline / Sequencer
        ↓
Motion Channels
        ↓
Animation State Machine / Graph
        ↓
Animation Blending Engine
        ↓
Controller Values
        ↓
Rig Solver
        ↓
Physics / Secondary Motion
        ↓
Scene Graph Evaluation
        ↓
Renderer
```

Pipeline law:

- each stage has one responsibility
- later stages consume derived output from earlier stages
- no stage back-writes canonical truth during playback
- identical document state, inputs, and time must yield identical final pose

## Rigging Domain

Rigs are structured control systems that drive scene nodes through constraints.

```txt
Rig
   ↓
Controllers
   ↓
Constraints / Solvers
   ↓
Scene Node Transforms
```

Rules:

- rigs do not store animation truth
- controllers are animated
- bones are solved outputs
- solvers are pure and stable
- evaluation order is deterministic

Canonical storage:

```txt
document.rigs
```

Target structures:

```txt
rig
  id
  rootNode
  controllers[]
  constraints[]
  bones[]

controller
  id
  label
  nodeRef
  channels[]

bone
  id
  parentBone
  nodeRef

constraint
  id
  type
  inputs[]
  outputs[]
```

## Sequencer Domain

Sequencer is the higher-level cinematic arrangement layer.

```txt
Sequencer
   ↓
Shots
   ↓
Camera / Scene / Animation references
   ↓
Unified Timeline
   ↓
Runtime evaluation
```

Rules:

- sequencer does not become a second animation engine
- sequencer references motion, camera, audio, FX, and scene assets
- sequencer uses the shared playback clock

Canonical storage:

```txt
document.sequences
```

Target structures:

```txt
sequence
  id
  duration
  frameRate
  tracks[]
  markers[]

shot
  id
  start
  end
  cameraRef
  sceneRef
```

## Physics Domain

Physics is runtime-derived simulation, not canonical playback truth.

```txt
document.sceneGraph
document.motion
document.physics
        ↓
runtime.physics
        ↓
runtime.scene.computed
```

Rules:

- `document.physics` stores authored config
- `runtime.physics` stores simulation state
- playback does not write simulation results back into canonical document state
- simulation must use fixed timestep and deterministic ordering

Canonical storage:

```txt
document.physics
```

Runtime storage:

```txt
runtime.physics
```

## Phase Order

Implementation order is strict. Do not skip ahead and fragment the system.

### Phase 1: Finish Unified Timeline and Animation Depth

Goal:

- finish the shared media timeline and inspector path before adding new domains

Deliverables:

- multi-keyframe selection
- batch interpolation/easing edits
- tween span operations
- stronger animation inspector semantics
- stable selector surface for timeline views

Target files:

- `ui/workspace/media/`
- `ui/timeline/`
- `runtime/projection/selectors/`

Required selectors:

- `selectTimelinePlayback`
- `selectTimelineMarkers`
- `selectTimelineTracks`
- `selectAnimationTimelineView`
- `selectVideoTimelineView`
- `selectPodcastTimelineView`

### Phase 2: Add Rigging Domain

Goal:

- introduce `document.rigs` and deterministic rig evaluation

Create:

- `runtime/rigging/rigRegistry.js`
- `runtime/rigging/rigReducer.js`
- `runtime/rigging/evaluation/evaluateRig.js`
- `runtime/rigging/evaluation/solveConstraints.js`
- `runtime/rigging/constraints/ikSolver.js`
- `runtime/rigging/constraints/aimConstraint.js`
- `runtime/rigging/constraints/parentConstraint.js`

First milestone:

- rig create/update/delete
- controller create/update/delete
- parent constraint support
- aim constraint support
- simple two-bone IK

### Phase 3: Project Rig Controllers Into Animation Editing

Goal:

- make controllers the animation-facing surface instead of raw solved bones

Create:

- `runtime/projection/selectors/rigSelectors.js`
- `ui/rigging/RigControllerOverlay.jsx`
- `ui/rigging/RigInspectorPanel.jsx`

First milestone:

- viewport controller overlays
- controller timeline tracks
- controller-aware animation inspector

### Phase 4: Add Sequencer Domain

Goal:

- introduce `document.sequences` on top of the shared timeline engine

Create:

- `runtime/sequencer/sequenceRegistry.js`
- `runtime/sequencer/sequenceReducer.js`
- `runtime/sequencer/evaluation/evaluateSequence.js`
- `runtime/sequencer/evaluation/resolveActiveClips.js`
- `runtime/sequencer/evaluation/resolveActiveCamera.js`

UI:

- `ui/sequencer/SequencerPanel.jsx`
- `ui/sequencer/ShotTrack.jsx`
- `ui/sequencer/CameraTrack.jsx`
- `ui/sequencer/AudioTrack.jsx`
- `ui/sequencer/FXTrack.jsx`

First milestone:

- sequence reducer
- shot track projection
- active camera resolution
- camera track projection
- shared timeline marker integration
- active sequence track projection into the shared media timeline
- minimal sequencer inspector and header context
- preview-facing active camera context derived from `document.sequences`

### Phase 5: Add Physics Domain

Goal:

- introduce authored physics plus deterministic runtime simulation

Create:

- `runtime/physics/physicsRegistry.js`
- `runtime/physics/physicsReducer.js`
- `runtime/physics/physicsRuntime.js`
- `runtime/physics/evaluation/evaluatePhysics.js`
- `runtime/physics/evaluation/resolveCollisions.js`
- `runtime/physics/evaluation/solveConstraints.js`
- `runtime/physics/systems/rigidBodySystem.js`
- `runtime/physics/systems/secondaryMotionSystem.js`
- `runtime/physics/systems/clothSystem.js`
- `runtime/physics/systems/particleSystem.js`

UI:

- `ui/physics/PhysicsInspector.jsx`
- `ui/physics/ColliderEditor.jsx`
- `ui/physics/ConstraintEditor.jsx`

First milestone:

- rigid body authored schema
- collider authored schema
- deterministic runtime stepping
- collision event emission
- secondary motion

### Phase 6: Add Graph Runtime and Graph Editor

Goal:

- add `document.graphs` and a deterministic graph evaluation layer

Create:

- `runtime/graph/graphRegistry.js`
- `runtime/graph/graphReducer.js`
- `runtime/graph/evaluation/evaluateGraph.js`
- `runtime/graph/evaluation/topologicalSort.js`
- `runtime/graph/evaluation/executeNode.js`

UI:

- `ui/graph/GraphEditorPanel.jsx`
- `ui/graph/GraphCanvas.jsx`
- `ui/graph/NodeView.jsx`
- `ui/graph/EdgeView.jsx`
- `ui/graph/NodePalette.jsx`
- `ui/graph/NodeInspector.jsx`

First rollout order:

1. math/value nodes
2. rig graph nodes
3. camera graph nodes
4. animation modifier nodes
5. FX trigger nodes
6. physics modifier nodes

Runtime constraints:

- graphs must compile into execution plans
- graphs must remain DAG-only
- nodes must stay pure and stateless
- evaluation must remain bounded

### Phase 7: Add Animation State Machines

Goal:

- introduce `document.stateMachines` plus deterministic animation selection logic

Create:

- `runtime/stateMachine/stateMachineReducer.js`
- `runtime/stateMachine/stateMachineRegistry.js`
- `runtime/stateMachine/evaluation/evaluateStateMachine.js`
- `runtime/stateMachine/evaluation/resolveTransitions.js`
- `runtime/stateMachine/evaluation/blendAnimations.js`

UI:

- `ui/stateMachine/StateMachineEditor.jsx`
- `ui/stateMachine/StateInspector.jsx`
- `ui/stateMachine/TransitionEditor.jsx`

First milestone:

- state machine canonical storage
- transition evaluation from deterministic parameters
- active clip + weight output for blending

### Phase 8: Add Animation Blending Runtime

Goal:

- introduce deterministic multi-clip blending over motion channels

Create:

- `runtime/animation/blending/blendEngine.js`
- `runtime/animation/blending/blendLayers.js`
- `runtime/animation/blending/blendMasks.js`
- `runtime/animation/blending/sampleClipChannels.js`
- `runtime/animation/blending/normalizeWeights.js`
- `runtime/animation/blending/applyAdditiveBlend.js`
- `runtime/animation/blending/applyMaskedBlend.js`

First milestone:

- sample active clips
- blend channels in stable order
- support override, weighted, masked, and additive blend modes
- feed blended controller values into rig solving

### Phase 9: Cross-System Integration

Goal:

- connect the systems without violating ownership boundaries

Allowed relationships:

- graph drives rig controller values
- graph procedurally modifies animation inputs
- sequencer markers trigger graph events
- graph influences physics parameters
- physics emits deterministic events into FX/audio/sequencer layers

Forbidden relationships:

- graph becomes canonical playback owner
- sequencer becomes canonical animation owner
- physics writes simulation truth into document during playback
- rigs store animation keyframes directly

## Folder Plan

The target folder layout is:

```txt
runtime/
  rigging/
  sequencer/
  physics/
  graph/

ui/
  rigging/
  sequencer/
  physics/
  graph/
```

This is additive. It does not replace the existing shared media and timeline surfaces.

## Testing Gates

Every phase must ship with:

- reducer/unit tests
- selector/projection tests
- runtime evaluation tests
- `npm run build:smoke`
- `PLAYWRIGHT_PORT=3135 npm run test:routes:smoke`
- `npm run arch`

Each new runtime domain should also have deterministic replay-oriented tests where applicable.

## Immediate Next Ticket

Do this before opening rigs:

### Ticket 1: Finish Animation Inspector and Timeline Semantics

Scope:

- multi-keyframe selection model
- selected keyframe array projection
- batch easing/interpolation change
- tween span action intents
- inspector support for single vs multi selection

Success criteria:

- single selection works cleanly
- multi-selection stays projection-driven
- batch edits go through intents only
- no reducer/runtime leakage into UI
- build, routes smoke, and architecture audit pass

## Final Architectural Summary

Dropple should evolve into this layered model:

```txt
document.motion
document.rigs
document.stateMachines
document.sequences
document.physics
document.graphs

        ↓

runtime.rigging
runtime.graph
runtime.stateMachines
runtime.sequencer
runtime.physics

        ↓

scene evaluation

        ↓

projection

        ↓

UI
```

The system remains coherent only if each domain has one responsibility:

- timeline: sequencing
- motion: animation truth
- rigging: controller and constraint structure
- state machines: animation selection and transitions
- blending: deterministic composition of active animation clips
- sequencer: cinematic arrangement
- physics: runtime simulation
- graph: deterministic value relationships

That is the implementation path that scales without turning Dropple into multiple competing engines.
