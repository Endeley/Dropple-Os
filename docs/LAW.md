# Dropple OS — Constitutional Law

This document defines the immutable architectural rules of Dropple OS.

No feature, mode, or subsystem may violate these laws.

---

## 1. Structural Axis (Single Authority Hierarchy)

Dropple enforces a strict vertical layer model:

core -> infrastructure -> runtime -> workspace -> ui -> product

Rules:

- Lower layers may NOT import higher layers.
- Higher layers may import lower layers.
- No circular dependencies.
- All domain directories must be explicitly assigned a layer.

This axis is enforced by `enforceDroppleLaws.cjs`.

---

## 2. Single Mutation Funnel

All authoritative state mutations must pass through:

`runtime/dispatcher/`

Only dispatcher may import:

- `core/events/applyEvent.js`
- `core/events/reducers/`
- `core/mutationContext.js`

No other module may mutate state directly.

There is one mutation throat.

---

## 3. Canonical Replay Path

All replay must pass through:

`dispatcher -> applyEvent -> reducer chain`

There is no alternate reducer pipeline.
There is no parallel truth reconstruction.

Replay determinism depends on this rule.

---

## 4. Canonical Projection Path

There must be exactly one projection entry point.

Derived state must not be duplicated.

Projection is read-only and must not mutate runtime state.

---

## 5. Workspace Authority

Workspace definitions live exclusively in:

`workspaces/registry/`

`WorkspaceDefinition` + `resolveWorkspacePolicy`
is the only canonical mode system.

Modes:

- Do not inject reducers.
- Do not modify runtime state shape.
- Do not alter dispatcher behavior.
- Only define tools, panels, capabilities, and allowed events.

Mode switching must not recreate dispatcher or reset runtime state.

---

## 6. UI Bridge Rule

UI may not import dispatcher directly.

All dispatcher access must occur through:

`ui/interaction/bridges/`

UI components:

- Emit intents.
- Consume projections.
- Do not mutate runtime state directly.

---

## 7. Infrastructure Purity Rule

Infrastructure handles IO only.

It must not:

- Execute replay logic.
- Perform projection.
- Mutate runtime state.
- Import runtime modules.

---

## 8. Deterministic Enforcement

All architectural constraints are enforced by:

`enforceDroppleLaws.cjs`

This script may not be weakened without constitutional amendment.

---

## 9. Amendment Procedure

Changes to:

- Layer hierarchy
- Mutation funnel
- Replay path
- Projection model
- Workspace authority system

require deliberate architectural review.

No casual modifications allowed.

---

## 10. SceneGraph Invariants (v1)

SceneGraph is canonical narrative structure.

Rules:

- Shots may not overlap inside a Scene (v1 constraint).
- Scene duration must be >= last shot end.
- Camera keyframes must be within shot duration.
- compositionId must exist in project.compositions.
- Scene order defines render order.
- activeShotId must belong to activeSceneId.
- activeShotId must not be null if the active scene has shots.
- Scene without shots may set activeShotId to null.
- If activeSceneId changes, activeShotId must be updated accordingly.

No runtime enforcement yet.

---

Dropple has:

One truth.
One mutation path.
One replay path.
One projection path.
One structural axis.

This law defines the system.
