# Workspace Mode Ownership Map

## Purpose

This document maps Dropple workspaces and modes to their primary code ownership areas.

It is used to:
- keep mode boundaries clear
- prevent duplicate implementations
- keep new work inside the right workspace directories

## Global Workspace Infrastructure

These files govern all workspaces and modes:

### Canonical taxonomy and routing
- `platform/workspaces/canonicalRegistry.js`
- `platform/workspaces/modeRegistry.js`
- `platform/workspaces/modeResolution.js`
- `platform/workspaces/resolveWorkspaceContext.js`
- `platform/workspaces/workspaceRegistry.js`

### Runtime workspace contracts
- `runtime/workspaces/workspaceContracts.js`
- `runtime/workspaces/defaultDocumentSlices.js`
- `runtime/workspaces/bootWorkspaceDocument.js`
- `runtime/workspaces/workspaceCapabilities.js`
- `runtime/workspaces/resolveWorkspaceCapabilities.js`

### UI capability and shell infrastructure
- `ui/workspace/capabilities/capabilityRegistry.js`
- `ui/workspace/capabilities/reconcileCapabilityLifecycle.js`
- `ui/workspace/shared/`
- `ui/workspace/shell/`
- `ui/workspace/editor/`
- `ui/workspace/root/`

## Design Workspace

Primary UI ownership:
- `ui/workspace/ux/`

Primary files:
- `ui/workspace/ux/UIUXAuthoringShell.jsx`
- `ui/workspace/ux/UXWorkspaceShell.jsx`
- `ui/workspace/ux/UIUXCanvasStage.jsx`
- `ui/workspace/ux/UIUXToolRail.jsx`
- `ui/workspace/ux/UIUXTopBar.jsx`
- `ui/workspace/ux/UXInspectorPanel.jsx`
- `ui/workspace/ux/panels/`

Template ownership shared with Design:
- `templates/`
- `templates/workspaceToCCMTemplate.js`

Certified template consumption:
- `ui/workspace/ux/panels/CertifiedTemplatesPanel.jsx`
- `ui/registry/useCertifiedTemplates.js`

### UI / UX Design
Primary ownership:
- `ui/workspace/ux/`
- `templates/`
- `app/workspace/new/`
- `app/marketplace/template/[id]/`

### Graphic Design
Current ownership direction:
- future Design-owned expansion under `ui/workspace/ux/` or a sibling Design surface
- do not create a parallel workspace shell

### Branding
Current ownership direction:
- Design workspace only
- do not create separate shell infrastructure yet

### Icon Design
Current ownership direction:
- Design workspace only
- likely future vector/system primitive ownership

### Document / Print
Current ownership direction:
- Design workspace only
- should reuse Design shell and export substrate

### Light Design System Authoring
Boundary rule:
- lightweight authoring may appear in Design
- deep system truth belongs to System workspace

## Media Workspace

Primary UI ownership:
- `ui/workspace/media/`

Primary files:
- `ui/workspace/media/MediaWorkspaceShell.jsx`
- `ui/workspace/media/mediaModes.js`
- `ui/workspace/media/shared/`
- `ui/workspace/media/inspector/`

### Animation / Cartoon
Primary ownership:
- `ui/workspace/media/animation/`
- `runtime/animation/`
- timeline and graph runtime docs under `docs/ANIMATION_V1.md`, `docs/TIMELINE_ENGINE_V2_DAG.md`

Key files:
- `ui/workspace/media/animation/GraphCanvas.jsx`
- `ui/workspace/media/animation/GraphEditorPanel.jsx`
- `ui/workspace/media/animation/GraphInspectorPanel.jsx`
- `ui/workspace/media/animation/graphConnectionGuards.js`
- `ui/workspace/media/animation/graphNodeCatalog.js`

### Motion Design
Primary ownership:
- Media workspace
- should build on animation/timeline substrate, not duplicate it

### Video Editing
Primary ownership:
- `ui/workspace/media/inspector/video/`
- `ui/workspace/media/shared/`

Key file:
- `ui/workspace/media/inspector/video/VideoClipInspector.jsx`

### Podcast / Audio
Primary ownership:
- `ui/workspace/media/inspector/podcast/`
- `ui/workspace/media/shared/`

