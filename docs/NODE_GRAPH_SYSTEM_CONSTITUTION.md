# Node Graph System Constitution

Version: 1.0.0  
Status: Draft  
Last updated: 2026-04-24

Constitutional precedence:

- `docs/LAW.md`
- `docs/architecture/README.md`
- `docs/DECISIONS/003-ccm-node-truth.md`
- `docs/architecture/ccm.md`

Primary code references:

- `core/events/reducers/nodeReducers.js`
- `core/events/reducers/nodeStructureReducers.js`
- `runtime/scene/evaluateSceneIncremental.js`
- `runtime/scene/buildDependencyGraph.js`
- `ui/canvas/NodeLayer.jsx`
- `ui/NodeView.jsx`

## Purpose

This document defines the non-negotiable architectural model for Dropple's node graph system.

It exists so contributors, reviewers, and code-generating assistants all work from the same model:

- what node truth is
- where mutation is allowed
- which graphs are durable vs derived
- how layout and motion relate to node truth
- what UI and rendering are forbidden to do

If this document is violated, Dropple stops being a deterministic creation operating system and becomes an unreliable canvas application.

## Core Statement

Dropple does not have "just a node graph."

Dropple has:

1. a canonical durable node truth
2. reducer-owned mutation into that truth
3. runtime-derived evaluation graphs around that truth
4. read-only projection into UI and export

The canonical durable node truth is:

- `document.sceneGraph`

Everything else is derived from it.

## Constitutional Rule

`document.sceneGraph` is the only durable node truth.

This means:

- rendering projects from it
- exporters compile from it
- layout evaluation reads from it
- motion evaluation applies against it
- runtime graphs derive from it

This does **not** mean:

- the canvas owns truth
- viewport state owns truth
- rendered rectangles own truth
- runtime caches own truth
- AI-generated UI may invent alternative node authority

## The Four Layers

### 1. Canonical Truth Layer

The canonical node world lives in:

- `state.document.sceneGraph`

This layer defines:

- node identity
- parent/child structure
- node type
- durable content and props
- root ownership
- scene membership where applicable

This layer is durable and replayable.

### 2. Mutation Layer

Node truth may only change through:

- intents
- dispatcher
- reducers
- canonical events

Mutation ownership lives in:

- `core/events/reducers/nodeReducers.js`
- `core/events/reducers/nodeStructureReducers.js`

UI must never mutate node truth directly.

### 3. Runtime Derivation Layer

The runtime may derive graphs and indexes from canonical truth in order to evaluate the scene efficiently.

These include:

- dependency graphs
- segment graphs
- partition graphs
- layout root indexes
- spatial indexes
- evaluation layers

These structures are runtime artifacts.

They are not durable truth.

### 4. Projection Layer

UI and rendering consume already-derived truth through projection.

Projection may:

- transform world coordinates into viewport space
- expose read models
- provide render-safe values

Projection may not:

- mutate node truth
- normalize bad truth silently
- invent domain truth inside UI

## Durable Truth vs Derived Graphs

This distinction is the central law.

### Durable Truth

Durable truth includes:

- `document.sceneGraph`
- document slices intentionally persisted alongside it

Examples:

- node structure
- node props
- node content
- root ids
- scene graph membership

### Derived Graphs

Derived graphs are runtime computation artifacts.

Examples:

- dependency graph from `runtime/scene/buildDependencyGraph.js`
- evaluation ordering from `runtime/scene/evaluateSceneIncremental.js`
- partition and visibility graphs
- spatial indexes
- layout root indexes

Derived graphs must be:

- recomputable
- deterministic
- disposable
- non-authoritative

If a derived graph must be persisted to make Dropple work, the architecture is wrong.

## Mutation Law

All node mutation must obey this chain:

UI -> intent -> bridge/resolver -> dispatcher -> reducer -> document truth

Examples of lawful node mutation:

- `node/create`
- `node/update`
- `node/delete`
- content update events
- props update events

