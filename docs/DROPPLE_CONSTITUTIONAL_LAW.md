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

## 9. No Temporary Authority Paths

Dropple does not implement temporary authority paths.

If a system is introduced:

- its ownership model must already be lawful
- its execution semantics must already be deterministic
- its orchestration boundaries must already be canonical
- its layering must already obey constitutional hierarchy

Otherwise:

- the feature waits

Forbidden:

- temporary authority paths
- compatibility orchestration inside canonical runtime systems
- "we will clean it later" execution branches
- dual authority systems
- shadow execution semantics
- fallback mutation paths
- UI-side emergency orchestration

This law applies every time Dropple implements, optimizes, or upgrades a system.

Authority may converge by family, but never by temporary patch.

---

## 10. Execution Provenance Law

Execution provenance must be:

- deterministic
- immutable
- reconstructible
- replay-safe

Execution identity must not depend on:

- machine order
- worker timing
- queue timing
- retry timing
- thread scheduling
- transport order
- execution locality

Resumed execution and uninterrupted execution must preserve canonical execution identity.

Execution coordination systems may not mutate:

- manifest truth
- session truth
- authored runtime truth

Queues, executors, checkpoints, workflow records, and future distributed coordinators are coordination systems, not hidden authority layers.

This law protects deterministic execution identity without prescribing queue topology, transport design, or worker mechanics.

---

## 11. Interpreted Tool Non-Sovereignty Law

Interpreted tools may express intent.

Interpreted tools may not own authority.

Interpreted tool systems may not directly import:

- dispatcher internals
- reducer internals
- runtime state setters
- tool-registration mutation paths

Interpreted tools may not:

- register tools directly
- mutate runtime truth directly
- elevate capability authority
- bypass workspace policy
- bypass dispatcher
- recursively synthesize tool-owned authority

Tool synthesis must remain capability-bounded, dispatcher-owned, and replay-safe.

If interpreted tool synthesis cannot obey these boundaries, the synthesis feature waits.

---

## 12. Amendment Procedure

Changes to:

- Layer hierarchy
- Mutation funnel
- Replay path
- Projection model
- Workspace authority system

require deliberate architectural review.

No casual modifications allowed.

---

Dropple has:

One truth.
One mutation path.
One replay path.
One projection path.
One structural axis.

This law defines the system.
