# CSR 1.1C-B Template Launch Audit

Status: Stage 1 frozen, Stage 2 downstream convergence pending  
Date: 2026-07-29  
Scope: Template launch convergence only  
Authority: Producer audit, subordinate to `WorkspaceLaunchContext` and `WorkspaceSession`

## Purpose

This document audits every active template launch path before migration work
begins.

Its job is to separate:

- true session producers
- route/transport behavior
- launch truth already available before boot
- truth that is still reconstructed after navigation
- in-runtime template installation that must remain out of scope

It does not authorize changes to:

- `WorkspaceRoot`
- `WorkspaceSession`
- runtime boot
- in-runtime certified-template installation

## Governing Rule

Every active template entry path must construct a canonical
`WorkspaceLaunchContext` before entering `WorkspaceRoot`.

Template identity, certification, blueprint association, category, grammar, and
canonical workspace ownership must not be reconstructed by the runtime.

Frozen target chain:

Template intent  
↓  
Template launch producer  
↓  
`WorkspaceLaunchContext`  
↓  
`WorkspaceRoot`  
↓  
`WorkspaceSession`  
↓  
Workspace Runtime

## Active Template Producer Matrix

| Concern | Current state | Evidence | Architectural reading |
| --- | --- | --- | --- |
| Producer | Marketplace template detail page is the active launch producer. | `app/marketplace/template/[id]/page.js` | This is the CSR 1.1C-B migration target. |
| Source | Marketplace detail page loads a certified marketplace template by `id`, then pushes a workspace route. | `app/api/templates/marketplace/route.js`, `app/marketplace/template/[id]/page.js` | Marketplace listing is discovery. Detail page is the launch-producing surface. |
| Transport | Launch currently uses route + query transport, not canonical launch context transport. | `platform/workspaces/projectStartRoute.js` | Route assembly still owns template launch transport. |
| Launch truth already available before navigation | Template page already knows: template `id`, `workspaceId`, `modeId`, `lineageRootId`, `versionId`, and certification payload from the fetched template record. | `app/marketplace/template/[id]/page.js`, `.registry/certifiedTemplates.json` | Enough truth exists upstream to produce a canonical `WorkspaceLaunchContext`. |
| Reconstruction after navigation | Workspace boot still reconstructs environment launch from `lineageRootId`, `versionId`, `workspaceId`, `modeId`, and `overlayId` query fields. | `app/workspace/new/workspaceEnvironmentBoot.js`, `app/workspace/new/page.js` | Template launch truth is still bypassing the launch-context contract. |
| Install semantics | Session launch and in-runtime install are distinct today, but both exist in the same producer family. | `app/marketplace/template/[id]/page.js`, `ui/registry/useCertifiedTemplates.js`, `domain/templates/installCertifiedTemplate.js` | CSR 1.1C-B must converge only the session-launch path. In-runtime install remains out of scope. |
| Certification truth | Certification originates from the certified template registry and is available before launch. | `engine/templates/templateLoader.js`, `.registry/certifiedTemplates.json` | Certification can be emitted into `WorkspaceLaunchContext`; it should not be inferred later. |
| Runtime impact | Runtime currently compensates for missing launch-context truth by rebuilding a descriptor from route query parameters and by resolving templates from lineage keys after boot. | `app/workspace/new/workspaceEnvironmentBoot.js`, `domain/templates/resolveTemplateEnvironment.js` | Runtime still compensates for legacy route transport. |

## Active Launch Path

### 1. Marketplace discovery

The detail page fetches one template:

- `GET /api/templates/marketplace?id={templateId}`

The returned template already carries upstream truth such as:

- `id`
- `workspaceId`
- `modeId` or `mode`
- `versionId`
- `lineageRootId`
- certification payload

Evidence:

- `app/api/templates/marketplace/route.js`
- `app/marketplace/template/[id]/page.js`

### 2. Producer-side route assembly

When the creator chooses `Use Template`, the detail page:

1. resolves canonical workspace/mode ownership via
   `resolveCanonicalWorkspaceOverlayContext(...)`
2. derives `lineageRootId` and `versionId`
3. pushes a route from `buildProjectEnvironmentStartRoute(...)`

Current output shape:

`/workspace/create?entry=...&workspaceId=...&modeId=...&lineageRootId=...&versionId=...`

Evidence:

- `app/marketplace/template/[id]/page.js`
- `platform/workspaces/projectStartRoute.js`
- `tests/kernel/projectStartRouteLaw.test.ts`

Interpretation:

This is a lawful legacy producer, but it emits route fields instead of a
canonical `WorkspaceLaunchContext`.

### 3. Receiving runtime boot

`app/workspace/new/page.js` currently does two separate things:

- resolves `initialWorkspaceLaunchContext` from recognized launch-context
  search params
- independently rebuilds template environment boot state from:
  - `lineageRootId`
  - `versionId`
  - `workspaceId`
  - `modeId`
  - `overlayId`

Evidence:

- `app/workspace/new/page.js`
- `app/workspace/new/workspaceEnvironmentBoot.js`

Interpretation:

The workspace is still booting template sessions through environment route
fields rather than through the canonical session contract.

## Launch Truth Inventory

### Truth already available before `WorkspaceRoot`

The current template detail producer already knows, or can know before launch:

- language-equivalent mode ownership
  - derived from `workspaceId` + `modeId`
- canonical workspace ownership
  - via `resolveCanonicalWorkspaceOverlayContext(...)`
- template identity
  - `template.id`
- template version identity
  - `template.versionId`
- template certification lineage identity
  - `template.lineageRootId`
  - `template.certification.lineageRootId`
  - `template.certification.lineageNodeId`
- certification payload
  - registry-backed certification object

### Truth missing from canonical transport today

The current route transport does not emit:

- `template`
- `templateVersionId`
- `templateCertification`
- `grammar`
- `category`

It emits only environment boot route fields:

- `entry`
- `workspaceId`
- `modeId`
- `lineageRootId`
- `versionId`
- optional `overlayId`

## Install Semantics Separation

CSR 1.1C-B must keep these two behaviors separate:

### A. Session launch producer

Starts a new workspace session from template intent.

Current owner:

- `app/marketplace/template/[id]/page.js`

### B. In-runtime certified-template installation

Installs a certified template into an already booted runtime through dispatcher
hydration.

Current owners:

- `ui/workspace/ux/panels/CertifiedTemplatesPanel.jsx`
- `ui/registry/useCertifiedTemplates.js`
- `domain/templates/installCertifiedTemplate.js`

Interpretation:

In-runtime installation is not a `WorkspaceRoot` producer and must remain out
of scope for CSR 1.1C-B.

## Certification Origin

Certification truth currently originates upstream in the certified template
registry and loader pipeline:

- `.registry/certifiedTemplates.json`
- `engine/templates/templateLoader.js`

Each template can already expose:

- certification hash
- engine hash
- signature
- lineage root id
- lineage node id
- engine version

Interpretation:

Certification truth already exists before launch. CSR 1.1C-B should emit it
through `WorkspaceLaunchContext` rather than letting the runtime infer trust
through lineage-only boot.

## Runtime Compensation Paths

The following modules currently compensate for missing canonical template launch
truth:

### `platform/workspaces/projectStartRoute.js`

Owns legacy route assembly for template launch.

### `app/workspace/new/workspaceEnvironmentBoot.js`

Reconstructs environment boot state from raw query parameters.

### `domain/templates/buildDescriptorFromCertifiedTemplate.js`

Rebuilds descriptor identity from template lineage and mode ownership.

### `domain/templates/resolveTemplateEnvironment.js`

Resolves the template artifact after boot using lineage keys.

Interpretation:

None of these are wrong. They are simply evidence that template launch has not
yet converged on the canonical session contract.

## Current Producer Classification

| Producer | Classification | Notes |
| --- | --- | --- |
| Marketplace template detail launch | `Canonical producer slice (Stage 1 frozen)` | Active template session producer now delegates through the canonical template launch helper while preserving compatibility transport. |
| Certified template panel install | `Out of active scope` | In-runtime mutation, not a workspace-session producer. |
| `fromTemplate` workspace boot path | `Legacy bootstrap path` | Seeds workspace from template id after navigation; not yet a canonical producer. |

## Governance Update

Stage 1 is now complete and frozen for the marketplace template-detail launch
producer.

What remains for CSR 1.1C-B is Stage 2 only:

- downstream reconstruction cleanup
- compatibility transport reduction where lawful
- preservation of the frozen runtime boundary during convergence

## Recommended First Migration Slice

The safest first convergence slice is:

### Template detail page launch only

Convert:

`TemplateDetailPage -> buildProjectEnvironmentStartRoute(...) -> /workspace/create?...`

into:

`Template intent -> createTemplateLaunchContext(...) -> canonical transport -> WorkspaceRoot`

without touching:

- `WorkspaceRoot`
- `WorkspaceSession`
- in-runtime certified-template installation
- marketplace listing/discovery UI

## Required Fields For CSR 1.1C-B

The audit indicates template launch must eventually resolve at least:

- `language`
- `template.id`
- `template.versionId`
- `grammar`
- `certification.template`

Potentially also:

- `category`
- blueprint association, when a lawful template-to-blueprint relation exists

## Explicit Non-Goals

This audit does not authorize:

- template authoring work
- marketplace redesign
- in-runtime template install changes
- changes to `WorkspaceRoot`
- changes to `WorkspaceSession`
- changes to workspace runtime boot behavior in this pass

## Verdict

CSR 1.1C-B should begin with the marketplace template detail page as the first
template launch producer.

The architectural gap is now explicit:

- upstream already has enough template truth
- current transport still emits environment boot route fields
- runtime still compensates for that missing canonical launch contract

This makes template launch convergence the correct next producer slice.
