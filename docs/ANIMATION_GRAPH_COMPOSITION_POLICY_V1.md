# Dropple Animation Graph Composition Policy v1

Status: proposed for review, not implemented

## Purpose

This document defines how multiple authored animation graphs compose when they
target the same rig.

It does not introduce a new runtime. It formalizes policy for the existing
canonical animation pipeline.

## Current Baseline

Today:

- graphs live in canonical document truth under `document.graphs`
- graph participation is authored through:
  - `enabled`
  - `rigId`
- runtime evaluates all graphs with `enabled !== false`
- graph-local authority is resolved before global layer composition

Current runtime behavior is deterministic, but graph-to-graph composition policy
is still implicit.

## Decision

Dropple should support multiple enabled graphs per rig.

Composition must be:

- authored
- deterministic
- reducer-owned
- replay-safe

The correct long-term model is an ordered graph stack per rig.

## Canonical Model

Each graph may declare:

```js
Graph {
  id: string,
  enabled?: boolean,
  rigId?: string | null,
  priority?: number,
  mode?: 'replace' | 'add' | 'multiply' | 'override' // reserved for future use
}
```

### Field Semantics

- `enabled`
  - graph participates in runtime evaluation unless explicitly `false`
- `rigId`
  - optional authored scope
  - when present, the graph only affects that rig
- `priority`
  - authored graph-stack ordering within the same rig scope
  - higher priority resolves before lower priority
- `mode`
  - authored graph-level blend intent used when graph authority output is
    injected into the global layer system
  - reserved for future use

If fields are absent, runtime MUST treat them as:

- `enabled: true`
- `rigId: null`
- `priority: 0`
- `mode: 'replace'`

In v1, graph-level `mode` is not used in composition and must not alter runtime
behavior.

## Sorting Rule

Graphs that target the same rig must be ordered by:

1. `priority` descending
2. `id` ascending

This ordering rule is mandatory and deterministic.

If `priority` is absent, treat it as `0`.

## Graph Evaluation Independence

Graphs are evaluated independently.

Graph evaluation order must not affect graph-local results.

Graph ordering by `priority` and `id` applies only to composition of graph
outputs, not to graph evaluation itself.

No graph may depend on the output of another graph.

## Composition Stages

Graph composition remains a two-stage system.

### Stage 1: Graph-Local Evaluation

Each enabled graph is:

1. compiled
2. parameter-resolved
3. evaluated to layers
4. reduced through graph-local authority

Output of this stage is graph authority channels.

This stage does not know about timeline or state-machine layers.

### Stage 2: Global Layer Composition

Graph authority output is injected into the existing animation layer system
alongside:

- timeline layers
- state-machine layers

Global layer policy remains:

- timeline: priority `0`
- state machine: priority `1`
- graph: priority `2`

Within the graph tier, authored graph ordering is controlled by graph
`priority`, then stable `id`.

## Scope Rules

Graph participation must be determined by authored truth only.

Allowed inputs to participation:

- `enabled`
- `rigId`
- canonical runtime context

Forbidden inputs to participation:

- `activeGraphId`
- graph editor selection
- panel focus
- any editor-local UI state

Two graphs are considered to target the same rig if:

- both have the same non-null `rigId`
- or both have `rigId === null`

## Global vs Rig-Scoped Graphs

Graphs with `rigId === null` are considered global.

Global graphs apply to all rigs.

When both global and rig-scoped graphs affect the same rig:

- they participate in the same composition stack
- ordering is determined by `priority`, then `id`

## No Implicit Ordering

Runtime must not infer graph ordering from:

- graph creation order
- array index
- evaluation order
- UI selection

Only authored `priority` and stable `id` ordering are valid.

## Reducer Ownership

Graph composition metadata must be mutated only through graph reducers.

Required reducer-owned fields:

- `enabled`
- `rigId`
- future `priority`
- future `mode`

UI may author these fields by emitting intent only.

## Invariants

The following must remain true:

- runtime evaluation stays deterministic across replay
- graph composition is derived from document truth, not UI state
- graphs do not mutate document truth during evaluation
- graph ordering is stable for identical authored input
- runtime behavior is identical for equivalent event history

## Non-Goals

This policy does not define:

- graph editor UX
- graph creation workflow
- graph templates
- cross-rig orchestration features
- shot/sequence-specific graph activation

Those can build on this policy later.

## Implementation Guidance

When implemented:

1. add graph-level authored fields in canonical document truth
2. extend reducer-owned graph metadata updates
3. sort graphs by `priority` then `id` inside runtime evaluation
4. preserve the current two-stage authority pipeline
5. add runtime tests for multi-graph same-rig ordering and determinism

## Review Question

The only design decision to confirm before implementation is:

Should graph `mode` ever be authored at graph level, or should graph
composition remain fixed at graph tier priority `2` with only `priority`
becoming authored?

My recommendation:

- implement `priority` first
- defer authored graph-level `mode` unless a real use case requires it

That keeps the first composition policy small, explicit, and compatible with the
current runtime contract.
