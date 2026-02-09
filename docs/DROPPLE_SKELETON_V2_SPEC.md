🧾 DROPPLE — SKELETON v2

Authoritative Written Specification (Draft 1)

Status: PROPOSED
Becomes LOCKED only after your explicit sign-off.

This document is the single source of truth.
Code will be a translation of this — never the other way around.

0. Purpose of Skeleton v2

Skeleton v2 defines the minimum complete system required for Dropple to:

operate deterministically

scale across modes

support AI safely

export its state losslessly

evolve to v3+ without rewrites

Skeleton v2 deliberately excludes features that do not affect structural truth.

1. Normative Language

In this document:

MUST = mandatory, invariant
SHOULD = strongly recommended
MAY = optional, non-breaking

1. Foundational Axioms

These axioms are immutable from v2 onward.

AXIOM 1 — Single World Reality

Dropple maintains one authoritative world state.

No mode

No tool

No AI process
may fork, shadow, or partially override this world.

AXIOM 2 — Canvas Is a Projection

The canvas is a pure projection layer.

It renders world state

It never owns state

It never mutates truth

Viewport changes perception, not reality.

AXIOM 3 — Everything Is a Node

All meaningful entities in Dropple are nodes or are derived from nodes.

This includes:

visual elements

frames & groups

AI artifacts

references

exports

AXIOM 4 — Intents Are the Only Mutation Path

All mutations occur through validated intents.

UI emits intents

AI emits intents

System emits intents

No direct mutation is permitted.

AXIOM 5 — Modes Restrict, They Do Not Fork

Modes alter permissions and affordances, not data models.

The same nodes exist across all modes.

2. World & Coordinate System
Definition

Dropple operates in an infinite 2D world space.

World Space ≠ Screen Space

Properties

Origin (0,0) is absolute and immutable

World units are abstract, resolution-independent

Precision is deterministic at all zoom levels

Guarantees

Identical world data always renders identically

Zoom never affects stored geometry

World coordinates MUST be stored as floating-point numbers with deterministic precision guarantees across platforms.

3. Viewport & Projection System
Responsibility

The viewport defines how the world is observed.

State
ViewportState:
- x (world offset)
- y (world offset)
- scale (zoom factor)

Rules

Viewport state never mutates world state

Multiple viewports may exist in future versions

All visual layers subscribe to viewport state

4. Surface System
Purpose

Surfaces provide visual orientation only.

Examples:

grid dots

smooth background

guides

origin markers

Constraints

Surfaces are read-only

Surfaces depend only on viewport state

Surfaces never access nodes

This guarantees surfaces are non-interactive and non-authoritative.

5. Node Model (Canonical)
Definition

A node is the smallest authoritative unit of meaning.

Required Shape
Node:
- id (globally unique)
- type (semantic category)
- transform (world transform)
- props (type-specific data)
- meta (system metadata)

Transform
WorldTransform:
- position (x, y)
- rotation
- scale

Meta
NodeMeta:
- createdAt
- updatedAt
- createdBy
- locked (optional)
- modeConstraints (optional)

NodeType is an open, extensible set. The core system MUST NOT hardcode assumptions about specific node types.


No node may exist outside this structure.

6. Node Graph & Relationships
Definition

Relationships between nodes are explicit and typed.

Edge:
- from (NodeID)
- to (NodeID)
- type (parent | reference | flow)

Rules

No implicit relationships

Graph must remain acyclic for parent edges

Other edge types may be cyclic

This enables grouping, flows, reasoning, and export.

7. Intent & Dispatcher System
Intent

An intent is a request to mutate state.

Intent:
- type
- payload
- origin (ui | ai | system)

Dispatcher Responsibilities

validate intent

enforce mode rules

apply mutation

emit history entry

reject invalid actions

Rule

State mutation outside the dispatcher is forbidden.

The dispatcher MUST be the only authority allowed to mutate world, node, edge, selection, or history state.

8. Mode System
Definition

A mode is a policy layer.

Mode:
- id
- allowedIntents
- uiOverlays

Behavior

Dispatcher enforces mode rules

UI reflects allowed actions

Nodes remain unchanged across modes

Modes are declarative, not procedural.

9. Selection & Focus Model
Purpose

Selection defines user and AI context.

SelectionState:
- selectedNodeIds
- focusNodeId (optional)

Rules

Selection is global

Focus is exclusive

Hover is transient and non-authoritative

Selection state may be referenced by tools, inspectors, and AI.

10. History & Time Semantics
Rule

History is intent-based, not snapshot-based.

HistoryEntry:
- intent
- before
- after
- timestamp

Guarantees

Undo reverses intent effects

Redo replays intents

History is deterministic

11. Export & Specification Contract
Dropple Spec Output

Every workspace must be exportable as:

DroppleSpec:
- version
- world
- nodes
- edges
- modes
- metadata

Authoritative-Only Export Rule

Only authoritative state is included in DroppleSpec. The following are explicitly non-authoritative and MUST NOT be exported:

SelectionState

History / HistoryEntry

ViewportState

Surface configuration

Export Guarantees

No loss of semantic meaning

No UI artifacts included

Suitable for machines and humans

This is the foundation for:

code generation

documentation

AI analysis

cross-tool interoperability

12. Explicit Non-Goals of Skeleton v2

The following are out of scope and MUST NOT influence v2:

real-time collaboration

permissions & roles

monetization

marketplace

AI autonomy

cloud sync

They will layer cleanly in v3+.

13. Versioning & Lock Rule

Skeleton v2 becomes immutable once signed off

Future changes require a new skeleton version

Code must conform to the spec, not reinterpret it
