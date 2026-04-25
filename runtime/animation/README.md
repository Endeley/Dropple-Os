## Animation Runtime

Dropple's animation runtime is deterministic and replay-safe. Animation evaluation is driven by canonical document truth and runtime context, not by editor-local UI state.

### Canonical Entry

The top-level animation entrypoint is:

- `evaluateSceneIncremental`
  - calls `evaluateSceneAnimation`

`evaluateSceneAnimation` is the canonical orchestrator for graph, timeline, state-machine, rig, and constraint evaluation.

### Pipeline

The current pipeline is:

1. `evaluateSceneIncremental`
2. `evaluateSceneAnimation`
3. `evaluateGraphs`
4. `resolveLayerAuthority`
5. `resolveAnimationLayers`
6. `evaluateAnimationFrame`
7. `evaluateRig`
8. `applyConstraintStack`
9. final transform map

This pipeline is the only valid runtime animation path.

### Graph Activation Contract

Graphs are canonical document truth under `document.graphs`.

Current authored graph fields relevant to runtime participation:

- `enabled: boolean`
- `rigId?: string`

Rules:

- only graphs with `enabled !== false` participate in runtime evaluation
- graph participation is authored in document truth
- graph participation is not controlled by `activeGraphId`
- `activeGraphId` is editor selection state only

### Authority Stages

Animation authority is resolved in two stages.

Graph-local authority:

- graph outputs are evaluated per graph
- graph layers are reduced through `resolveLayerAuthority`
- this produces graph channel output before global layer composition

Global animation layering:

- `resolveAnimationLayers` merges:
  - timeline layers
  - choreography layers
  - state-machine layers
  - graph authority layers
- `evaluateAnimationFrame` blends those layers into controller values
- `evaluateRig` applies controller values to rig transforms
- `applyConstraintStack` applies document constraints after rig evaluation

### Current Layer Policy

The current default policy is:

- timeline: base, priority `0`
- choreography: base, priority `0`
- state machine: override, priority `1`
- graph: modifier, priority `2`

Graph layers are injected into the global layer system after graph-local authority has already been resolved.

### Multi-Graph Behavior

Current behavior allows multiple enabled graphs to target the same rig.

Rules today:

- all enabled graphs are evaluated
- graph outputs are composed deterministically
- conflict resolution happens through existing authority and layer blending

There is not yet a separate authored graph composition policy such as graph priority ordering. If that is added later, it must remain reducer-owned and document-authored.

### Non-Negotiable Laws

- graphs do not mutate document truth during evaluation
- graphs do not depend on editor selection state
- animation evaluation must remain deterministic across replay
- runtime layering policy must be derived from canonical document truth and runtime context only
