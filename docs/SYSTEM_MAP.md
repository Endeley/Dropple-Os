# Dropple System Map

Status: Stable architectural map  
Authority level: Informational (subordinate to `docs/LAW.md`)  
Purpose: Define permanent subsystems and their roles

---

## Purpose

This document defines the permanent subsystem map of Dropple.

It answers:

- what systems exist
- where they live
- what they are allowed to do
- what they must never do

This document should remain stable across phases.

---

## Constitutional Principle

Dropple evolves through derivation, not replacement.

Subsystems are:

- finite
- stable
- layered
- law-bound

---

## Structural Axis (Active Law)

`core -> infrastructure -> runtime -> workspace -> ui -> product`

No subsystem may violate this axis.

---

# Core Subsystems

## 1. Mutation System

Location:
- `runtime/dispatcher/`
- `core/events/`

Purpose:
- single mutation funnel
- event application
- reducer execution

Rules:
- only dispatcher mutates state
- no direct mutation anywhere else

---

## 2. Replay System

Location:
- `runtime/dispatcher/`
- replay utilities

Purpose:
- deterministic reconstruction of state

Rules:
- must produce identical output for identical input
- no alternate replay path

---

## 3. Projection System

Location:
- `runtime/projection/`

Purpose:
- read-model generation
- UI consumption layer

Rules:
- read-only
- no mutation authority

---

## 4. Capability System

Location:
- `platform/capabilities/`
- `runtime/workspaces/workspaceCapabilities.js`
- `ui/workspace/capabilities/`

Purpose:
- gate access to behavior
- expose tools, panels, actions

Rules:
- capability controls exposure, not mutation
- must not bypass dispatcher

---

## 5. Workspace & Mode System

Location:
- `platform/workspaces/`
- `workspaces/registry/`

Purpose:
- classify creative context
- expose surfaces

Constitution:
- 5 fixed workspaces
- 15 canonical modes after collapse
- overlays for specialization

Rules:
- no runtime mutation logic
- no dispatcher ownership
- no new sovereign workspaces

---

## 6. Overlay System

Location:
- `platform/workspaces/overlayRegistry.js`

Purpose:
- preserve collapsed mode payloads
- enable specialization without expanding sovereignty

Types:
- capability overlays
- payload overlays

Rules:
- overlays enrich, never replace
- overlays do not create new authority

---

## 7. Certified Seed System

Location:
- `engine/templates/`
- `domain/templates/`

Purpose:
- compile deterministic creative seeds
- enable installable creative starting points

Includes:
- template compiler
- certification
- registry

Rules:
- seeds must be replayable
- seeds must be certified
- seeds must not inject runtime authority

---

## 8. Seed Lineage System (Phase 3)

Location:
- `domain/templates/TemplateSeedLineageGraph.js` (planned)

Purpose:
- track ancestry of creative seeds

Includes:
- fork
- merge
- derivation

Rules:
- no cycles
- lineage must be verifiable

---

## 9. Environment System (Phase 4)

Location:
- `platform/capabilities/workspaceActivation.js`

Purpose:
- activate workspace plus seed overlays

Includes:
- capability overlays
- panel overlays
- tool overlays

Rules:
- canonical workspace activates first
- seed overlays apply second
- overlays are additive only

---

## 10. Tool System

Location:
- `runtime/tools/`
- `runtime/input/`

Purpose:
- user interaction execution

Current:
- handler-based tools

Future:
- interpreted tool specs

Rules:
- tools emit intents
- tools do not mutate state directly
- generated tools must be bounded

---

## 11. Tool Synthesis System (Phase 5)

Location:
- `runtime/tools/interpretToolSpec.js` (planned)

Purpose:
- allow generation of tools from specs

Rules:
- no arbitrary code execution
- must map to approved handler families
- must remain capability-gated

---

## 12. Creative Physics System (Phase 6)

Location:
- `runtime/frame/`
- `runtime/animation/`
- `runtime/scene/`

Purpose:
- produce emergent creative behavior

Examples:
- constraints
- procedural motion
- forces

Rules:
- evaluator-only
- must not mutate durable truth

---

## 13. Knowledge System (Phase 7+)

Location:
- future

Purpose:
- assist creation

Includes:
- semantic systems
- learning overlays
- reasoning engines

Rules:
- no mutation authority
- no bypass of dispatcher

---

## 14. OS Surface System (Final Phase)

Location:
- `ui/`
- product layer

Purpose:
- expose Dropple as an operating system

Includes:
- workspace switching
- seed launching
- environment orchestration

Rules:
- UI remains projection-only
- no execution authority

---

## Final Principle

Dropple is composed of:

- one mutation system
- one replay system
- one projection system
- many derived systems

Derived systems may evolve infinitely.

Core systems must remain finite.

---

## Final Statement

Dropple is a lawful system of:

- deterministic truth
- bounded generation
- infinite creative derivation

No subsystem may violate that.
