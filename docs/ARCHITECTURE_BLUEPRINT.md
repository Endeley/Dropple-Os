# Dropple Architecture Blueprint

Version: v1  
Status: Living document  
Scope: System architecture overview

## 1. What Dropple Is

Dropple is a deterministic event-sourced creative operating system.

It is not just a design editor.

Dropple transforms visual editing into deterministic runtime state that can compile into real software.

Visual Editing  
↓  
Deterministic Runtime  
↓  
Framework-Agnostic IR  
↓  
Production Software

Target outputs:
- React
- Vue
- Angular
- HTML/CSS
- Future:
- Flutter
- SwiftUI
- Jetpack Compose

## 2. Core Design Principles

Dropple is built around several non-negotiable principles.

Determinism  
Same seed + same event log  
= identical runtime state  

Across machines and environments.

Event Sourcing

State is derived from events.

Event Log  
↓  
Reducers  
↓  
Runtime State

Events are immutable.

Structural Editing

Dropple edits relationships, not just pixels.

Examples:
- rows
- columns
- grids
- layout containers
- component structures

Runtime Authority

Runtime is the only system allowed to mutate state.

UI  
↓  
intent  
↓  
runtime  
↓  
dispatcher  
↓  
reducers

## 3. System Layers

Dropple is divided into strict architectural zones.

core  
↓  
infrastructure  
↓  
engine  
↓  
runtime  
↓  
workspace  
↓  
ui  
↓  
product

Each layer has defined responsibilities.

## 4. Core Layer

Location:

core/

Core defines the constitutional foundation.

Responsibilities:
- contracts
- schemas
- event types
- system laws
- invariants

Examples:
- core/events
- core/contracts
- core/schema

Core contains no runtime logic.

## 5. Engine Layer

Location:

engine/

Engine contains pure deterministic computation.

Rules:
- no side effects
- no runtime imports
- no UI imports
- no global state

Engine subsystems:

Geometry  
transform math  
bounds calculations  
coordinate systems

Snap Engine  
grid snapping  
alignment snapping  
snap candidate evaluation

Alignment Engine  
align left  
align center  
align right  
distribution  
spacing

Spatial Index  
spatialBounds  
spatialGrid  
spatialQuery  
spatialIndex  

Used to accelerate spatial queries.

Guide Engine

Detects layout relationships.

Examples:
- distance guides
- spacing guides
- alignment clusters
- grid patterns
- symmetry axes

Layout Inference

Detects layout patterns.

rows  
columns  
stacks  
grids

Layout Conversion

Converts inferred layouts into auto-layout containers.

free nodes  
↓  
layout inference  
↓  
convertLayout  
↓  
autoLayout container

Timeline Engine

Handles animation timelines.

Includes:
- timeline evaluation
- track ordering
- channel blending
- snapshot DAG
- history system

## 6. Runtime Layer

Location:

runtime/

Runtime is the authoritative state machine.

Responsibilities:
- dispatcher
- reducers
- runtime state
- session bridges
- frame pipeline
- layout pass
- projection
- deterministic replay

Dispatcher  
runtime/dispatcher/  

Single mutation gate.

event  
↓  
dispatcher  
↓  
reducers  
↓  
state

No other system may mutate state.

Runtime State

Runtime state represents the current document.

Examples:
- nodes
- scene graph
- selection
- timeline
- layout containers

Session System

Interactive editing is handled by sessions.

MoveSession  
ResizeSession  
RotateSession

Sessions produce preview transforms only.  
Commit occurs via dispatcher.

Frame Pipeline

Responsible for generating renderable frame data.

Typical pipeline:

runtime state  
↓  
selection overlay  
↓  
spatial index  
↓  
guide computation  
↓  
layout inference  
↓  
preview transforms  
↓  
renderer

Layout Pass

Location:

runtime/layout/applyLayoutPass.js

Executes auto-layout rules.

container  
↓  
layout rules  
↓  
child positions

## 7. Workspace Layer

Location:

workspace/

Workspaces define the editing environment.

Examples:
- design workspace
- animation workspace
- component workspace

Workspaces may define:
- tools
- panels
- capabilities
- interaction bindings

Workspaces may NOT modify runtime structure.

## 8. UI Layer

Location:

ui/

UI provides the interaction surface.

Responsibilities:
- render panels
- capture user input
- display guides
- display overlays
- emit intents

UI must never mutate runtime state directly.

Instead:

UI  
↓  
intent  
↓  
bridge  
↓  
runtime dispatcher

## 9. Product Layer

Location:

app/

Product layer defines the user experience around the editor.

Examples:
- gallery
- marketplace
- education
- certification
- profiles
- viewer

This layer is outside the editor kernel.

## 10. Spatial Intelligence System

Dropple contains a spatial reasoning layer.

pointer move  
↓  
spatial index  
↓  
guide detection  
↓  
layout inference

Detected relationships:
- distance
- spacing
- alignment
- grid structure
- symmetry

## 11. Layout System

Dropple layout lifecycle:

free nodes  
↓  
layout inference  
↓  
suggestion overlay  
↓  
layout conversion  
↓  
autoLayout container  
↓  
layout pass

Interaction rules:
- move child → reorder slots
- resize child → blocked
- resize container → allowed
- edit gap → container property

## 12. Structural Editing (Planned)

Structural editing allows editing layout structures directly.

Examples:
- row resizing
- column reordering
- grid editing
- gap adjustment

Instead of manipulating individual node positions.

## 13. Collaboration System

Location:

collab/

Supports real-time editing.

Includes:
- event envelopes
- lamport clock
- presence
- conflict filtering
- optimistic updates

## 14. Determinism Guarantees

Dropple enforces determinism through:
- runtime replay tests
- determinism gate
- state hash verification
- timeline tests
- export stability gate
- template verification
- architecture audit

## 15. Architecture Enforcement

Architecture rules are enforced by:

enforceDroppleLaws.cjs

This script verifies:
- zone imports
- dispatcher authority
- mutation boundaries

Violations fail the build.

## 16. Future Systems

Planned future systems include:
- Structural Editing Engine
- Interaction Prediction Engine
- Component System
- Design System Compiler
- Cross-framework export engine

## Closing

Dropple is designed to be a deterministic creative operating system, not merely a design tool.

Its architecture ensures:
- deterministic behavior
- replayable editing
- structural consistency
- long-term maintainability

This blueprint defines the system map that guides Dropple’s evolution.
