# Create World Activation Cleanup Plan

## Purpose

This document is a cleanup plan.

It does not implement code.
It does not rename routes.
It does not rename shells.
It does not modify runtime or dispatcher authority.
It does not change behavior.

Its purpose is to answer one narrow question:

`Which activation declarations are Creative Language truth, and which are shell-facing activation truth?`

This plan exists to separate activation ownership by evidence before moving code.

## Scope

Audited sources:

- [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:1)
- [graphicWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/graphicWorkspace.js:1)
- [resolveWorkspacePolicy.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/resolveWorkspacePolicy.js:1)
- [workspaceActivation.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/capabilities/workspaceActivation.js:1)
- [workspaceRegistryBridge.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/capabilities/workspaceRegistryBridge.js:1)
- [workspaceActivationFacade.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/bridges/workspaceActivationFacade.js:1)
- [toolDefinitions.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/tools/toolDefinitions.js:1)
- [nodeCreateIntent.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/creation/nodeCreateIntent.js:1)
- [WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx:1)
- [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:1)
- [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:1)
- [UIUXToolRail.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXToolRail.jsx:1)

Out of scope:

- route changes
- shell renames
- dispatcher/runtime changes
- behavior changes
- broad refactors

## Governing Constraints

This plan is subordinate to:

- [docs/LAW.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/LAW.md)
- [docs/CREATE_WORLD_SHELL_ACTIVATION_AUDIT.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_SHELL_ACTIVATION_AUDIT.md)
- [docs/CREATE_WORLD_ACTIVATION_OWNERSHIP_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_ACTIVATION_OWNERSHIP_MODEL.md)

Canonical activation law already frozen:

`Create World Shell activates surfaces.`

`Creative Languages populate surfaces.`

`Product Expression presents surfaces.`

## Current Activation Path

Current activation path is:

`workspace definition`
`-> resolveWorkspacePolicy()`
`-> normalizeWorkspacePolicy()`
`-> resolveWorkspaceActivationContract()`
`-> getWorkspaceActivation()`
`-> shell/tool/canvas consumers`

Evidence:

- [resolveWorkspacePolicy.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/resolveWorkspacePolicy.js:37)
- [workspaceRegistryBridge.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/capabilities/workspaceRegistryBridge.js:16)
- [workspaceActivation.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/capabilities/workspaceActivation.js:14)
- [workspaceActivationFacade.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/bridges/workspaceActivationFacade.js:156)

This means activation already exists as a lawful path.

The cleanup target is not creating a new subsystem.
The cleanup target is separating mixed source ownership inside existing declarations.

## Responsibility Table

