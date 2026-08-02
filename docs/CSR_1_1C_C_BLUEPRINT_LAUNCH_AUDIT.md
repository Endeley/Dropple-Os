# CSR 1.1C-C Blueprint Launch Audit

Status: Audit complete, migration not yet authorized  
Date: 2026-07-29  
Scope: Blueprint-side launch producer audit only  
Authority: Producer audit, subordinate to `LAUNCH_PRODUCER_CONTRACT.md`, `WorkspaceLaunchContext`, and `WorkspaceSession`

## Purpose

This document audits the active blueprint-facing launch paths after the Launch
Producer Contract was frozen.

It does not authorize migration work.

It exists to answer one question:

Which blueprint flows are true workspace-session producers, which are only
in-runtime installation flows, and where producer-owned truth is still being
transported or reconstructed through legacy route bootstrap.

## Frozen Rule

Blueprint launch convergence must not reopen:

- `WorkspaceRoot`
- `WorkspaceSession`
- session creation
- runtime boot authority

Blueprint convergence may only establish or migrate lawful Launch Producers
that emit canonical `WorkspaceLaunchContext` before entering `WorkspaceRoot`.

## Classification Legend

- `True launch producer candidate`
- `Legacy route bootstrap`
- `In-runtime install only`
- `Not yet implemented`
- `Out of active scope`

## Blueprint Producer Matrix

| Surface / Flow | Current launch path | Classification | Emits `WorkspaceLaunchContext` | Legacy reconstruction | Required change |
| --- | --- | --- | --- | --- | --- |
| Project start route | `buildProjectBlueprintStartRoute({ perspectiveId, blueprintId })` → `/workspace/{perspective}?blueprint={id}&bootstrap=1` | `Legacy route bootstrap` | `No` | `Yes` | Replace raw `blueprint + bootstrap` route semantics with a canonical blueprint launch producer. |
| Intent recommendation route | `buildProjectIntentRecommendationRoute(blueprintId)` → `/workspace/create?blueprint={id}&bootstrap=1` | `Legacy route bootstrap` | `No` | `Yes` | Route recommendation intent through the same canonical blueprint producer rather than assembling bootstrap URLs inline. |
| Route bootstrap consumption | `resolveProjectBlueprintRouteSelection(searchParams)` + `autoBootstrap` in `ProjectPerspectiveShell.jsx` | `Legacy route bootstrap` | `No` | `Yes` | Remove route/query ownership of blueprint launch identity once a producer exists. |
| In-workspace blueprint install | `createProjectFromBlueprintCatalog(...)` via `ProjectPerspectiveShell.jsx` | `In-runtime install only` | `No` | `No` | Keep separate from CSR launch convergence. This mutates the active runtime rather than starting a new session. |
| Marketplace blueprint discovery | `app/marketplace/page.js` lists “Blueprints” but opens template detail routes | `Not yet implemented` | `No` | `N/A` | A dedicated blueprint launch producer does not currently exist in Marketplace. |

## Active Files

The current blueprint launch and install behavior is concentrated in:

- `platform/workspaces/projectStartRoute.js`
- `runtime/workspaces/projectIntentBlueprintRecommendation.js`
- `ui/bridges/blueprintInstallBridge.js`
- `ui/workspace/shell/ProjectPerspectiveShell.jsx`

## Findings

### 1. Blueprint launch currently exists as route bootstrap, not as a canonical producer

The current session-starting blueprint path is:

Blueprint intent  
↓  
`buildProjectBlueprintStartRoute(...)` or `buildProjectIntentRecommendationRoute(...)`  
↓  
`/workspace/{perspective}?blueprint={id}&bootstrap=1`  
↓  
`resolveProjectBlueprintRouteSelection(searchParams)`  
↓  
`ProjectPerspectiveShell` auto-bootstrap effect  
↓  
`createProjectFromBlueprintCatalog(...)`

This is not yet a lawful Launch Producer chain because:

- no canonical `WorkspaceLaunchContext` is emitted upstream
- blueprint identity is carried as route semantics rather than launch contract
- route/query state still owns bootstrap intent

### 2. Route bootstrap and in-runtime install are currently mixed

