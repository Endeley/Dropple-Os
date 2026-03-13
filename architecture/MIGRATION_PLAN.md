# Migration Plan

This document maps the current Dropple repository to the target architecture and defines the safe refactor order.

Use it as an execution plan, not as a speculative redesign.

## Goals

- converge on the target layer structure without breaking architecture law
- preserve deterministic behavior during moves
- keep import boundaries, truth boundaries, and capability boundaries enforced while refactoring

## Status Model

- `already aligned`
- `needs consolidation`
- `do not move yet`
- `safe first refactor`

## Already Aligned

### Kernel Law

Current files:

- `core/events/eventTypes.js`
- `core/events/applyEvent.js`
- `core/events/reducerOwnership.js`
- `core/events/reducers/index.js`
- `runtime/dispatcher/dispatch.js`

Why this is aligned:

- dispatcher-driven mutation is already enforced
- reducer ownership is already machine-checked
- truth mutation is already constrained to reducer execution

Target fit:

- matches the target kernel behavior now
- physical folder placement can be refined later

### Architecture Law and Guards

Current files:

- `core/architecture/LAYER_CONTRACTS.md`
- `architecture/TRUTH_BOUNDARIES.md`
- `enforceDroppleLaws.cjs`
- `tests/architecture/truthBoundaryImports.test.ts`
- `tests/architecture/reducerOwnership.test.ts`
- `tests/architecture/derivedCacheRegistry.test.ts`

Why this is aligned:

- layer law exists
- truth law exists
- import boundaries are enforced
- reducer ownership is enforced
- derived cache registration is enforced

### Runtime Truth and Projection

Current files:

- `runtime/state/runtimeState.internal.js`
- `runtime/projection/zustandBridge.js`
- `runtime/stores/useRuntimeStore.js`
- `runtime/projection/index.js`

Why this is aligned:

- runtime truth is separated from projection
- UI reads through projection/store bridges
- non-bridge UI runtime coupling is now restricted

### Platform Capability Layer

Current files:

- `platform/capabilities/capabilityRegistry.js`
- `platform/capabilities/capabilityResolver.js`
- `platform/capabilities/capabilityContext.js`
- `platform/capabilities/workspaceActivation.js`
- `platform/capabilities/workspaceRegistryBridge.js`

Why this is aligned:

- capability resolution exists
- workspace activation is capability-driven
- plugin access already routes through capability-facing APIs

### Workspace Registry and Activation Surface

Current files:

- `platform/workspaces/workspaceRegistry.js`
- `platform/workspaces/workspaceEngine.js`
- `platform/workspaces/canvasSurfacePolicy.js`
- `platform/workspaces/index.js`
- `ui/bridges/workspaceActivationFacade.js`

Why this is aligned:

- there is now a canonical platform-owned workspace surface
- direct UI imports of `workspaces/registry` have been removed
- non-workspace modules are now blocked from importing workspace registry internals directly

### Plugins

Current files:

- `platform/plugins/pluginHost.js`
- `platform/plugins/pluginSandbox.js`
- `platform/plugins/pluginAPI.js`
- `plugins/**`

Why this is aligned:

- plugin host and sandbox are already established
- plugin architecture is already under boundary enforcement

### Collaboration

Current files:

- `platform/collaboration/collaborationSession.js`
- `platform/collaboration/eventSyncEngine.js`
- `platform/collaboration/presenceRuntime.js`
- `platform/collaboration/cursorRuntime.js`
- `platform/collaboration/conflictResolver.js`

Why this is aligned:

- collaboration already follows dispatcher law
- remote events already re-enter through canonical mutation paths

### AI Runtime

Current files:

- `ai/runtime/aiRuntime.js`
- `ai/runtime/aiSelectors.js`
- `core/events/reducers/aiReducers.js`
- `ai/__tests__/runtimeGeneration.test.mjs`

Why this is aligned:

- AI acts through events and runtime state
- AI is tracked in architecture status as integrated

### Selectors and Projection Read Models

Current files:

- `runtime/projection/selectors/runtimeSelectors.js`
- `runtime/projection/selectors/sceneSelectors.js`
- `runtime/projection/selectors/appSelectors.js`
- `runtime/projection/selectors/index.js`
- `runtime/projection/index.js`

Why this is aligned:

- selectors now have a canonical projection-layer home
- app, scene, and runtime selectors are exposed through a stable barrel
- non-core modules are blocked from importing legacy selector entrypoints directly

### Persistence and Replay Surface

Current files:

- `core/persistence/documentEnvelope.js`
- `core/persistence/replayEngine.js`
- `core/persistence/hashDocument.js`
- `core/persistence/index.js`

Why this is aligned:

- the canonical persistence surface now exists in `core`
- replay/hash callers have already started migrating to it
- canonical document-envelope helpers now define the persisted shape

## Needs Consolidation

### Runtime Folder Shape

Current state:

- runtime subsystems are correct functionally but spread across mixed historical paths

Examples:

- scene evaluation lives across `runtime/scene/**`, `runtime/frame/**`, and `runtime/layout/**`
- state machines and navigation are now normalized behind canonical subsystem barrels
- layout now has a canonical subsystem barrel, but deeper grouping is still historical
- interaction code spans `runtime/interactions`, `runtime/input`, `runtime/interactionEngine`, and bridge-facing runtime modules

Target direction:

- cleaner grouping under `runtime/evaluation`, `runtime/scene`, `runtime/layout`, `runtime/interactions`, `runtime/animation`, `runtime/navigation`, `runtime/media`, `runtime/projection`

Refactor note:

- favor alias/re-export shims during moves
- do not perform large folder moves without import-law coverage in place

### Workspace Definition Shape

Current state:

- workspace policy files still live under `workspaces/registry/**`, but the canonical access path is now `platform/workspaces/*`

Relevant files:

- `workspaces/registry/index.js`
- `workspaces/registry/routes.js`
- `workspaces/registry/resolveWorkspacePolicy.js`
- `workspaces/registry/*.js`
- `platform/workspaces/workspaceRegistry.js`
- `platform/workspaces/workspaceEngine.js`
- `platform/workspaces/index.js`

Target direction:

- `platform/workspaces/workspaceEngine.js`
- `platform/workspaces/workspaceRegistry.js`
- `workspaces/<name>/workspacePolicy.js`

Refactor note:

- keep `platform/workspaces/*` as the canonical registry/activation path
- workspace policies should remain policy-only, not engine owners

### UI Folder Normalization

Current state:

- UI boundary law is now good, but folder names remain historical

Relevant paths:

- `ui/bridges/**`
- `ui/workspace/**`
- `ui/interactions/**`
- `ui/canvas/**`
- `ui/tools/**`
- `ui/panels/**`

Target direction:

- `ui/canvas`
- `ui/panels`
- `ui/tools`
- `ui/workspaceShell`
- `ui/interactionAdapters`

Refactor note:

- `ui/bridges/**` is now the approved coupling zone
- rename only after the contract is stable

### Engine Surface Consolidation

Current state:

- `engine/vector`, `engine/layout`, `engine/timeline`, and `engine/compiler` are real
- workflow, data, and variables logic exists, but some of it is still distributed across compiler application modules and runtime helpers

Target direction:

- `engine/workflow/*`
- `engine/data/*`
- `engine/variables/*`

Refactor note:

- do not create duplicate engines
- extract deterministic logic upward only when multiple layers genuinely share it

## Do Not Move Yet

### Dispatcher Physical Relocation

Current file:

- `runtime/dispatcher/dispatch.js`

Target file:

- `core/events/dispatcher/dispatch.js`

Why not yet:

- the dispatcher is already behaving correctly
- many imports and tests depend on the current path
- the architectural law is already enforced without moving it

Move only when:

- import aliases or re-export shims are prepared
- all architecture tests are green before and after the move

### Large Runtime Folder Renames

Why not yet:

- the runtime is already stable and highly tested
- broad renames will create noise and regression risk without immediate architectural gain

