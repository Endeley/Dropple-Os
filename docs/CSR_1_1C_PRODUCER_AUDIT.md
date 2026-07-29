# CSR 1.1C Producer Audit

Status: Homepage producer frozen, remaining producer audit active  
Date: 2026-07-29  
Scope: Producer-side audit only  
Authority: Integration audit, subordinate to `WorkspaceLaunchContext` and `WorkspaceSession`

## Purpose

This document audits the current producers that can begin or influence a
workspace session.

It does not authorize migration work.

It exists to answer one question:

Which producers already emit the canonical `WorkspaceLaunchContext`, which still
rely on route reconstruction, and which are not yet implemented as true session
producers?

## Frozen Rule

Every active entry point must eventually produce the same canonical
`WorkspaceLaunchContext` before entering `WorkspaceRoot`.

No producer should require:

- changes to `WorkspaceRoot`
- changes to `WorkspaceSession`
- changes to session creation
- changes to runtime boot

## Classification Legend

- `Already emits WorkspaceLaunchContext`
- `Partially emits launch truth but still relies on route reconstruction`
- `Launches through a legacy route or prop path`
- `Not yet implemented`
- `Out of active scope`

## Producer Matrix

| Producer | Current launch path | Emits `WorkspaceLaunchContext` | Legacy reconstruction | Required change |
| --- | --- | --- | --- | --- |
| Homepage | Language cards now delegate through `buildHomepageLanguageLaunchHref(...)` from `runtime/workspaces/homepageLaunch.js`. Continue Existing Work: `/workspace`. Browse Blueprints / Templates: `/marketplace`. | `Yes` | `No` | Frozen for language-entry launches. Keep bare `/workspace` continuation out of scope until a Recent Work producer exists. |
| Marketplace | `app/marketplace/page.js` loads catalog data and routes to `/marketplace/template/{id}`. The listing page itself does not boot the workspace. | `No` | `Yes` | Keep listing/discovery separate, but route marketplace launch actions through a producer that resolves `WorkspaceLaunchContext` instead of raw route fields. |
| Blueprint install | Two active paths: route bootstrap via `/workspace/{perspective}?blueprint=...&bootstrap=1` and in-workspace install via `createProjectFromBlueprintCatalog(...)` inside `ui/workspace/shell/ProjectPerspectiveShell.jsx`. | `No` | `Yes` | Separate "install into current runtime" from "launch a new session from blueprint". For launch-producing flows, resolve `language`, `category`, `blueprint`, `grammar`, and certification into `WorkspaceLaunchContext` before entering `WorkspaceRoot`. |
| Template install | Template detail page uses `buildProjectEnvironmentStartRoute(...)` to push `/workspace/create?...workspaceId&modeId&entry&lineageRootId&versionId...`. Certified template panels can also install directly through dispatcher/runtime. | `No` | `Yes` | Introduce a session producer for template-based launch that resolves template identity and certification into `WorkspaceLaunchContext`. Keep in-runtime template installation separate from session launch. |
| Recent work | Dormant helpers exist: `runtime/workspaces/projectHomeResumeRoute.js` and `runtime/workspaces/projectHomeSnapshot.js`. Current homepage "Continue Existing Work" points only to `/workspace`. | `No` | `Yes` | Implement a real recent-work producer that resolves the active document/project into `WorkspaceLaunchContext` before boot. Until then, recent work remains incomplete as a canonical producer. |
| Import | Current import behavior is in-workspace only: toolbar/canvas import commands in editor surfaces. No top-level producer that begins a new session from import was found. | `No` | `No` | None in CSR 1.1C unless import becomes a true pre-boot producer. Current import flows are out of active scope for entry-point convergence. |
| AI | Current AI actions enqueue runtime assistant requests from `ProjectPerspectiveShell` through `requestAssistantFromShellIntent(...)` and `requestAssistantAction(...)`. No AI entry path currently launches a workspace session. | `No` | `No` | None in CSR 1.1C first pass. When AI becomes a workspace-entry producer, it must emit `WorkspaceLaunchContext` like every other producer. |

## Producer Notes

### Homepage

Current status:

- language-entry launches now delegate to:
  - `createHomepageLanguageLaunchContext(...)`
  - `buildHomepageLanguageLaunchHref(...)`
- homepage launch authority is protected by:
  - `tests/architecture/homepageLaunchAuthority.test.mjs`
- the receiving runtime remained unchanged:
  - `WorkspaceRoot`
  - `WorkspaceSession`
  - runtime boot

Interpretation:

Homepage language-entry launch is now a frozen canonical producer slice.
Remaining homepage continuation behavior (`/workspace`) belongs to the later
Recent Work producer, not to CSR 1.1C-A.

### Marketplace

Current status:

- marketplace list page is discovery-only
- template detail page is the actual launch-adjacent producer
- template launches currently depend on:
  - route construction
  - query serialization
  - workspace boot reconstruction

Interpretation:

Marketplace should be treated as an active CSR 1.1C producer family, but it is
still on a legacy route-driven launch path.

### Blueprint Install

Current status:

- blueprint install is split between:
  - route bootstrap
  - in-runtime install
- route bootstrap still depends on:
  - `blueprint`
  - `blueprints`
  - `bootstrap`
  - perspective entry routing

Interpretation:

Blueprint install currently mixes "launch a session" and "mutate the current
session". CSR 1.1C should only converge the true launch path. In-runtime
installation is not, by itself, a `WorkspaceRoot` producer.

### Template Install

Current status:

- template detail page is an active launch path
- certified-template panels install into the current runtime through dispatcher
- current launch uses route fields like:
  - `workspaceId`
  - `modeId`
  - `entry`
  - `lineageRootId`
  - `versionId`

Interpretation:

Template install is active, but still pre-contract. It should become a
producer of `WorkspaceLaunchContext`, not a route assembler.

### Recent Work

Current status:

- helper functions exist
- homepage UI does not yet use them as a canonical producer
- active continuation is still a generic `/workspace` handoff

Interpretation:

Recent work is partially envisioned but not yet implemented as a proper session
producer.

### Import

Current status:

- import exists only inside an already-booted workspace

Interpretation:

Import is currently not a CSR 1.1C producer. It should be excluded from active
scope unless Dropple adds a pre-boot import entry path.

### AI

Current status:

- AI currently requests actions inside an active runtime
- no top-level AI session launch path was found

Interpretation:

AI is not yet an active CSR 1.1C producer. When it becomes one, it should
converge through `WorkspaceLaunchContext` without changing runtime boot.

## Overall Assessment

### Frozen canonical producer

- Homepage language-entry launch

### Active but still legacy

- Marketplace template launch
- Blueprint route bootstrap
- Template route bootstrap

### In-runtime only, not true producers

- Blueprint install inside active runtime
- Template install inside active runtime
- Import inside active runtime
- AI assistant actions inside active runtime

### Not yet implemented as canonical producers

- Recent work

## Exit Rule For CSR 1.1C

CSR 1.1C is complete only when:

- every active entry point produces a canonical `WorkspaceLaunchContext`
- `WorkspaceRoot` receives that launch context before runtime boot
- no producer requires route/query reconstruction of launch identity
- no producer requires changes to `WorkspaceSession` or runtime boot

## Explicit Non-Goals

This audit does not authorize:

- runtime migration changes
- `WorkspaceRoot` changes
- `WorkspaceSession` changes
- homepage projection cleanup
- marketplace redesign
- blueprint/template authoring work

It is a producer classification artifact only.