Two distinct behaviors are currently intertwined:

1. Starting a new workspace session from blueprint intent
2. Installing blueprint structure into an already active runtime

Only the first belongs to CSR 1.1C.

The second is an in-runtime editing/install capability and must remain outside
the producer convergence boundary.

### 3. Blueprint install already has a mature runtime path

`createProjectFromBlueprintCatalog(...)` and related install bridge logic are
already substantial runtime capabilities.

This is useful because blueprint launch convergence does not need to invent
installation behavior.

It only needs to replace the legacy route bootstrap authority with a lawful
producer that resolves launch truth before boot.

### 4. Marketplace does not yet have a dedicated blueprint producer

The current Marketplace surface labeled “Blueprints” is still backed by
template-oriented discovery and detail behavior.

That means there is no producer equivalent yet to the frozen template-detail
launch slice.

Blueprint convergence should therefore begin with the existing route-bootstrap
producer family, not by assuming a Marketplace blueprint-detail producer
already exists.

## Producer-Owned Launch Truth

A future blueprint launch producer should own, at minimum:

- blueprint launch intent
- blueprint identity
- blueprint version identity when known
- blueprint certification or provenance when known
- canonical language identity
- canonical grammar identity
- category when legitimately known upstream

It must not rely on downstream route parsing to recreate any of those once they
are known at producer time.

## Current Reconstruction Points

### Route-owned launch identity

Current route bootstrap semantics depend on:

- `blueprint`
- `blueprints`
- `bootstrap`

Those fields currently act as launch authority.

Under the frozen Launch Producer Contract, they may only survive as documented
compatibility transport if the blueprint producer emits canonical
`WorkspaceLaunchContext` first.

### Runtime shell auto-bootstrap

`ProjectPerspectiveShell.jsx` currently reads route bootstrap intent and then
calls `createProjectFromBlueprintCatalog(...)` through an effect.

That effect is lawful only for compatibility during migration.

It must not remain the source of session launch truth once blueprint producer
convergence begins.

## Non-Goals

This audit does not authorize:

- blueprint installation redesign
- Marketplace blueprint redesign
- `WorkspaceRoot` changes
- `WorkspaceSession` changes
- runtime boot changes
- Blueprint Author Grammar work

It is a producer audit only.

## Recommended Migration Sequence

### Stage 1 — Blueprint Launch Producer

Extract a canonical blueprint producer that owns:

Blueprint intent  
↓  
Blueprint Launch Producer  
↓  
`WorkspaceLaunchContext`  
↓  
Transport  
↓  
`WorkspaceRoot`

This should mirror the frozen Homepage and Template producer pattern.

### Stage 2 — Route Bootstrap Cleanup

Remove active producer-owned reconstruction from:

- `blueprint`
- `blueprints`
- `bootstrap`
- route-driven auto-bootstrap ownership

Reduce them to compatibility transport only where strictly required.

### Stage 3 — Intent Recommendation Delegation

Migrate `buildProjectIntentRecommendationRoute(...)` to delegate through the
canonical blueprint launch producer rather than assembling bootstrap routes
inline.

### Stage 4 — Guard

Add a blueprint launch authority guard that rejects:

- inline blueprint launch URL assembly outside the producer
- direct route ownership of blueprint launch identity
- new downstream reconstruction of producer-owned blueprint truth

## Exit Rule

Blueprint launch convergence is complete only when:

- the active blueprint session-start path emits canonical
  `WorkspaceLaunchContext`
- runtime boot receives blueprint launch truth through the frozen session
  pipeline
- route/query fields no longer own blueprint launch semantics
- in-runtime blueprint install remains separate from session launch
- the producer is protected by deterministic tests and an authority guard

## Overall Assessment

Current status:

- Blueprint launch producer: `Not yet implemented`
- Blueprint route bootstrap: `Active but legacy`
- Blueprint in-runtime install: `Mature and out of launch scope`
- Marketplace blueprint producer: `Not yet implemented`

The next valid implementation milestone is therefore not “Blueprint Builder”
or “Marketplace blueprint redesign.”

It is:

`CSR 1.1C-C — Blueprint Launch Convergence`

starting with the existing legacy route-bootstrap producer family.
