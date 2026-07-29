# CSR 1.1C-B Template Launch Migration Plan

Status: Stage 1 implemented and frozen; Stage 2 pending  
Date: 2026-07-29  
Scope: Marketplace template-detail launch only  
Authority: Migration plan, subordinate to `WorkspaceLaunchContext`, `WorkspaceSession`, and the CSR roadmap

## Purpose

This document defines the first implementation slice for template launch
convergence.

It does not reopen runtime boot architecture.

It does not redesign Marketplace.

It does not change template installation behavior.

Its only responsibility is to convert the active marketplace template-detail
launch path into a canonical session producer.

## Current Governance State

### Stage 1 — Producer Extraction

Status: Frozen

Completed:

- canonical template launch producer extracted
- marketplace template-detail page delegates launch construction
- deterministic producer tests added
- template launch authority guard added
- frozen runtime boundary preserved

### Stage 2 — Downstream Convergence

Status: Pending

Remaining responsibility:

- remove producer-owned downstream launch reconstruction
- reduce compatibility-only transport fields where lawful
- keep the current runtime boot path frozen while convergence completes

## Frozen Scope

This slice includes only:

- marketplace template-detail launch
- template launch producer extraction
- canonical `WorkspaceLaunchContext` construction
- canonical transport into `WorkspaceRoot`
- focused tests
- one template-launch authority guard

This slice does not include:

- template installation
- marketplace discovery/listing behavior
- certification model changes
- blueprint installation
- recent work
- homepage producer
- `WorkspaceRoot`
- `WorkspaceSession`
- runtime boot refactors

## Governing Rule

Marketplace template-detail launch must behave as a producer, not as a runtime
bootstrapper.

Target chain:

Marketplace Template Detail  
↓  
Template Launch Producer  
↓  
`WorkspaceLaunchContext`  
↓  
Transport  
↓  
`WorkspaceRoot`  
↓  
`WorkspaceSession`  
↓  
Workspace Runtime

## Current Problem

Today the template-detail page already knows enough launch truth before
navigation, but it still assembles a legacy environment-boot route.

Current behavior:

Template detail UI  
↓  
`buildProjectEnvironmentStartRoute(...)`  
↓  
`/workspace/create?entry=...&workspaceId=...&modeId=...&lineageRootId=...&versionId=...`  
↓  
workspace boot reconstructs template launch truth from query fields

That means the producer knows template launch truth upstream, but the runtime is
still forced to compensate downstream.

## Migration Objective

Move template launch truth construction upstream into one dedicated producer.

If the producer already knows a piece of launch truth, the runtime must not
infer it later.

## Required Launch Truth

This migration slice must ensure the producer emits, at minimum:

- `language`
- `template.id`
- `template.versionId`
- `grammar`
- `certification.template`

Where the current producer can resolve them safely, it should also emit:

- `category`
- blueprint association

The migration must not invent fields that are not authoritatively available.

## Implementation Stages

### Stage 1 — Extract the Producer

Status: Complete and frozen

Create a dedicated producer for marketplace template-detail launches.

Suggested responsibility:

- accept the template record already loaded by the detail page
- resolve canonical workspace/mode ownership
- resolve launch-context fields
- produce canonical transport for workspace entry

The template-detail page must stop assembling launch truth inline.

The UI remains responsible for:

- discovery
- presentation
- click intent

The producer becomes responsible for:

- launch-context creation
- launch transport construction

### Stage 2 — Eliminate Reconstruction

Status: Pending

Audit every field currently inferred after navigation and migrate ownership to
the producer where lawful.

Fields currently reconstructed through legacy route/environment boot include:

- `workspaceId`
- `modeId`
- `overlayId`
- `lineageRootId`
- `versionId`

Template launch should instead hand the runtime canonical launch truth through
`WorkspaceLaunchContext`.

The implementation should reduce downstream dependence on producer-owned route
fields without reopening the frozen boot boundary.

### Stage 3 — Preserve Separation of Concerns

Maintain these three responsibilities:

Marketplace  
↓  
Discovery

Template Launch Producer  
↓  
Launch

Template Installer  
↓  
Installation

Launch must not implicitly become installation.

Installation must not become launch.

In particular:

- `app/marketplace/template/[id]/page.js` is the migration target
- `ui/registry/useCertifiedTemplates.js` remains in-runtime install infrastructure
- `domain/templates/installCertifiedTemplate.js` remains installation infrastructure

### Stage 4 — Protect the Producer

After migration, add a dedicated authority guard comparable to the homepage
guard.

### Template Launch Authority Law

Marketplace template launch must not:

- assemble template launch URLs inline
- assemble `grammar`, `template`, `templateVersionId`, or certification route
  truth inline
- bypass the canonical template launch producer

The guard should fail the repository if the template-detail page reverts to
inline route assembly or direct launch-truth construction.

## Suggested Artifact Shape

The producer should be isolated in runtime-facing code, not embedded in the UI
surface.

Suggested outcome:

- marketplace template-detail UI imports a dedicated template launch helper
- helper produces canonical launch context and transport
- helper is verified with deterministic tests

The exact filename can follow the existing homepage producer pattern.

## Test Plan

### Deterministic Producer Tests

Prove that identical template launch intent produces identical
`WorkspaceLaunchContext`.

At minimum verify:

- same template detail input -> same launch context
- same template detail input -> same transport
- incomplete template lineage fails closed

### Contract Continuity Tests

Continue running:

- `WorkspaceLaunchContext` tests
- `WorkspaceSession` tests

The migration must not require changes to the frozen session boundary.

### Authority Guard

Add one architecture test that enforces the producer boundary for the template
detail page.

### Stage 1 Verification

Focused verification currently passes with:

- deterministic template launch tests
- template launch authority guard
- existing `WorkspaceLaunchContext` tests
- existing `WorkspaceSession` tests

## Exit Criteria

CSR 1.1C-B Stage 2 is complete only when all of the following are true:

- Marketplace template-detail launch uses the canonical producer.
- The producer emits a complete lawful `WorkspaceLaunchContext`.
- Runtime no longer reconstructs producer-owned launch truth for this slice.
- Deterministic producer tests pass.
- Template Launch Authority Guard passes.
- Existing `WorkspaceLaunchContext` and `WorkspaceSession` tests continue to pass.
- No changes were required to `WorkspaceRoot`, `WorkspaceSession`, or frozen runtime boot architecture.

## Explicit Non-Goals

This migration does not authorize:

- rewriting `buildProjectEnvironmentStartRoute(...)` for all callers
- converging blueprint launch
- redesigning Marketplace
- implementing Recent Work
- changing certified template installation UX
- changing certification semantics
- reopening CSR 1.1B

## Next Step After Approval

Begin the first implementation slice:

Marketplace template-detail launch  
↓  
canonical template launch producer  
↓  
focused deterministic tests  
↓  
template launch authority guard

Only after that slice is green should CSR 1.1C-B be considered ready for
freeze review.
