# CSR 1.1C-C Stage 2 Field Lineage Map

Status: Draft evidence for downstream blueprint convergence cleanup  
Date: 2026-07-29  
Scope: Blueprint launch producer -> shell bootstrap compatibility path

## Purpose

This map records which blueprint launch fields are:

- owned by the canonical blueprint producer
- still transported through route/query compatibility state
- read by downstream consumers during shell bootstrap
- eligible for removal from legacy compatibility transport

It exists to keep CSR 1.1C-C Stage 2 evidence-based and to prevent accidental
removal of a field that still has a real compatibility consumer.

## Field Lineage

| Field | Producer source | Transport key | Downstream reader | Reconstructed before Stage 2 | Stage 2 action |
| --- | --- | --- | --- | --- | --- |
| `blueprint.id` | `createBlueprintLaunchContext(...)` via canonical producer ownership | `blueprint` | `resolveProjectBlueprintRouteSelection(..., launchContext)` | Yes, via `blueprint` / `blueprints` query ownership | Consume from `WorkspaceLaunchContext` first; retain query only as compatibility fallback. |
| `blueprint.versionId` | `createBlueprintLaunchContext(...)` via catalog resolution | `blueprintVersionId` | Workspace session only | No active shell reconstruction | Leave canonical. |
| `certification.blueprint` | `createBlueprintLaunchContext(...)` via catalog certification resolution | `blueprintCertification` | Workspace session only | No active shell reconstruction | Leave canonical. |
| `bootstrap` | Producer compatibility transport | `bootstrap` | `resolveProjectBlueprintRouteSelection(...)` | Yes | Retain as compatibility trigger only. It must not own blueprint identity. |
| `blueprints` | Legacy multi-select query transport | `blueprints` | `resolveProjectBlueprintRouteSelection(...)` | Yes | Retain only as fallback while route bootstrap compatibility exists. It must not outrank launch context. |
| `blueprint` | Legacy single-select query transport | `blueprint` | `resolveProjectBlueprintRouteSelection(...)` | Yes | Retain only as fallback while route bootstrap compatibility exists. It must not outrank launch context. |

## Stage 2 Compatibility Allowlist

After Stage 2, the active blueprint bootstrap path may keep only these
non-canonical query fields:

- `bootstrap`
- `blueprints`
- `blueprint`

These fields are compatibility transport only.

They are not authoritative workspace session identity if canonical
`WorkspaceLaunchContext` already exists.

## Stage 2 Removal Targets

The active blueprint bootstrap path should no longer depend on query transport
for:

- canonical blueprint identity when `launchContext.blueprint.id` is present

The active shell path must not reconstruct blueprint identity from route/query
state if the producer already emitted it into `WorkspaceLaunchContext`.
