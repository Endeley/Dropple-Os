# Create World Shell Activation Audit

## Purpose

This document is a proof artifact.

It does not modify code.
It does not extract shell activation.
It does not change routing or runtime behavior.

Its purpose is to answer one narrow question:

`Should shell-facing exposure remain attached to language contracts, or is there a missing activation layer between Create World Shell and Creative Language?`

Target chain:

`Create World Shell`
`-> Shell Activation`
`-> Creative Language`

## Scope

Audited files:

- [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:1)
- [graphicWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/graphicWorkspace.js:1)
- [workspaces/registry/index.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/index.js:1)
- [workspaceActivationFacade.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/bridges/workspaceActivationFacade.js:1)
- [platform/capabilities/workspaceActivation.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/capabilities/workspaceActivation.js:1)
- [WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx:1)
- [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:1)
- [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:1)

Out of scope:

- runtime execution ownership
- route ownership
- Create World navigation/geography

## Activation Path

Current shell-facing activation path is:

`workspace definition`
`-> resolveWorkspaceActivationContract()`
`-> getWorkspaceActivation()`
`-> shell consumers`

Evidence:

- [platform/capabilities/workspaceActivation.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/capabilities/workspaceActivation.js:14) builds an activation contract from policy plus capability activation.
- [workspaceActivationFacade.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/bridges/workspaceActivationFacade.js:156) exposes the activation object to UI consumers.
- [WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx:135) reads `canvasSurface` from activation.
- [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:87) reads `panels` from activation.

This means a shell-facing activation layer already exists in runtime shape.

The open question is not whether activation exists.
The open question is whether its source ownership is clean.

## 1. Panel Exposure

Current example:

`uiuxWorkspace.js`
`panels: ['SelectionActionsPanel', 'UIUXLanguageProjectionPanel', ...]`

Evidence:

- [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:38)
- [graphicWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/graphicWorkspace.js:11)
- [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:96)

Classification:

- Shared shell section structure:
  `Create World Shell`
- Language-specific panels such as `UIUXLanguageProjectionPanel`:
  `Creative Language`
- Panel list assembly currently declared in workspace definitions and surfaced through activation:
  `Legacy Workspace Activation`

Assessment:

Panel exposure is mixed.

Why:

- `PanelRenderer` already owns generic panel framing, sectioning, tabs, and emergence.
- UIUX-specific semantic panels are clearly language-owned.
- But the authoritative exposure list is still declared in `uiuxWorkspace.js`, which means activation still mixes shell-facing concerns and language concerns in one contract.

## 2. Tool Exposure

Current example:

`uiuxWorkspace.js`
`tools: ['select', 'move', 'resize', 'text', 'image', 'frame', 'shape', 'path']`

`graphicWorkspace.js`
`tools: ['select', 'move', 'resize', 'text', 'shape', 'image']`

Evidence:

- [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:32)
- [graphicWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/graphicWorkspace.js:10)
- [platform/capabilities/workspaceActivation.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/capabilities/workspaceActivation.js:22)

Classification:

- Shared authoring tools such as `select`, `move`, `resize`:
  `Create World Shell`
- Grammar-specific tools such as `frame`, `path`, future `artboard`:
  `Creative Language`
- Final exposed tool list currently assembled through activation from workspace policy:
  `Legacy Workspace Activation`

Assessment:

Tool exposure is also mixed.

The audit does not support the idea that all tools are language tools.
It supports a split:

- world tools
- language tools

But the current contract publishes them through one workspace-owned activation source.

## 3. Canvas Defaults

Current example:

- `canvasPolicy`
- `canvasSurface`

Evidence:

- [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:14)
- [workspaceActivationFacade.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/bridges/workspaceActivationFacade.js:149)
- [WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx:140)
- [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:130)

Disappearance test:

If UIUX disappeared tomorrow, would canvas defaults still need to exist?

Yes.

Classification:

- Canvas policy primitives:
  `Create World Shell`
- Language-preferred surface styling such as `dots` for UIUX:
  `Product Expression` or `Creative Language`, depending whether it is semantic or merely visual
- Current declaration site:
  `Legacy Workspace Activation`

Assessment:

Canvas defaults should not remain fully workspace-owned.

The shell needs canvas defaults.
But not all defaults are the same kind of truth:

- pan/zoom/origin policy reads as world-owned
- surface look and feel may be expression-owned or language-owned

The current `uiuxWorkspace.js` shape collapses both into one activation policy.

## 4. Empty World Projection

Current example:

`CanvasRoot`
`-> UIUXEmptyWorldOverlay`

Evidence:

