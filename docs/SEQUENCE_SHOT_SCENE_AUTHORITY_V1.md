# Dropple Sequence / Shot / Scene Authority v1

Status: proposed for review, not implemented

## Purpose

This document defines how temporal authority should flow through Dropple's
runtime.

It answers one question:

Where does time authority enter scene runtime, and which system owns each
decision from sequence to final scene output?

This document does not introduce behavior yet. It formalizes the authority
contract that the next implementation must satisfy.

## Current Baseline

Today, the codebase has:

- canonical scene runtime through `evaluateSceneIncremental`
- canonical animation runtime through `evaluateSceneAnimation`
- canonical sequence truth under `document.sequences`
- deterministic sequence evaluation through `evaluateSequence`
- shot resolution utility through `resolveShotForTime`
- active camera projection through `projectActiveSequenceView`

However, the systems are currently split:

- sequence evaluation is primarily consumed by selectors and projection
- shot resolution is not part of canonical scene runtime
- active camera is surfaced in projection, not injected into scene runtime
- scene remains the only fully canonical runtime authority layer

So Dropple currently has canonical spatial authority, but only partial temporal
authority.

## Decision

Dropple should adopt a single temporal-to-spatial runtime chain:

1. sequence owns time and active clip resolution
2. shot owns scene and camera selection
3. scene owns spatial evaluation
4. animation owns transform evaluation within the active scene context
5. projection reflects runtime truth rather than creating temporal truth

UI must never become the source of temporal authority.

## Canonical Authority Chain

The correct runtime chain is:

```text
Project
  -> Sequence
    -> Shot
      -> Scene
        -> Animation
          -> Render / Projection
```

More precisely:

```text
playback time
  -> evaluateSequence
    -> active clips
    -> active camera / active shot candidates
      -> resolve active shot
        -> resolve active scene context
          -> evaluateSceneAnimation
            -> evaluateSceneIncremental scene output
```

## System Ownership

### Sequence

Sequence is the authoritative owner of:

- playback-relative time interpretation
- active clip resolution
- clip activation by track order and clip timing

Sequence is not the owner of:

- node transforms
- final scene graph state
- camera transform computation

Sequence truth must come from:

- `document.sequences`
- canonical runtime playback context

Sequence truth must not come from:

- timeline panel selection
- inspector-local state
- ad hoc projection helpers

### Shot

Shot is the authoritative owner of:

- temporal scene selection
- temporal camera selection
- local shot time within a larger sequence timeline

Shot is not the owner of:

- animation blending
- rig evaluation
- scene graph mutation

If a sequence provides shot clips or shot-like camera clips, runtime must resolve
the active shot deterministically from sequence time.

### Scene

Scene is the authoritative owner of:

- scene graph spatial evaluation
- layout evaluation
- computed transform cache
- partitioning and visibility evaluation

Scene must consume already-resolved temporal context. It must not invent active
sequence, active shot, or active camera from UI state.

### Animation

Animation is the authoritative owner of:

- graph evaluation
- timeline/state-machine/graph layer composition
- rig evaluation
- constraint application
- final animated transform map

Animation runs inside resolved scene context. It must not become the owner of
sequence selection or shot selection.

### Projection

Projection is the owner of:

- read-only runtime views
- editor-facing derived views
- timeline and inspector presentation

Projection is not allowed to create canonical temporal truth.

Selectors may expose:

- active sequence view
- active camera
- active shot view

But those must be reflections of runtime authority once integrated.

## Current Gap

Current code maps to this split:

- `evaluateSceneIncremental` is canonical runtime
- `evaluateSceneAnimation` is canonical animation orchestrator
- `evaluateSequence` is deterministic but projection-adjacent
- `projectActiveSequenceView` currently exposes sequence/camera evaluation
- `resolveShotForTime` exists as a utility, not as a canonical runtime step

This means temporal authority is currently split across:

- canonical document truth
- projection/selectors
- isolated runtime utilities

That is lawful enough for persistence, but not sufficient for a fully declared
runtime authority chain.

## Canonical Inputs

Temporal runtime authority may only depend on:

- `document.sequences`
- `document.sceneGraph` scene/shot truth
- canonical playback context such as:
  - `runtime.playback.frame`
  - `runtime.playback.timeMs`
  - `runtime.cursorIndex`

Temporal runtime authority must not depend on:

- timeline panel focus
- active tab
- inspector selection
- selector-local derivation as source truth
- any editor-only UI state

## Runtime Contract

The future canonical runtime contract should be logically equivalent to:

```js
TemporalContext {
  sequenceId: string | null,
  frameRate: number,
  frame: number,
  timeMs: number,
  activeClips: Array,
  activeShot: {
    shotId: string | null,
    sceneId: string | null,
    localTime: number,
  } | null,
  activeCamera: {
    cameraNodeRef: string | null,
    clipId: string | null,
    trackId: string | null,
  } | null,
}
```

Scene runtime should consume resolved temporal context, not re-derive it from
UI or projection.

## Evaluation Rules

### Sequence Evaluation

Sequence evaluation must be deterministic.

It must be based only on:

- active sequence truth
- sequence data
- playback time

Sequence evaluation order must not depend on:

- object insertion order
- UI selection
- panel rendering order

### Shot Resolution

Shot resolution must be deterministic.

If multiple shot-like candidates exist, runtime must resolve them by explicit
authored ordering rules, never by incidental iteration order.

If no shot exists, runtime may fall back to:

- no active shot
- no camera override

But that fallback must be explicit and deterministic.

### Camera Resolution

Camera authority must come from the active temporal context.

Camera must not be projection-only if it affects runtime view selection.

If the runtime uses camera to influence scene/view output, that camera must be
resolved before projection and be part of canonical runtime truth.

## No Implicit Authority

Runtime must not infer temporal authority from:

- UI selection
- selector invocation order
- render order
- array index without documented sort rules
- playback widgets directly

Only canonical document truth and runtime playback context are valid inputs.

## Invariants

The following must remain true:

- replay of the same event history produces the same temporal context
- sequence evaluation is deterministic for identical sequence truth
- shot resolution is deterministic for identical scene/sequence truth
- camera resolution is deterministic for identical temporal context
- scene runtime consumes temporal context without mutating document truth
- projection reflects runtime truth and does not create it

## Non-Goals

This document does not define:

- sequence editor UX
- timeline drag behavior
- camera animation authoring UX
- multi-sequence orchestration across documents
- export-specific cinematic rendering policy

Those can build on this authority contract later.

## Implementation Guidance

When implemented, the work should proceed in this order:

1. define a canonical temporal context builder in runtime
2. move sequence evaluation into the canonical runtime path
3. integrate shot resolution into canonical runtime path
4. make active camera part of runtime truth when it affects view selection
5. let projection/selectors read temporal runtime truth instead of deriving it
6. add deterministic system tests for sequence -> shot -> camera -> scene flow

## Review Questions

Before implementation, only these decisions need to be confirmed:

1. Should shot truth live under `document.sequences`, `document.sceneGraph`, or
   a dedicated scene/shot slice?
2. Should active camera become a first-class runtime field, or remain derived
   from canonical temporal context each frame?
3. Does scene selection by shot need its own explicit document contract, or is
   camera selection the only required v1 runtime effect?

## Recommendation

Implement v1 narrowly:

- sequence becomes canonical temporal runtime input
- shot resolution becomes canonical temporal runtime step
- camera becomes canonical runtime truth only if it affects runtime view output
- scene remains canonical spatial authority

Do not:

- let UI selection choose sequence or shot at runtime
- collapse projection and runtime into one layer
- let animation own sequence/shot selection
- introduce partial selector-owned temporal authority