| Current Responsibility | Current File | Current Owner | Intended Owner | Risk | Minimal Extraction Path | Stop Condition |
|---|---|---|---|---|---|---|
| Shared authoring tools such as `select`, `move`, `resize` | [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:32), [graphicWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/graphicWorkspace.js:10) | Legacy workspace activation | Create World Shell activation | Medium | Introduce a shared activation-owned tool baseline consumed by activation resolution, then let language definitions contribute only additions | Shared tools no longer need to be duplicated across language workspace files |
| Language-specific tools such as `frame`, `path`, future Graphic-only vocabulary tools | [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:32), [graphicWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/graphicWorkspace.js:10) | Workspace definitions | Creative Language | Low | Keep in language definitions; separate from shared tool baseline rather than moving them immediately | Language files declare only semantic or grammar-specific tool additions |
| Shared panel surfaces such as `NodeHeaderPanel`, `LayoutInspector`, `ContentPanel`, `ExportPreviewPanel` | [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:38), [graphicWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/graphicWorkspace.js:11) | Legacy workspace activation | Create World Shell activation | Medium | Define a shell-owned shared panel exposure baseline and let languages add semantic panels on top | Shared panels are not redundantly declared in each language workspace file |
| Language-specific projection panels such as `UIUXLanguageProjectionPanel` | [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:38) | Workspace definition | Creative Language | Low | Keep panel identity with the language; separate registration of shell slot from declaration of language panel | Language-specific panel remains declared by language, but shared shell no longer derives all panel exposure from one mixed list |
| Canvas policy primitives such as `allowPan`, `allowZoom`, `origin`, infinite-space interaction defaults | [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:14) | Legacy workspace activation | Create World Shell activation | Medium | Separate policy primitives from language file into a shared shell-owned activation defaults module consumed by resolution | Canvas policy primitives no longer originate inside `uiuxWorkspace.js` |
| Canvas surface styling such as dots/grid appearance | [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:24) | Legacy workspace activation | Product Expression by default, Creative Language if semantically meaningful | Low | Keep behavior unchanged; first classify each surface choice as visual framing vs semantic meaning before moving any declarations | Every surface default has an explicit owner classification rather than implicit workspace ownership |
| Timeline activation surface | [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:71), [workspaceActivation.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/capabilities/workspaceActivation.js:45) | Mixed workspace activation | Create World Shell activation for the surface, Creative Language for relevance and properties | Medium | Keep timeline capability object in place for now; separate “timeline available” from “timeline semantics for this language” | Shell can tell that a timeline surface exists without requiring UIUX to own the surface itself |
| Capability toggles that shape generic shell surface availability such as `canvas`, `timeline` | [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:42), [graphicWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/graphicWorkspace.js:19) | Mixed workspace activation | Create World Shell activation | Low | Keep booleans where they are initially, but reclassify them as shell activation exposure rather than language truth | Capability booleans are documented as shell-facing activation truth, not language semantics |
| Capability constraints that affect language grammar such as `rootNodeTypes`, `allowFrameNesting`, `allowRootShapes`, `autoLayoutParents` | [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:50) | Workspace definition | Creative Language | Low | Keep in language contract; explicitly exclude them from initial activation cleanup | Grammar constraints remain stable and are not moved during shell activation cleanup |
| Allowed event types and enabled trigger types | [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:58), [graphicWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/graphicWorkspace.js:30) | Workspace definition | Creative Language with runtime policy implications | High | Leave untouched in this cleanup plan; only document that they are not shell-surface exposure | No event or trigger behavior changes occur during activation cleanup |
| Tool exposure fallback logic | [toolDefinitions.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/tools/toolDefinitions.js:84) | Mixed consumer fallback | Create World Shell activation plus language additions | Medium | Reduce reliance on hardcoded fallback mode maps after shared tool baseline exists | Consumer can resolve visible tools from activation truth without mode-specific fallback tables dominating behavior |
| Tool-creation legality checks via activation tool list | [nodeCreateIntent.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/creation/nodeCreateIntent.js:41) | Consumer of mixed activation | Shell activation for shared creation legality plus Creative Language for grammar legality | Medium | Keep consumer unchanged initially; clean source ownership before touching legality consumers | Consumer reads the same activation shape, but the underlying source declarations are separated |
| Panel exposure consumption | [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:86) | Consumer of mixed activation | Create World Shell for panel slots; Creative Language for semantic panel contribution; Product Expression for framing | Low | Do not change consumer first; preserve current array contract while changing source ownership behind it | `PanelRenderer` keeps same interface during first cleanup slice |
| Canvas surface consumption | [WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx:137) | Consumer of mixed activation | Create World Shell for primitives; Product Expression or Creative Language for surface style | Low | Preserve current `canvasSurface` and `canvasPolicy` contract shape while separating source declarations | `WorkspaceCanvasRoot` behavior does not change during first cleanup slice |
| UIUX top-level creation entries resolved from visible tools plus UIUX dictionary | [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:99), [UIUXToolRail.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXToolRail.jsx:64) | Mixed shell/language consumer | Creative Language | Low | Leave in UIUX language layer; do not fold into shell activation cleanup | UIUX creation semantics remain language-owned and unchanged |

## Responsibility Classification Summary

### Already Evident as Creative Language Truth

