# Create World Shell Expression Audit

## Purpose

This document is a proof artifact.

It does not extract code.
It does not refactor shells.
It does not rename routes.
It does not change behavior.

Its purpose is to answer one question:

`Are the remaining Create World Shell leaks naming-only, composition-only, projection-only, or true ownership blockages?`

Primary files:

- [WorkspaceShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/WorkspaceShell.jsx:1)
- [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:1)
- [WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx:1)
- [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:1)
- [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:1)
- [graphicWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/graphicWorkspace.js:1)
- [routes.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/routes.js:1)
- [app/workspace/[mode]/page.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/app/workspace/[mode]/page.js:1)

## Classification Rule

For every leak:

- `Naming-only`
  The reference changes labels, file names, CSS names, or route strings, but does not change composition or authority.
- `Composition-only`
  The reference still decides which shell or surface gets mounted, but does not create new runtime authority.
- `Projection-only`
  The reference pushes a language-specific projection through the wrong dependency direction.
- `True ownership blockage`
  The reference still materially prevents Create World Shell from being inherited cleanly by another language.

Severity:

- `Cosmetic`
- `Structural`
- `Blocking`

## Leak Classification

| Leak | Current Owner | Intended Owner | Classification | Evidence | Severity |
|---|---|---|---|---|---|
| `/workspace/uiux` and `/workspace/graphic` route identity | Legacy workspace routing | Product Expression over shared Create World entry | Naming-only | [routes.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/routes.js:3), [app/workspace/[mode]/page.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/app/workspace/[mode]/page.js:7) | Cosmetic |
| Dynamic `[mode]` route still describes entry in workspace terms | Legacy workspace routing | Shared Create World entry with language projection | Naming-only | [app/workspace/[mode]/page.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/app/workspace/[mode]/page.js:12) | Cosmetic |
| `WorkspaceShell` special-cases `uiux -> UIUXAuthoringShell` | Workspace shell router | Create World Shell composition with language-specific projection slots | Composition-only | [WorkspaceShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/WorkspaceShell.jsx:21), [WorkspaceShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/WorkspaceShell.jsx:57) | Structural |
| Comment and naming inside `WorkspaceShell` claiming “UIUX owns a dedicated product shell” | Workspace shell router | Create World Shell with UIUX as one language inhabitant | Naming-only | [WorkspaceShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/WorkspaceShell.jsx:58) | Cosmetic |
| `UIUXAuthoringShell` file/class name and `uiux-*` CSS/test ids | Product expression implementation | Shared shell expression layer with UIUX content projected through it | Naming-only | [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:57), [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:348) | Cosmetic |
| `UIUXAuthoringShell` mounts top bar, tool rail, canvas stage, inspector dock, timeline dock as one dedicated shell | UIUX shell composition | Shared Create World shell plus product-expression surfaces plus UIUX language injection | Composition-only | [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:360), [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:396), [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:400), [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:402), [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:414) | Structural |
| `WorkspaceCanvasRoot` uses generic shared substrate and activation by `workspaceId` | Shared world substrate | Create World Shell | Not a leak. This is already aligned. | [WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx:126), [WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx:158) | Cosmetic |
| `CanvasRoot` default fallback mode is `'uiux'` when view state is incomplete | Shared canvas substrate | Create World Shell with mode-neutral fallback or explicit mode input | Naming-only | [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:128) | Cosmetic |
| `CanvasRoot` imports `UIUXEmptyWorldOverlay` directly | Shared canvas substrate | Create World Shell exposing a projection slot consumed by language | Projection-only | [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:22) | Structural |
| `CanvasRoot` renders `UIUXEmptyWorldOverlay` inside shared overlay stack | Shared canvas substrate | Language projection mounted into Create World shell overlay surface | Projection-only | [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:474), [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:506) | Blocking |
| `uiuxWorkspace.js` activation contract still defines tools, panels, canvas defaults, and profile as a workspace-owned activation bundle | Legacy workspace activation | Mode/language activation projected into shared shell | True ownership blockage | [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:5), [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:24), [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:38) | Blocking |
| `uiuxWorkspace.js` expresses `extends: 'graphic'` in workspace terms | Legacy workspace activation | Language inheritance model, not workspace inheritance model | Naming-only | [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:11) | Cosmetic |
| `graphicWorkspace.js` is already a mode-level contract without its own shell/canvas owner | Graphic activation contract | Graphic language activation projected into shared shell | Not a leak. This is supporting evidence. | [graphicWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/graphicWorkspace.js:4), [graphicWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/graphicWorkspace.js:11) | Cosmetic |

