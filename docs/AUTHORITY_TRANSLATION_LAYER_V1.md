# Authority Translation Layer V1

Status: Locked  
Last updated: 2026-02-17

## Purpose

Authority translators convert UI intent or session output into domain events.
They are the only UI-adjacent code allowed to call the dispatcher.

## Direction

UI -> Authority Translation -> Dispatcher -> Reducers -> Runtime

## Rules

- May import dispatcher authority.
- May translate sessions or intents into domain events.
- Must not import UI rendering components.
- Must not import runtime projection internals.
- Must not bypass the dispatcher.

## Allowed Locations

- `ui/interaction/bridges/**`
- `ui/interaction/*Resolver.js`
- `ui/timeline/*Bridge.js`

## Example

- `ui/interaction/bridges/attachSessionCommitBridge.js`

## Rationale

This layer is the single, explicit gateway for mutation.
If translation leaks into runtime or projection, architecture drifts and invariants break.