Key file:
- `ui/workspace/media/inspector/podcast/PodcastCueInspector.jsx`

## Build Workspace

Primary ownership:
- `engine/compiler/`
- `platform/workspaces/`
- selected `ui/workspace/` surfaces when productized

Supporting files:
- `platform/workspaces/workspaceEngine.js`
- `platform/workspaces/canvasSurfacePolicy.js`

### Application Builder
Primary ownership direction:
- Build workspace surfaces not yet strongly separated
- should remain tied to compiler/runtime substrate

### Data & Logic
Primary ownership direction:
- Build infrastructure and logic/runtime substrate

### State Machines
Primary ownership direction:
- Build infrastructure
- stateflow/system modeling layer

### API / Integration
Primary ownership direction:
- future Build mode
- do not create broad UI surface yet

### AI-assisted Building
Primary ownership direction:
- shared system first
- Build exposure later

## System Workspace

Primary UI ownership:
- `ui/workspace/system/`

Primary runtime ownership:
- `runtime/tokens/`
- `core/events/reducers/` for token/system truth
- `runtime/stores/useRuntimeStore.js`

### Design Tokens
Primary ownership:
- `runtime/tokens/`
- `ui/hooks/useToken.js`
- `ui/bridges/tokenCssBridge.js`
- `ui/workspace/system/`

### Theming
Primary ownership:
- token runtime/store/projection layer
- System workspace UI surfaces

### Versioning
Primary ownership:
- `runtime/tokens/` version graph, diff, merge, review projections
- `ui/workspace/system/`

Key files:
- `ui/workspace/system/TokenVersionGraphPanel.jsx`
- `ui/workspace/system/TokenVersionInspector.jsx`
- `ui/workspace/system/TokenVersionDiffPanel.jsx`
- `ui/workspace/system/TokenVersionComparePanel.jsx`
- `ui/workspace/system/TokenMergePreviewPanel.jsx`
- `ui/workspace/system/TokenConflictResolutionPanel.jsx`
- `ui/workspace/system/TokenReviewPanel.jsx`
- `ui/workspace/system/tokenAuthoringIntent.js`

### Component Libraries
Primary ownership direction:
- System workspace
- should build above token/theming/versioning substrate

### Variants
Primary ownership direction:
- System workspace
- should rise together with components, not separately

## Collaborate Workspace

Primary ownership direction:
- review and collaboration surfaces in workspace UI
- some overlap with existing review/education areas elsewhere in repo

### Review
Current ownership direction:
- Collaborate workspace
- should build on lawful review workflow substrate

### Comments
Current ownership direction:
- Collaborate workspace only
- no separate comment system outside workspace law

### Project Management
Current ownership direction:
- Collaborate workspace only
- do not spread into generic app shell logic

### Production
Current ownership direction:
- Collaborate workspace only
- should sit on scene/asset/workflow truth, not duplicate it

### Knowledge
Current ownership direction:
- Collaborate workspace only
- lightweight until dedicated truth model exists

## Cross-Workspace Systems

These are not workspaces and must not become separate workspace shells:

### Templates
- `templates/`
- `engine/templates/`
- `domain/templates/`
- `app/api/templates/certified/`
- `ui/registry/`

### Motion runtime
- `runtime/animation/`
- Media authors deeply here, but other workspaces consume motion lawfully

### Export / compiler
- `engine/compiler/`
- `engine/export/`

### Dispatcher / projection / runtime bridges
- `ui/workspace/root/DispatcherProvider/Bridges/`
- `runtime/projection/`
- `core/events/`

## Related Constitutional Clarifications

- [BLUEPRINT_TEMPLATE_CONSTITUTIONAL_CLARIFICATION.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/BLUEPRINT_TEMPLATE_CONSTITUTIONAL_CLARIFICATION.md:1)
  Explains why Blueprint and Template systems remain cross-workspace concepts
  with different constitutional roles, and why templates should not be
  collapsed into a separate workspace philosophy.

## Ownership Rule

New work must land in:
- the owning workspace directory, if it is mode UI
- the shared system directory, if it is cross-workspace runtime truth
- the compiler/export/template directories, if it is platform substrate

Do not create:
- duplicate shells
- mode-local truth that belongs in runtime
- workspace-local versions of shared platform systems
