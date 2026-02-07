# Dropple-OS Architecture Constitution

Version: 1.0.0  
Status: Locked  
Last updated: 2026-02-04

Constitutional precedence:

- `docs/LAW.md`
- `RULES_OF_DROPPLE_OS.md`

Enforcement references:

- `docs/UI-AUTHORITY.md`
- `docs/ESLINT-GUARDRAILS.md`
- `docs/DECISIONS/`

## Purpose

This document defines the non-negotiable architectural contracts for rendering, interaction, and mutation in Dropple-OS.

Dropple-OS is not a canvas toy.  
It is a truth-preserving creative operating system where:

- UI emits intent
- Runtime owns truth
- Rendering is pure projection
- No layer is allowed to "help" by guessing

If any rule in this document is violated, bugs may appear without errors. Those bugs are considered architecture failures, not edge cases.

## Core Principles

### 1) Intent != Truth

- UI never mutates state directly.
- UI never dispatches domain events.
- UI only emits intent.

Flow:

UI -> intent -> resolver -> dispatcher -> reducer -> runtime -> render

If a UI file calls `dispatcher.dispatch(...)`, it is a violation.

### 2) Single Authority Rule

There must be exactly one dispatcher authority per workspace lifecycle.

Rule:

`DispatcherProvider` is owned exclusively by `WorkspaceRoot`.

Violations:

- Creating a dispatcher in canvas code
- Creating a dispatcher in shells
- Creating a dispatcher in tools

### 3) CCM Is the Only Truth

All nodes conform to Canonical Component Model (CCM).

A CCM node:

- Has a stable layout (world coordinates)
- Is exportable to React / HTML / Vue / Angular
- Does not depend on viewport, zoom, or canvas state

Rendering must never mutate or normalize CCM data.

## Rendering Architecture (Critical)

### Rendering Stack

Runtime State (CCM truth)  
-> NodeLayer (iteration only)  
-> NodeRenderer (projection)  
-> NodeView (pure render)

### NodeView Contract (LOCKED)

NodeView must be dumb.

```ts
NodeView({
  node: CCMNode,
  rect: {
    x: number,
    y: number,
    width: number,
    height: number,
  }
})
```

Rules:

- `rect` is already projected into viewport space
- `rect` must never contain `NaN`
- If `rect` cannot be computed -> `NodeView` is not rendered
- `NodeView` performs zero math

Forbidden in NodeView:

- viewport math
- scale logic
- zoom logic
- fallbacks (`??`)
- clamping
- guards against `NaN`

If NodeView contains math, the architecture is broken.

Why this matters:

- Prevents `NaN` layout bugs
- Enables deterministic drag & resize
- Guarantees CCM export correctness
- Allows AI to generate UI safely
- Makes rendering stateless and predictable

### Projection Responsibility

All projection math lives in `NodeRenderer`.

Projection includes:

- world -> viewport transform
- scale application
- pan offset
- zoom tier interpretation

If projection fails:

- `NodeRenderer` does not render
- No fallback is allowed

## Interaction Architecture

### Pointer Ownership

Only `CanvasHost` owns pointer lifecycle.

`pointer.down` / `pointer.move` / `pointer.up`

No other layer may:

- capture pointers
- track drag state
- infer gesture meaning

### Drag & Resize Flow

`NodeView` -> `intent.node.pointerDown`  
-> `nodeDragResolver`  
-> `InputSessionManager`  
-> `session.commit`  
-> `intent.edit.commit`  
-> `dispatcher.dispatch(...)`

`NodeView` does not move nodes.  
`NodeView` does not resize nodes.

## Creation Architecture

### Creation Is Intent-Only

Valid creation flow:

UI -> `intent.node.create`  
-> `nodeCreateResolver`  
-> `dispatcher.dispatch(NODE_CREATE)`

Forbidden:

- emitting `node.create` from UI
- mutating layout directly
- creating nodes in canvas code

## Workspace & Routing Policy

### WorkspaceRoot Authority

All `/workspace/*` routes must be descendants of `WorkspaceRoot`.

Why:

- ensures dispatcher exists
- ensures sessions are attached
- ensures intent resolves to truth

Shells may vary. Authority may not.

### UX vs Design Workspaces

UIUX Workspace:

- Frames represent HTML-truthful layout
- Auto-layout and constraints enforced
- Export-safe by default

Design Workspace:

- Freeform graphics
- Animation allowed
- No HTML guarantees

Both share:

- same runtime
- same dispatcher
- same rendering contracts

## AI Contract (Important)

AI is:

- an assistant
- not an authority

AI must:

- emit intent
- respect constraints
- never bypass resolvers

AI output must always be CCM-valid.

## What This README Prevents

- "Quick fixes" that rot the system
- Hidden `NaN` bugs
- Duplicate dispatchers
- UI mutating truth
- Export-breaking hacks
- AI hallucinating structure

## Status

This document defines Phase-Locked Architecture.

Changes require:

- explicit review
- documented justification
- migration plan

## Final Statement

Dropple-OS chooses truth over convenience.  
Anything that "just works" but violates these rules is considered a bug.

---

## Versioning Policy

This document is versioned.

Breaking changes require:

- a new version number
- an entry in `CHANGELOG.md`
- explicit migration notes

If code and this document disagree, the document wins.
