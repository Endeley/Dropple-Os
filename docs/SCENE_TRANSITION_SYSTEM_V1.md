# Scene Transition System V1

## 1. Purpose

Define the Scene Transition System V1 for Dropple.

This system enables deterministic cinematic transitions between scenes without violating core architectural laws:

- Scene authority remains canonical
- Engine evaluators remain pure
- Transitions operate only on evaluated outputs
- Preview and export remain identical

## 2. Current System Constraints

### Established truths

- Scene = isolated render unit
- Shot = time + camera + optional in-scene animation

### Existing evaluation contract

```text
evaluateShotAt(shotTimeline, sceneGraph, timeMs)
    -> returns evaluatedScene
```

This contract is:

- single-scene
- deterministic
- pure

`evaluateShotAt(...)` must not change to support transitions.

## 3. Core Design Principle

Transitions are not part of scene evaluation.

Transitions are a composition step after evaluation.

## 4. Authority Model

Transition authority lives in:

- temporal / shot layer

Not in:

- sceneGraph nodes
- engine evaluators
- runtime mutation layer
- UI state

## 5. Authored Data Model (V1)

Extend `ShotV1` with transition metadata:

```ts
type TransitionV1 = {
    type: 'cut' | 'crossfade';
    durationMs: number;
};

type ShotV1 = {
    id: string;
    start: number;
    duration: number;

    compositionId?: string;
    camera?: CameraTrackV1;

    transitionOut?: TransitionV1 | null;
};
```

## 6. Semantics

### Transition ownership

`transitionOut` belongs to the current shot.

Meaning:

```text
Shot A --(transitionOut)--> Shot B
```

### Transition window

```text
transitionStart = shotA.end - duration
transitionEnd   = shotA.end
```

### Transition activation

A transition is active when:

```text
globalTime in [transitionStart, transitionEnd]
```

## 7. Evaluation Pipeline (V1)

Step-by-step:

1. Resolve `activeSceneId` from canonical runtime truth.
2. Resolve current shot A via `resolveShotForTime(...)`.
3. Check whether shot A has `transitionOut`.
4. If not, evaluate the single-scene existing path.
5. If yes, resolve next shot B in deterministic shot order.
6. Compute transition progress:

```text
t = (globalTime - transitionStart) / duration
```

7. Evaluate:

```text
sceneA = evaluateShotAt(..., shotA)
sceneB = evaluateShotAt(..., shotB)
```

8. Compose:

```text
output = composeSceneTransition(sceneA, sceneB, transition, t)
```

9. Return the composed result.

## 8. Blend Model (V1)

Supported transition types:

### 1. Cut

```text
if t < 1 -> sceneA
if t = 1 -> sceneB
```

### 2. Crossfade

For each renderable property:

```text
value = lerp(sceneA.value, sceneB.value, t)
```

Transform blending:

- position -> `lerp`
- rotation -> shortest-path `lerp`
- scale -> `lerp`
- opacity -> `lerp`

Visibility rule:

```text
if node exists in only one scene:
    fade in / fade out via opacity
```

## 9. Non-Negotiable Laws

1. Engine purity
   `evaluateShotAt(...)` must remain single-scene.

2. Scene scope integrity
   Each scene is evaluated independently and strictly scoped.

3. No scene mutation
   Transitions must not mutate `sceneGraph` or runtime truth.

4. Determinism
   Same inputs must produce the same composed output.

5. Export equals preview
   Transition logic must be identical in both paths.

## 10. Placement In Architecture

New composition layer:

```text
buildEvaluationInputs (strict)
        ↓
evaluateShotAt (scene A)
evaluateShotAt (scene B)
        ↓
transitionCompositionLayer
        ↓
projection / export
```

## 11. Out Of Scope (V1)

Deferred to V2:

- directional wipes
- mask-based transitions
- shader transitions
- per-layer transitions
- multi-shot blending of more than two shots

## 12. Minimal Runtime Integration Points

New module:

```text
runtime/transition/composeSceneTransition.js
```

Responsibility:

```text
composeSceneTransition({
    sceneA,
    sceneB,
    transition,
    t
}) -> composedScene
```

Primary callers:

- `clockController` for runtime preview
- export pipeline

## 13. Test Plan

### Determinism

- same inputs -> identical output hash

### Transition correctness

- cut behaves as expected
- crossfade blends linearly
- edge cases at `t = 0` and `t = 1`

### Scene isolation

- `sceneA !== sceneB`
- no mutation of either evaluated scene

### Replay stability

- transition output remains stable across replay

## 14. Why This Design Is Correct

Because it preserves:

- the existing engine contract
- scene authority
- deterministic evaluation
- architectural layering

And introduces:

- cinematic composition
- cross-scene continuity
- future extensibility

## 15. Summary

This system does not add transitions by mutating scene truth.

It adds a composition layer above deterministic scene evaluation.

That is why Scene Transition System V1 is compatible with Dropple's authority model.