Examples of unlawful mutation:

- editing `document.sceneGraph` in UI
- editing `document.sceneGraph` in a render component
- writing node coordinates straight into runtime caches
- bypassing reducers because "it is only visual"

## Layout Law

Layout is authoritative, but it is not freeform node mutation.

In Dropple:

- node structure truth lives in `document.sceneGraph`
- layout truth lives in the layout document slice
- layout evaluation is runtime work

This separation is deliberate.

Contributors must not treat position and size as loose, ad hoc node fields.

Important consequence:

- positional patches must flow through layout ownership
- generic node update must not become a side door for layout corruption

## Motion Law

Dropple is motion-first.

That means almost nothing in Dropple is truly static.

The correct interpretation is:

- static is a zero-motion state
- motion is not a Media-only addon
- motion is a platform capability

But motion still does not replace canonical node truth.

Motion must:

- read canonical truth
- evaluate temporal change lawfully
- apply transforms through runtime evaluation
- remain replayable and deterministic

Motion must not:

- replace `document.sceneGraph` as source truth
- mutate node truth directly from render code
- invent a second scene authority

Media owns the deepest motion authoring surface.
The runtime owns motion execution.
All workspaces may consume motion lawfully.

## Rendering Law

Rendering is not part of truth mutation.

Rendering responsibilities:

- read projected values
- render pure views
- emit user intent

Rendering must never:

- mutate nodes
- patch layout
- "fix" broken truth
- derive durable truth from viewport state

Node rendering exists downstream of canonical truth, not upstream of it.

The render stack must remain:

Runtime Truth -> Projection -> Render

Not:

Render -> Local Guess -> Truth

## Export Law

Exporters compile from canonical truth and lawful runtime evaluation.

They do not compile from:

- DOM state
- random UI component props
- viewport-only geometry
- canvas-only local calculations

If export depends on UI-local state rather than canonical truth, Dropple loses trust.

## Contributor Rules

Every contributor must understand these rules before touching scene, layout, or motion code.

### Allowed

- add reducer-owned node mutation through events
- derive runtime graphs from canonical truth
- add projection selectors
- add render components that consume projected values
- add tests for replay and determinism

### Forbidden

- mutate `document.sceneGraph` outside reducers
- store viewport-derived geometry as durable node truth
- treat runtime caches as canonical data
- compute domain truth inside UI components
- create a second node authority for a specific workspace or mode

## Codegen Rules

Any AI or code-generation system producing Dropple code must follow these rules:

1. Never mutate `document.sceneGraph` outside reducer ownership.
2. Never write viewport math into canonical node truth.
3. Never compute domain truth inside UI or render components.
4. Never bypass dispatcher and event flow.
5. Never treat dependency, segment, partition, or spatial graphs as durable truth.
6. Never create a new workspace-local node model if `document.sceneGraph` already owns the concept.

If a generated patch violates any of these, it must be rejected.

## Mental Model for New Contributors

If you remember only one statement, remember this:

> Dropple's node system is a canonical scene graph plus reducer-owned mutation and runtime-derived evaluation graphs.

Or in shorter form:

> `document.sceneGraph` is truth. Everything else is computation around it.

## Recommended Reading Order

New contributors should read these files in order:

1. `docs/architecture/ccm.md`
2. `docs/DECISIONS/003-ccm-node-truth.md`
3. `core/events/reducers/nodeReducers.js`
4. `core/events/reducers/nodeStructureReducers.js`
5. `runtime/scene/evaluateSceneIncremental.js`
6. `ui/canvas/NodeLayer.jsx`
7. `ui/NodeView.jsx`

## Final Rule

Dropple's node graph system is not a convenience data structure.

It is the operating core of the product.

If contributors understand this system correctly, the platform can scale across Design, Media, Build, System, and Collaborate without splitting truth.

If they misunderstand it, every workspace will slowly invent its own fake authority.

That must never happen.
