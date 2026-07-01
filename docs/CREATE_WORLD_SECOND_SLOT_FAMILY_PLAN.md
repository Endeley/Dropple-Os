# Create World Second Slot Family Plan

## Purpose

Determine the lowest-risk projection family that can validate projection-slot reuse beyond `emptyWorld` while preserving constitutional ownership and behavioral stability.

This document is a planning artifact only.

It does not implement code.
It does not approve a new slice automatically.
It does not rename shells.
It does not change runtime behavior.

Its job is to identify which slot family, if any, has earned the right to become the second reusable projection pattern.

## Starting State

Already frozen:

- `Activation Slice 1`
  - implemented
  - validated
  - frozen

- `Projection Slot Slice 1`
  - `UIUX Empty World`
  - implemented
  - validated
  - frozen

- `Projection Slot Slice 2`
  - `Graphic Empty World`
  - implemented
  - validated
  - frozen

- `Projection Slot Review`
  - verdict: `C — Pattern validated for same-family reuse`

What is proven:

- `CanvasRoot` can expose a shared projection slot
- a language can fill that slot without changing runtime authority
- the `emptyWorld` family survives reuse across `UIUX` and `Graphic`

What is not yet proven:

- reuse across a second projection family

## Core Question

Which projection family is the safest candidate to validate slot reuse beyond `emptyWorld`?

## Candidate Evaluation Criteria

Each candidate is evaluated by:

- current responsibility
- current file
- current owner
- intended owner
- dependency risk
- state coupling
- minimal extraction path
- stop condition

This is an architectural risk comparison, not a feature prioritization exercise.

## Candidate Table

| Candidate | Current Responsibility | Current File | Current Owner | Intended Owner | Dependency Risk | State Coupling | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `GraphicFirstExpression` | first bounded-expression guidance after composition becomes real | `CanvasRoot.jsx` + `GraphicFirstExpressionOverlay.jsx` | mixed: `CanvasRoot` mount surface + Graphic language meaning | shared projection slot + Graphic language filler | Medium | Medium | `Primary candidate` |
| `GraphicVocabulary` | meaning-first vocabulary guidance after first-expression dismissal | `CanvasRoot.jsx` + `GraphicVocabularyOverlay.jsx` | mixed: `CanvasRoot` mount surface + Graphic language meaning + creation bridge activation | shared projection slot + Graphic language filler | High | High | `Later` |
| `GraphicRefinement` | refinement guidance based on expressive relationships | `CanvasRoot.jsx` + `GraphicRefinementOverlay.jsx` | mixed: `CanvasRoot` mount surface + Graphic language projection logic | shared projection slot + Graphic language filler | High | High | `Later` |
| `GraphicDelivery` | audience-first delivery guidance | `CanvasRoot.jsx` + `GraphicDeliveryOverlay.jsx` | mixed: `CanvasRoot` mount surface + Graphic language projection logic | shared projection slot + Graphic language filler | Medium-High | Medium-High | `Later` |

## Candidate Notes

### Graphic First Expression

Current behavior depends on:

- `workspaceId`
- `modeId`
- `nodeCount`
- `selectedNode`
- `dismissedFirstExpressionNodeId`
- local dismissal callback wiring

Why it is the safest next family:

- it directly follows the already-proven `emptyWorld` progression
- it is still early in the creator journey
- it is projection-heavy but not creation-heavy
- it does not yet require the richer relationship state used by refinement
- it does not require delivery context selection

Why it is not low-risk:

- visibility depends on selection state
- visibility depends on dismissal state
- the slot contract must carry more state than `emptyWorld`

### Graphic Vocabulary

Current behavior depends on:

- selected artboard identity
- child-count inspection across `nodesById`
- first-expression dismissal state
- creation intent dispatch through `nodeCreateIntent`
- selection side effects through `canvasBus`

Why it is later:

- it is no longer pure projection
- it is closer to activation and creation behavior
- it has stronger coupling to downstream expressive-node creation

### Graphic Refinement

Current behavior depends on:

- selected-node identity
- whole-graph `nodesById`
- derived relationship projection

Why it is later:

- richer projection state
- more relationship-driven coupling
- less isolated than first expression

### Graphic Delivery

Current behavior depends on:

- selected-node identity
- whole-graph `nodesById`
- local audience selection state

Why it is later:

- sits later in the creator lifecycle
- includes local interaction state beyond passive visibility
- not as adjacent to the proven `emptyWorld` family as `firstExpression`

## Recommended Candidate

`GraphicFirstExpression`

Reason:

It is the narrowest next family that:

- extends the creator journey in sequence
- preserves a clear ownership story
- remains mostly projection-oriented
- avoids deeper creation and relationship coupling

## Minimal Slice Path

If this candidate is later approved, the minimal slice should be:

1. keep `CanvasRoot` as the shared world mount surface owner
2. expose a `firstExpression` slot alongside `emptyWorld`
3. move only Graphic first-expression filling into a Graphic-owned slot declaration
4. preserve the current runtime behavior and dismissal semantics
5. leave `vocabulary`, `refinement`, and `delivery` untouched

This slice should not:

- rewrite projection semantics
- move creation intent logic
- change dismissal behavior
- alter Graphic language meaning

## Risk Summary

The main risk is not runtime ownership.

The main risk is slot contract expansion:

- `emptyWorld` needed basic world visibility inputs
- `firstExpression` needs selection and dismissal inputs

That means the next slice would validate not only a second family, but also whether projection slots can remain understandable as the input contract becomes richer.

## Stop Condition

No implementation proceeds unless one candidate demonstrates all of the following:

- lowest dependency risk among remaining candidates
- minimal state coupling relative to other families
- preserved ownership boundaries
- clear validation criteria
- a minimal slice that does not pull adjacent families into scope

If that bar is not met:

`no implementation proceeds`

## Decision Gate

If `GraphicFirstExpression` remains the lowest-risk candidate after review, it earns:

`Projection Slot Slice 3 Planning`

It does not yet earn implementation.

## Resulting Sequence

Current state:

- `Projection Slot Review`
  - complete
  - frozen

Next:

- `Create World Second Slot Family Plan`
  - complete

Then:

- review whether `GraphicFirstExpression` truly earns slice planning

Only after that:

- create `Projection Slot Slice 3` plan