- [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:22)
- [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:506)

Classification:

- Overlay slot/emergence surface:
  `Create World Shell`
- Empty World content and starter semantics:
  `Creative Language`
- Visual pattern of the Empty World experience:
  `Product Expression`
- Current mounting direction:
  `Legacy composition leak`

Assessment:

The shell should not decide `UIUXEmptyWorldOverlay`.

The shell should decide:

- whether an empty-world projection surface exists
- when it becomes visible

The language should decide:

- what world it describes
- what the first artifact is
- what the creator should do next

This is evidence of mixed shell activation and projection registration, not evidence of a missing runtime subsystem.

## 5. Language Projection

Current examples:

- `UIUXLanguageProjectionPanel`
- scenario projection
- meaning projection
- momentum projection

Evidence:

- [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:38)
- [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:290)
- [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:44)

Classification:

- Projection content:
  `Creative Language`
- Projection placement surface:
  `Create World Shell`
- Projection framing:
  `Product Expression`
- Projection registration currently implied by workspace panel exposure:
  `Legacy Workspace Activation`

Assessment:

Language projection registration is currently shell-facing but still declared in the workspace definition.

That again points to mixed ownership:

- shell owns where projection can appear
- language owns what projection says
- activation currently conflates both by listing the panel in the workspace contract

## 6. Activation Authority

Central question:

Is `uiuxWorkspace.js` acting as:

- `A. UIUX Language Contract`
- `B. Workspace Activation Contract`
- `C. A mixture of both`

Evidence:

- It declares language-shaped tools and panels:
  [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:32)
- It declares shell-facing canvas policy and surface defaults:
  [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:14)
- It declares shell-facing exposure lists consumed by activation:
  [platform/capabilities/workspaceActivation.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/capabilities/workspaceActivation.js:29)
- It is adapted into a contract registry entry:
  [workspaces/registry/index.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/index.js:20)

Finding:

`uiuxWorkspace.js` is `C. A mixture of both`.

Why:

It carries at least two distinct kinds of truth at once:

- language truth
  Examples:
  `frame`, `UIUXLanguageProjectionPanel`, UIUX-specific semantic surfaces
- shell activation truth
  Examples:
  `canvasPolicy`, `canvasSurface`, exposure lists consumed by `WorkspaceCanvasRoot` and `PanelRenderer`

That is the strongest remaining ownership mix in the shell layer.

## Decision Table

| Concern | Current Owner | Intended Owner | Current State |
|---|---|---|---|
| Panel framing and section structure | `PanelRenderer` | Create World Shell | Mostly resolved |
| Panel exposure list | `uiuxWorkspace.js` via activation | Mixed: Create World Shell + Creative Language | Mixed ownership |
| Shared tools | `uiuxWorkspace.js` / `graphicWorkspace.js` via activation | Create World Shell | Mixed ownership |
| Language-specific tools | `uiuxWorkspace.js` / `graphicWorkspace.js` | Creative Language | Correct content, wrong activation boundary |
| Canvas policy primitives | `uiuxWorkspace.js` via activation | Create World Shell | Mixed ownership |
| Canvas surface style defaults | `uiuxWorkspace.js` via activation | Product Expression or Creative Language | Mixed ownership |
| Empty world visibility surface | `CanvasRoot` | Create World Shell | Mixed ownership |
| Empty world content | `UIUXEmptyWorldOverlay` | Creative Language + Product Expression | Correct content, wrong mounting direction |
| Language projection content | UIUX semantic panels | Creative Language | Resolved |
| Language projection registration | `uiuxWorkspace.js` via activation | Mixed: Create World Shell + Creative Language | Mixed ownership |

## Conclusion

Conclusion: `B`

`uiuxWorkspace.js` contains mixed language and shell activation ownership.

Activation clarification should happen before Graphic inheritance is treated as cleanly proven.

Why not `A`:

- `uiuxWorkspace.js` is not only a language contract.
- It still declares shell-facing exposure and canvas defaults consumed by shared shell surfaces.

Why not `C`:

- A shell activation layer already exists in runtime shape.
- `resolveWorkspaceActivationContract()` and `getWorkspaceActivation()` already form an activation layer.
- The unresolved issue is source ownership, not total absence.

Final reading:

- Create World Shell exists by responsibility.
- Shell activation exists by runtime shape.
- `uiuxWorkspace.js` still mixes language truth and shell activation truth.

That means the remaining work is not inventing another architecture.

It is clarifying which activation responsibilities belong to:

- Create World Shell
- Creative Language
- Product Expression

before Graphic can inherit the shell with a clean ownership story.
