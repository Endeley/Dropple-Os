# Workspace Mode Build Policy

## Purpose

This document defines the official execution policy for building Dropple's 5-workspace system.

Its purpose is to prevent:
- half-built modes
- duplicate authority paths
- premature UI expansion
- taxonomy drift
- platform fragmentation

Dropple must remain scalable for future expansion without introducing new top-level workspaces for every feature.

## Constitutional Rule

Dropple has 5 core workspaces:

1. Design
2. Media
3. Build
4. System
5. Collaborate

A workspace defines **why** the user is here.  
A mode defines **what** they are doing.  
Tools define **how** they do it.  
Systems define **what powers it**.

New product growth must happen by:
- adding modes to existing workspaces
- expanding tools
- extending shared systems

Not by creating new workspaces.

## Mode State Vocabulary

Every mode must be in exactly one of these states:

### Do Now
Active build target. Safe to invest in productization now.

### Freeze
Constitutionally important or stable substrate. Build above it, not casually inside it.

### Hide
Not ready for broad user-facing exposure. Keep routed internally if needed, but do not treat as an active product surface.

### Later
Valid roadmap target, but blocked on substrate closure, flagship quality, or shared-system readiness.

## Readiness Gate

A mode may only move from `Hide` or `Later` to `Do Now` if it has:

- canonical taxonomy in `platform/workspaces/canonicalRegistry.js`
- lawful routing in `platform/workspaces/modeResolution.js`
- capability exposure in `runtime/workspaces/workspaceCapabilities.js`
- UI capability mapping in `ui/workspace/capabilities/capabilityRegistry.js`
- deterministic boot contract in `runtime/workspaces/workspaceContracts.js`
- default document slices in `runtime/workspaces/defaultDocumentSlices.js`
- reducer-owned truth where the mode requires mutable domain state
- projection selectors before UI computes domain logic ad hoc
- one primary workflow that is actually closed
- at least one architecture or kernel test
- at least one end-to-end test for the main user flow
- no parallel legacy path for the same feature

If these are not true, the mode must not be promoted.

## Global Execution Order

The repo must follow this execution order:

1. Freeze taxonomy and mode ownership.
2. Close cross-workspace substrate before expanding UI.
3. Finish template pipeline end to end.
4. Make one flagship mode per workspace truly excellent.
5. Freeze completed constitutional subsystems.
6. Hide weak or placeholder modes from broad navigation.
7. Expand sideways only after flagship workflows are closed.

## Current Repo Policy

## Design Workspace

Purpose:
- visual product creation
- interfaces, layouts, structured visual systems

### UI / UX Design
State: `Do Now`

Reason:
- this should become the first premium design workflow
- it is the best next productization target after System token governance
- template generation and install unification directly unlock it

Primary files:
- `ui/workspace/ux/UIUXAuthoringShell.jsx`
- `ui/workspace/ux/UXWorkspaceShell.jsx`
- `ui/workspace/ux/UIUXCanvasStage.jsx`
- `ui/workspace/ux/UIUXToolRail.jsx`
- `ui/workspace/ux/UIUXTopBar.jsx`
- `ui/workspace/ux/panels/`
- `templates/workspaceToCCMTemplate.js`

Required next closure:
- publish pipeline
- certified install unification
- roundtrip tests

### Graphic Design
State: `Later`

Reason:
- valid expansion target
- should come after UIUX template and publish flow is real

Primary area:
- future work should branch from `ui/workspace/ux/` patterns, not invent a parallel shell

### Branding
State: `Hide`

Reason:
- too easy to expose as a shallow shell without real workflows
- should not be marketed as active until identity-system tooling exists

### Icon Design
State: `Hide`

Reason:
- depends on stronger vector/system primitive workflows
- should not expand before Design flagship closure

### Document / Print
State: `Later`

Reason:
- valid mode
- should follow UIUX closure, not precede it

### Light Design System Authoring
State: `Freeze`

Reason:
- light design-system support may exist in Design
- deep reusable system truth belongs in System workspace

## Media Workspace

Purpose:
- time-based creation
- motion, video, audio, storytelling

### Animation / Cartoon
State: `Do Now`

Reason:
- strongest Media-mode substrate
- should remain the motion-depth benchmark for the platform

Primary files:
- `ui/workspace/media/MediaWorkspaceShell.jsx`
- `ui/workspace/media/animation/`
- `ui/workspace/media/shared/`
- `runtime/animation/`
- `docs/ANIMATION_V1.md`
- `docs/TIMELINE_ENGINE_V2_DAG.md`

### Motion Design
State: `Later`

Reason:
- valid expansion target
- should grow after motion-preserving template roundtrip is closed

