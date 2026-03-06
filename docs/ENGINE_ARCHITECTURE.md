# Dropple Engine Architecture

Version: v1  
Status: Authoritative reference  
Scope: Deterministic computation layer

## 1. Overview

The Dropple Engine is the deterministic computation layer responsible for all pure structural and spatial reasoning.

The engine performs no side effects and does not mutate runtime state.

Instead, it produces derived computations that the runtime may use to update state or render frames.

## 2. Engine Design Principles

The engine follows strict rules.

Pure Computation

Engine functions must be:
- deterministic
- side-effect free
- stateless

Forbidden inside engine modules:
- runtime imports
- UI imports
- global mutation
- random numbers
- time-dependent logic
- IO

Determinism Guarantee

Engine functions must always satisfy:

same inputs  
→ same outputs

Across:
- machines
- operating systems
- Node versions
- browsers

Replay Compatibility

Engine logic must produce identical results during:
- interactive editing
- runtime replay
- export evaluation

This ensures:
- event log determinism
- runtime state reproducibility
- export stability

## 3. Engine Position in the System

Engine sits between runtime state and rendering.

runtime state  
↓  
engine computation  
↓  
derived structures  
↓  
renderer

The engine does not control when computations run.

Runtime decides when to call engine functions.

## 4. Engine Subsystems

The engine is divided into several deterministic subsystems.

## 5. Geometry Engine

Location:

engine/geometry/

Responsibilities:
- bounds computation
- rect intersections
- distance calculations
- coordinate transforms

Typical functions:
- computeBounds()
- expandBounds()
- intersectRects()
- distanceBetweenRects()

These utilities support:
- snap engine
- guide engine
- spatial index
- layout inference

## 6. Constraint Engine

Location:

engine/constraints/

Purpose:

Enforces positional constraints during transforms.

Examples:
- grid snapping
- alignment snapping
- snap thresholds
- constraint resolution

Example flow:

pointer delta  
↓  
constraint engine  
↓  
snapped transform

Core modules:
- snapEngine.js
- snapUtils.js
- constraintEngine.js

Outputs:
- resolved transform
- snap guides

## 7. Alignment Engine

Location:

engine/alignment/

Purpose:

Handles deterministic alignment operations.

Examples:
- align left
- align center
- align right
- align top
- align bottom

Also includes distribution:
- distribute horizontally
- distribute vertically

Core modules:
- computeAlignmentBounds.js
- alignNodes.js
- distributeNodes.js

Alignment operations return layout updates, not mutations.

Runtime applies the updates.

## 8. Spatial Index

Location:

engine/spatial/

Purpose:

Efficient spatial queries for large node graphs.

Without spatial indexing:

O(n²)

With spatial indexing:

O(n log n)

Core modules:
- spatialBounds.js
- spatialGrid.js
- spatialQuery.js
- spatialIndex.js

Typical flow:

nodes  
↓  
spatial index build  
↓  
nearby node query

Used by:
- guide engine
- snap engine
- layout inference

## 9. Guide Engine

Location:

engine/guides/

Purpose:

Detect spatial relationships between nodes.

These relationships are used to display smart guides during editing.

Guide computation must be deterministic.

Guide Aggregator  
guideAggregator.js

Normalizes guide output.

Responsibilities:
- sort guides deterministically
- remove duplicates
- normalize guide structure

Distance Guides  
computeDistanceGuides.js

Detects equal spacing between nodes.

Example:

node A  
node B  
node C

distance(A,B) == distance(B,C)

Produces spacing guides.

Alignment Clusters  
computeAlignmentClusters.js

Detects groups of nodes sharing the same coordinate.

Example:
- left edges aligned
- centers aligned
- top edges aligned

Clusters are sorted deterministically.

Grid Pattern Detection  
computeGridPatterns.js

Detects grid structures such as:
- 2x2
- 3x2
- 4x3

Outputs:
- row centers
- column centers
- grid dimensions

Symmetry Detection  
computeSymmetryAxes.js

Detects mirror symmetry.

Examples:
- vertical symmetry
- horizontal symmetry

Used to show symmetry guides.

## 10. Layout Inference Engine

Location:

engine/layout/

Purpose:

Detect implicit layout patterns.

Examples:
- rows
- columns
- stacks
- grids

Layout inference allows Dropple to suggest structural layouts.

Row Detection  
detectRows.js

Detects horizontal alignment patterns.

Column Detection  
detectColumns.js

Detects vertical alignment patterns.

Stack Detection  
detectStacks.js

Detects ordered lists of elements.

Grid Detection  
detectGrids.js

Detects structured grids.

Layout Inference Coordinator  
computeLayoutInference.js

Combines all detection modules.

Output example:

```
{
  type: "grid",
  rows: 3,
  columns: 2,
  bounds: {...}
}
```

## 11. Layout Conversion Engine

Location:

engine/layout/convertLayout.js

Purpose:

Converts inferred layouts into auto-layout containers.

Flow:

free nodes  
↓  
layout inference  
↓  
convertLayout()  
↓  
autoLayout container

Conversion outputs event-ready updates.

Runtime commits the change.

## 12. Timeline Engine

Location:
- engine/timeline/
- engine/evaluation/

Handles animation evaluation.

Responsibilities:
- track ordering
- blend modes
- channel evaluation
- timeline diffing
- snapshot DAG

Example flow:

timeline state  
↓  
evaluateTimeline()  
↓  
frame output

## 13. Determinism Safeguards

The engine includes many tests to guarantee deterministic behavior.

Examples:
- guide determinism tests
- spatial index determinism
- timeline evaluation determinism
- layout conversion determinism

Typical verification:

hash A == hash B

Across multiple runs.

## 14. Engine Output Rules

Engine functions may return:
- computed transforms
- guide objects
- layout suggestions
- structural diffs
- evaluation results

Engine functions must never mutate input objects.

## 15. Engine Execution Context

The engine is called by:
- runtime frame pipeline
- runtime dispatcher
- runtime evaluation system
- export pipeline

But engine modules themselves must never import runtime.

## 16. Engine as Dropple’s Intelligence Layer

The engine represents Dropple’s structural intelligence.

It understands:
- space
- alignment
- structure
- layout
- animation timelines

This intelligence allows Dropple to evolve beyond a traditional design tool.

## Closing

The Dropple Engine provides the deterministic computation layer that powers:
- smart guides
- layout inference
- spatial reasoning
- timeline evaluation
- export stability

Its strict purity guarantees ensure Dropple remains:
- deterministic
- replayable
- architecturally stable