## Answers

### 1. Which remaining UIUX references are only naming artifacts?

The following are naming-only:

- `/workspace/uiux` route identity
- dynamic `[mode]` route described in workspace terms
- `UIUXAuthoringShell` class/file naming
- `uiux-*` CSS and test ids
- `WorkspaceShell` comments claiming UIUX shell sovereignty
- `CanvasRoot` fallback mode defaulting to `'uiux'`
- `uiuxWorkspace.extends = 'graphic'` expressed in workspace terms

These references shape perception, not underlying runtime authority.

### 2. Which references still influence composition?

The following still influence composition:

- `WorkspaceShell` routing `uiux` into `UIUXAuthoringShell`
- `UIUXAuthoringShell` composing the visible top bar, tool rail, canvas dock, inspector dock, and timeline dock as a dedicated shell unit

These do not create runtime authority, but they still decide which shell gets mounted and how the user sees it.

### 3. Which references still influence authority?

The following still influence authority expression:

- `uiuxWorkspace.js` activation contract

Why:

- it remains the source of panel exposure
- it remains the source of tool exposure
- it remains the source of canvas defaults
- it remains the source of capability identity

This is the clearest remaining place where ownership is still expressed as workspace/mode activation rather than shared shell plus language projection.

### 4. Which references violate the intended dependency direction: Create World Shell -> Language Projection?

The strongest dependency-direction violation is:

- `CanvasRoot -> UIUXEmptyWorldOverlay`

Current direction:

`Create World substrate`
`-> imports UIUX language overlay`

Intended direction:

`Create World shell exposes projection surface`
`-> UIUX projects into it`

This is the cleanest remaining projection leak in the current architecture.

### 5. Which references would prevent Graphic from inheriting the shell cleanly?

The main risks for Graphic inheritance are:

- `WorkspaceShell` special-casing `uiux`
- `CanvasRoot` importing and mounting `UIUXEmptyWorldOverlay`
- `uiuxWorkspace.js` remaining the dominant activation pattern for shell-facing exposure

The route strings themselves do not block Graphic.
They merely obscure the ownership model.

## Leak Summary by Type

### Naming-only

- route labels and route strings
- workspace terminology in `[mode]` entry
- `UIUXAuthoringShell` naming
- `uiux-*` shell class names and test ids
- `CanvasRoot` fallback default `'uiux'`
- `uiuxWorkspace.extends = 'graphic'` expressed as workspace inheritance

Assessment:

These are mostly visibility problems.
They make the shell look more UIUX-owned than it really is.

### Composition-only

- `WorkspaceShell` shell routing
- `UIUXAuthoringShell` acting as the visible composition wrapper for shared shell surfaces

Assessment:

These are structural, but they do not prove UIUX owns runtime truth.
They prove the shell is still assembled through a UIUX-named composition boundary.

### Projection-only

- `CanvasRoot` importing `UIUXEmptyWorldOverlay`
- `CanvasRoot` mounting the overlay directly inside shared canvas overlay composition

Assessment:

This is the most important directionality leak.
It reverses the intended relationship between shared world shell and language projection.

### True ownership blockage

- `uiuxWorkspace.js` as the authoritative shell-facing activation bundle for tools, panels, and canvas defaults

Assessment:

This is the strongest remaining ownership blockage because it still causes shell-facing exposure to be expressed through a workspace-owned activation contract.

## Conclusion

Conclusion: `B`

Partially. One or more true ownership blockages should be addressed first.

Reasoning:

- Most remaining leaks are naming-only or composition-only.
- The architecture underneath is already more shared than the UI suggests.
- Graphic does not appear blocked by runtime, canvas, selection, viewport, or memory ownership.

But two seams remain stronger than cosmetic:

- `CanvasRoot -> UIUXEmptyWorldOverlay` is a blocking projection-direction leak.
- `uiuxWorkspace.js` remains a true ownership blockage because shell-facing exposure is still authored through a workspace-owned activation contract.

Therefore:

Graphic can likely be prototyped before full shell extraction.
But it cannot yet be described as inheriting a fully clean `Create World Shell -> Language Projection` model.

Current maturity reading:

- Create World Shell exists by responsibility.
- Product Expression exists by responsibility.
- UIUX Language exists by responsibility.
- Legacy composition and activation still hide that truth at the shell boundary.