### Video Editing
State: `Later`

Reason:
- important mode
- not before Design/UIUX template closure and stronger install/reuse pipeline

### Podcast / Audio
State: `Hide`

Reason:
- weaker current substrate than animation
- should not compete for product focus now

## Build Workspace

Purpose:
- application and system creation

### Application Builder
State: `Later`

Reason:
- strategically important
- should follow closure of Design/UIUX template substrate

Primary areas:
- `engine/compiler/`
- `ui/workspace/`
- `platform/workspaces/`

### Data & Logic
State: `Freeze`

Reason:
- keep infrastructure-first
- do not over-productize before flagship builder workflow exists

### State Machines
State: `Later`

Reason:
- strong substrate potential
- not yet the next flagship product surface

### API / Integration
State: `Hide`

Reason:
- do not expose broadly until Build workspace has a clearer product center

### AI-assisted Building
State: `Hide`

Reason:
- AI is a platform system first
- do not let this become a premature pseudo-workspace

## System Workspace

Purpose:
- reusable systems, tokens, components, theming, governance

### Design Tokens
State: `Freeze`

Reason:
- constitutional subsystem
- already strong and should be treated as stable infrastructure

Primary files:
- `runtime/tokens/`
- `ui/workspace/system/`
- `ui/hooks/useToken.js`
- `ui/bridges/tokenCssBridge.js`
- `runtime/stores/useRuntimeStore.js`

### Theming
State: `Freeze`

Reason:
- sits directly on token truth
- should remain stable while higher-order authoring grows above it

### Versioning
State: `Freeze`

Reason:
- governance stack is mature
- do not casually modify lineage, diff, merge, compare, review, and conflict infrastructure

Primary files:
- `runtime/tokens/projectTokenVersionGraph.js`
- `runtime/tokens/projectTokenVersionDiff.js`
- `runtime/tokens/projectTokenMergePreview.js`
- `runtime/tokens/selectActiveTokenVersionGraph.js`
- `runtime/tokens/selectActiveTokenVersionDiff.js`
- `runtime/tokens/selectVersionComparison.js`
- `ui/workspace/system/TokenVersionGraphPanel.jsx`
- `ui/workspace/system/TokenVersionDiffPanel.jsx`
- `ui/workspace/system/TokenMergePreviewPanel.jsx`
- `ui/workspace/system/TokenReviewPanel.jsx`

### Component Libraries
State: `Later`

Reason:
- next major System target after UIUX and template flow are closed

### Variants
State: `Later`

Reason:
- should rise together with component governance
- not as a shallow independent mode

## Collaborate Workspace

Purpose:
- coordination, review, production, organizational workflows

### Review
State: `Later`

Reason:
- meaningful and already partially real
- not the top product priority until Design/UIUX closure

### Comments
State: `Hide`

Reason:
- too easy to expose as a weak collaboration surface

### Project Management
State: `Hide`

Reason:
- should not compete with core creation-system work until grounded in actual production truth

### Production
State: `Hide`

Reason:
- should be exposed only when asset, scene, and workflow handoff is concrete

### Knowledge
State: `Hide`

Reason:
- keep lightweight and internal until it has a strong truth model

## Immediate Priorities

These are the highest-priority repo actions:

1. Close the template pipeline end to end.
2. Make `Design / UIUX` the first fully premium design workflow.
3. Preserve motion as first-class truth in template generation and install.
4. Keep `Media / Animation` as the platform's motion benchmark.
5. Hide immature modes from broad navigation.

## Freeze List

The following areas are considered constitutional or stable substrate and should not receive casual feature creep:

- `runtime/tokens/`
- `ui/workspace/system/`
- token governance projections and review workflow
- core motion runtime
- canonical workspace taxonomy
- workspace routing and capability ownership

## Hide List

The following modes should remain hidden or soft-routed until they pass the readiness gate:

- Branding
- Icon Design
- Podcast / Audio
- API / Integration
- AI-assisted Building
- Comments
- Project Management
- Production
- Knowledge

## Expansion Rule

Dropple should not add new workspaces for future product growth.

Future expansion must happen by:
- deepening an existing mode
- adding a new mode inside an existing workspace
- extending a shared platform system

A new mode must not be exposed until it passes the readiness gate in this document.

## Product Quality Rule

Dropple is intended to produce high-end products in every serious workspace and mode.

That means each active mode must eventually support:
- deterministic truth
- first-class motion where relevant
- reusable template or preset flow
- lawful install/export path
- projection before UI logic
- version/review/governance where the domain requires it
- production-grade default workflow
- end-to-end test coverage for the main path

High-end output requires high-end substrate.  
No mode should be productized on top of unresolved duplicate authority paths.
