# Dropple Animation v1 — Locked Contract

## Scope
Animation v1 supports 2D layout-based animation with derived-only rigs,
constraints, attachments, and UI-only authoring.

No bones, IK, deformation, or mesh animation in v1.

---

## Authoritative Truth
- Runtime truth lives in the dispatcher + reducers.
- Animation preview is ALWAYS derived-only.
- No animation evaluation mutates runtime truth.

---

## Canonical Animation Model
- timeline.animations = { clips, tracks, keyframes }
- time unit: milliseconds (timeMs)
- properties supported:
  - layout.x
  - layout.y
  - layout.width
  - layout.height
  - rotation

---

## Evaluation
- Canonical entry point: evaluateAnimationAtTime
- Pure, deterministic, side-effect free
- Preview and playback use the same evaluator

---

## Rig System (v1)
- Characters are flat (no nesting)
- A node belongs to at most one character
- Constraints are derived-only:
  - follow
  - pin
  - aim
- Constraints apply AFTER animation evaluation

---

## Attachments
- Props attach via sockets
- Attachments are derived-only
- Props cannot be character roots or parts

---

## UI Guarantees
- Inspector is the sole authoring surface
- All authoring flows through intents
- UI never mutates runtime truth directly

---

## Explicit Non-Goals
- Bones / skeletons
- IK
- Mesh deformation
- Real-time collaboration