Move only when:

- a subsystem has a clear destination
- a compatibility shim exists
- the move can be validated with focused tests plus `npm run arch`

## Safe First Refactors

### 1. Finish Runtime Folder-Shape Cleanup

Current sources:

- `runtime/scene/**`
- `runtime/layout/**`
- `runtime/frame/**`
- `runtime/interactions/**`
- `runtime/input/**`
- `runtime/interactionEngine/**`

Safe outcome:

- clearer subsystem barrels and fewer deep non-runtime imports

Guardrails:

- keep adding canonical `index.js` surfaces before deeper moves
- restrict new non-runtime deep imports as each subsystem is normalized

### 2. Finish Persistence Caller Migration

Current sources:

- `runtime/dispatcher/replayEvents.js`
- `runtime/replay/useReplayState.js`
- `runtime/utils/hashCanonicalDocument.js`
- `runtime/utils/hashRuntimeState.js`
- remaining ad hoc document-envelope builders

Safe outcome:

- `core/persistence/*` becomes the only canonical persistence surface

Guardrails:

- replay equivalence tests must stay green
- deterministic hash behavior must not change

### 3. Normalize Remaining Workspace Compatibility Paths

Current sources:

- `workspaces/registry/**`
- `platform/capabilities/workspaceActivation.js`
- `platform/capabilities/workspaceRegistryBridge.js`

Safe outcome:

- legacy workspace paths become compatibility-only, not active app surfaces

Guardrails:

- workspaces remain policy-only
- workspace definitions must not import engine/runtime internals

### 4. Expand Engine Surface Only Where Shared Logic Exists

Examples:

- promote workflow logic into `engine/workflow/*` only if runtime, compiler, or AI all need the same deterministic layer
- promote data logic into `engine/data/*` only if it is truly shared deterministic logic

Guardrails:

- do not create a second source of truth
- do not move orchestration logic into engine folders

## Guardrails To Keep During Refactor

These scripts and tests must remain mandatory while moving code.

### Law and Import Enforcement

- `enforceDroppleLaws.cjs`
- `tests/architecture/truthBoundaryImports.test.ts`

Purpose:

- prevent illegal cross-layer imports
- prevent regressions while file paths are in motion

### Truth Boundary Enforcement

- `tests/architecture/reducerOwnership.test.ts`
- `tests/kernel/truthReplayEquivalence.test.ts`
- `tests/kernel/replayDeterminism.test.ts`
- `tests/kernel/projectionPurity.test.ts`

Purpose:

- protect reducer ownership
- protect replay equivalence
- protect projection purity

### Derived Cache Enforcement

- `runtime/derivedCacheRegistry.js`
- `tests/architecture/derivedCacheRegistry.test.ts`

Purpose:

- ensure caches remain declared as derived
- fail if new cache surfaces appear without registration

### Architecture Reporting

- `scripts/architectureMonitor.mjs`
- `scripts/architectureScore.mjs`
- `scripts/architectureRadar.mjs`
- `scripts/architecturePhaseProgress.mjs`
- `scripts/architectureCi.mjs`
- `scripts/architectureDrift.mjs`

Purpose:

- keep architecture status truthful while subsystems move
- surface drift early

## Recommended Migration Order

1. clean runtime folder shape by subsystem, one domain at a time
2. finish persistence caller migration onto `core/persistence/*`
3. normalize remaining workspace compatibility paths
4. normalize UI naming after bridge boundaries are stable
5. expand engine surfaces where shared deterministic logic is real
6. only then consider dispatcher physical relocation if still useful

## Refactor Rules

- never do a big-bang reorg
- move one subsystem at a time
- prefer re-export shims during transitions
- run architecture law checks before and after each move
- do not relocate code only for aesthetics if its law boundaries are already correct

## Definition Of A Safe Move

A refactor is safe only if all of the following remain true:

- `npm run arch` reports zero violations
- architecture tests stay green
- replay and determinism tests stay green
- no new direct layer-crossing imports are introduced
- no second truth path is created
