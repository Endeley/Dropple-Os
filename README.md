# Dropple OS

Creative Intelligence Platform (CIP)

This repository contains the core operating system for Dropple:
- deterministic engines
- workspace contracts
- event-driven runtime
- AI as an amplifier, not the OS

Deployment strategy: see `docs/deployment-strategy.md`.

Phase 0: Spine bootstrap.

## Core

OS-level primitives:
- contracts
- events
- reducers
- history

No UI.  
No state libraries.  
No side effects.

## Engine

Pure deterministic logic.

Rules:
- no React
- no Zustand
- no Convex
- no AI

Input → Output only.

## Runtime

Live project state.

Contains:
- Zustand stores (later)
- sync layers
- registries

No rendering logic.

## Workspaces

Workspace modules.

Each workspace:
- declares engines
- declares tools
- declares panels
- does NOT own core logic.

## AI Layer

AI is an amplifier.

It:
- suggests
- plans
- critiques
- generates blueprints

It NEVER mutates state directly.

## UI

All React UI lives here.

Shells, panels, canvas UI, tools.

## App

Next.js routing layer.

Thin shells only.


📌 What we have officially completed (for the record)


✔ Phase 1 — Core OS Spine

Deterministic event system

Reducers only mutate state

MessageBus → Dispatcher → Runtime

Undo / Redo via history stack

✔ Phase 2 — Runtime ↔ Zustand Bridge

Runtime is the source of truth

Zustand is a read mirror

No direct mutations from UI

✔ Phase 3 — Canvas → Event Emission

Canvas emits events only

Pointer math isolated with useRef

No illegal React mutations

Drag → NODE_MOVE event flow verified
