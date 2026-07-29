# CSR 1.1C-B Stage 2 Field Lineage Map

Status: Draft evidence for downstream convergence cleanup  
Date: 2026-07-29  
Scope: Marketplace template-detail producer -> workspace boot

## Purpose

This map records which fields are:

- owned by the canonical template producer
- still transported through the launch URL
- read downstream during workspace boot
- eligible for removal from legacy compatibility transport

It exists to keep Stage 2 evidence-based and to prevent accidental removal of a
field that still has a real consumer.

## Field Lineage

| Field | Producer source | Transport key | Downstream reader | Reconstructed before Stage 2 | Stage 2 action |
| --- | --- | --- | --- | --- | --- |
| `language` | `createTemplateDetailLaunchContext(template)` via canonical ownership resolution | `language` | `buildInitialEnvironmentDescriptorFromQuery(..., launchContext)` | Yes, via query `modeId`/`workspaceId` fallback | Consume only from `WorkspaceLaunchContext`. |
| `template.id` | `createTemplateDetailLaunchContext(template)` | `template` | Workspace session only | No active downstream reconstruction in environment boot | Leave canonical. |
| `template.versionId` | `createTemplateDetailLaunchContext(template)` | `templateVersionId` | `buildInitialEnvironmentDescriptorFromQuery(..., launchContext)` | Yes, via query `versionId` | Consume only from `WorkspaceLaunchContext`. |
| `grammar` | `createTemplateDetailLaunchContext(template)` | `grammar` | Workspace session only | No | Leave canonical. |
| `category` | `createTemplateDetailLaunchContext(template)` | `category` | Workspace session only | No | Leave canonical. |
| `certification.template` | `createTemplateDetailLaunchContext(template)` | `templateCertification` | Workspace session only | No | Leave canonical. |
| `lineageRootId` | Template lineage record | `lineageRootId` | `buildInitialEnvironmentDescriptorFromQuery(..., launchContext)` | Yes | Retain as compatibility transport until lineage root is represented by a canonical launch contract field. |
| `overlayId` | Canonical overlay ownership from producer | `overlayId` | `buildInitialEnvironmentDescriptorFromQuery(..., launchContext)` | Yes | Retain as minimal compatibility transport because launch context does not yet encode overlay identity. |
| `workspaceId` | Producer ownership resolution | `workspaceId` | `buildInitialEnvironmentDescriptorFromQuery(...)` | Yes | Remove from compatibility transport and downstream query reads. |
| `modeId` | Producer ownership resolution | `modeId` | `buildInitialEnvironmentDescriptorFromQuery(...)` | Yes | Remove from compatibility transport and downstream query reads. |
| `versionId` | Template lineage record | `versionId` | `buildInitialEnvironmentDescriptorFromQuery(...)` | Yes | Remove from compatibility transport and downstream query reads. |

## Stage 2 Compatibility Allowlist

After Stage 2, the template-detail launch path may keep only these non-canonical
query fields:

- `entry`
- `lineageRootId`
- `overlayId`

These are not treated as workspace session identity.

## Stage 2 Removal Targets

The template-detail launch path should no longer depend on query transport for:

- `workspaceId`
- `modeId`
- `versionId`

Those values are producer-owned and must arrive through
`WorkspaceLaunchContext`.
