# PROJECTION_LAYER_V1 — FROZEN CONTRACT

Status: FROZEN
Version: v1
Date: 2026-02-17

Projection v1 is the only public runtime API exposed to UI.

---

## Purpose

Projection exists to:

- Shape runtime state
- Sanitize runtime internals
- Stabilize public runtime contracts
- Prevent UI from importing runtime/state directly
- Prevent UI from importing dispatcher
- Prevent UI from importing reducers

Projection is read-only.

Projection cannot:
- Mutate runtime
- Import dispatcher
- Import reducers
- Import core/events/applyEvent
- Import runtime/state except explicitly allowed internal entry points

---

## Public API Surface (v1)

UI is allowed to import ONLY from:

runtime/projection

Which currently re-exports:

- getRuntimeSnapshot()
- getWorkspaceProjection()
- getActiveWorkspace()
- useWorkspaceProjection()
- selectViewport()
- selectCanvasSurface()
- selectNodes()
- evaluateTimelinePreview()
- runtimeBridgeBus (read-only emitter)

This list is frozen.

Any addition requires:
- Version bump (v2)
- Documentation update
- Enforcement rule update

---

## Forbidden

UI must NOT import:

- runtime/state/*
- runtime/dispatcher/*
- core/events/*
- runtime/projection/v1/internal/*

Projection must NOT import:

- runtime/dispatcher/*
- core/events/reducers/*
- core/events/applyEvent.js

---

## Migration Rule

If runtime internals change,
Projection adapts.

UI must never adapt to runtime internals.

---

Projection v1 is considered stable.
Future changes require v2 namespace.