These should remain language-declared during initial cleanup:

- language-specific tools
- language-specific projection panels
- scenario semantics
- creation vocabulary
- grammar constraints such as `rootNodeTypes` and `allowFrameNesting`

Evidence:

- [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:32)
- [graphicWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/graphicWorkspace.js:10)
- [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:99)

### Already Evident as Shell-Facing Activation Truth

These survive the disappearance test and should not remain sourced from language workspace files forever:

- shared authoring tools
- shared panel surfaces
- canvas policy primitives
- shell surface availability such as timeline presence

Evidence:

- [workspaceActivation.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/capabilities/workspaceActivation.js:14)
- [WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx:137)
- [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:86)

### Requires Explicit Classification Before Movement

These should not move in the first implementation slice:

- canvas surface styling
- timeline semantics
- allowed event types
- enabled trigger types

Reason:

These declarations combine shell concerns, product framing, and language grammar too tightly to move safely without a second pass.

## Recommended Cleanup Order

### Phase 1 — Freeze the Activation Contract Shape

Do not change consumer interfaces.

Preserve:

- `tools`
- `panels`
- `canvasPolicy`
- `canvasSurface`
- `timeline`

Reason:

Consumers such as [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:86), [WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx:137), and [toolDefinitions.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/tools/toolDefinitions.js:104) assume this shape.

### Phase 2 — Extract Shared Tool and Panel Baselines

First move only the clearly shared shell-facing exposure truths:

- shared tools baseline
- shared panels baseline

Reason:

These are the clearest mixed declarations and the lowest-risk way to separate shell exposure from language semantics without touching runtime or UI interfaces.

### Phase 3 — Extract Canvas Policy Primitives

After shared tool/panel baselines stabilize, separate:

- `allowPan`
- `allowZoom`
- `origin`
- generic world canvas interaction defaults

Keep `canvasSurface` styling in place until its owner is classified more precisely.

### Phase 4 — Reclassify Residual Language Truth

After the shell-facing baseline is out, the remaining workspace declarations become easier to classify as:

- Creative Language
- Product Expression
- residual activation exposure

## Lowest-Risk First Implementation Slice

The first implementation slice should be only:

`shared tool exposure baseline`

and optionally:

`shared panel exposure baseline`

Why this is lowest-risk:

- it does not change runtime truth
- it does not change shell interfaces
- it does not change route/shell naming
- it reduces duplication immediately
- it clarifies ownership without touching event policy or canvas behavior

Suggested first-slice target:

- shared activation-owned authoring tools:
  - `select`
  - `move`
  - `resize`

If expanded slightly:

- shared panel exposure baseline:
  - `NodeHeaderPanel`
  - `LayoutInspector`
  - `ContentPanel`
  - `ExportPreviewPanel`

## First-Slice Non-Goals

Do not include:

- `canvasPolicy`
- `canvasSurface`
- `allowedEventTypes`
- `enabledTriggerTypes`
- language-specific panels
- language-specific tools

These are not appropriate for the first cleanup slice.

## Stop Conditions

The activation cleanup should stop after the first slice if any of the following become true:

- a consumer requires interface changes beyond reading the same activation shape
- runtime legality or dispatcher behavior would need to change
- tool exposure can no longer be separated cleanly from language grammar
- panel exposure changes would force shell renames or route changes
- canvas behavior would need to change to preserve current tests

If any stop condition triggers, pause cleanup and produce a narrower follow-up plan rather than expanding scope.

## Recommendation

The repository is ready for a narrow activation cleanup.

It is not ready for broad activation extraction.

Recommended next move:

1. Preserve current activation contract shape.
2. Extract only the shared shell-facing tool baseline.
3. Optionally extract the shared panel baseline if the tool slice remains clean.
4. Stop before touching canvas policy, event policy, or language-specific semantics.

This keeps the first slice lawful, low-risk, and evidence-aligned with the already-frozen Create World activation ownership model.
