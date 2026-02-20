# Projection Layer V1

Status: Locked  
Last updated: 2026-02-17

## Purpose

The Projection Layer is the only sanctioned boundary from Runtime to UI.
It exposes read-only runtime state and projection signals.
It never mutates truth.

## Direction

Runtime -> Projection -> UI

## Rules

- Read-only. No mutation authority.
- No dispatcher imports.
- No reducers or CCM imports.
- No UI imports.
- May subscribe to runtime state and emit outward.
- May expose selectors, adapters, and projection-only event buses.

## Allowed Examples

- `runtime/projection/zustandBridge.js`
- `runtime/projection/selectRenderState.js`
- `runtime/projection/runtimeBridgeBus.js`

## Forbidden Examples

- Dispatching domain events
- Translating intent into mutations
- Importing `ui/**`

## Rationale

Projection is transport, not decision-making.
If this layer mutates, you create hidden side-channels and break determinism.
