# Create World Shell Boundary Audit

## Purpose

This document is a proof artifact.

It does not extract code.
It does not rename routes.
It does not refactor shells.

It exists to answer one question:

`Who actually owns the authoring shell experience today?`

This audit is responsibility-first.
It does not classify by file name alone.

Primary rule:

`If UIUX disappeared tomorrow and Graphic became active, would this responsibility still need to exist?`

If yes:

- classify as `Create World Shell` or `Product Expression`

If no:

- classify as `UIUX Language`

If it only remains because legacy route or workspace structures still declare UIUX as sovereign:

- classify as `Legacy Workspace Ownership`

## 1. Responsibility Classification

| Responsibility | Current Owner | True Owner | Evidence |
|---|---|---|---|
| Mode-based route entry at `/workspace/uiux` | legacy workspace route | Legacy Workspace Ownership | [app/workspace/[mode]/page.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/app/workspace/[mode]/page.js:1), [workspaces/registry/routes.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/routes.js:5) |
| Shell decision `uiux -> UIUXAuthoringShell` | `WorkspaceShell` | Legacy Workspace Ownership | [WorkspaceShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/WorkspaceShell.jsx:24) |
| Canvas stage mounting | `UIUXCanvasStage` wrapper | Create World Shell | [UIUXCanvasStage.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXCanvasStage.jsx:5), [WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx:117) |
| Workspace activation for live canvas | `WorkspaceCanvasRoot` | Create World Shell | [WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx:126) |
| Shared canvas substrate | `CanvasRoot` | Create World Shell | [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:100) |
| Viewport initialization and home viewport entry | `CanvasRoot` + navigation policy | Create World Shell | [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:286), [projectSubstrateNavigation.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/workspaces/projectSubstrateNavigation.js:219) |
| Home / focus / origin / geography policy | Create World navigation policy | Create World Shell | [CREATE_WORLD_NAVIGATION_AND_GEOGRAPHY_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_NAVIGATION_AND_GEOGRAPHY_MODEL.md:20) |
| World memory and worked-world distinction | Create World navigation policy | Create World Shell | [CREATE_WORLD_NAVIGATION_AND_GEOGRAPHY_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_NAVIGATION_AND_GEOGRAPHY_MODEL.md:29), [uiuxEmptyWorldExpression.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/uiuxEmptyWorldExpression.js:58) |
| First artifact placement | node create intent + Create World policy | Create World Shell | [nodeCreateIntent.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/creation/nodeCreateIntent.js:98), [CREATE_WORLD_NAVIGATION_AND_GEOGRAPHY_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_NAVIGATION_AND_GEOGRAPHY_MODEL.md:71) |
| Selection emergence for created/selected work | runtime selection + shared bridges | Create World Shell | [selectionIntentBridge.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/bridges/selectionIntentBridge.js:13), [selectionReducers.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/core/events/reducers/selectionReducers.js:31) |
| Context menu, guides, ghost layers, host datasets | `CanvasRoot` | Create World Shell | [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:205), [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:278) |
| Inspector shell emergence from selection | `UIUXAuthoringShell` gating + `PanelRenderer` shell | Create World Shell | [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:114), [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:136) |
| Panel section structure | `PanelRenderer` | Create World Shell | [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:44) |
| Inspector shell framing and tab surfaces | `PanelRenderer` | Product Expression | [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:173) |
| Top bar presentation | `UIUXTopBar` through `UIUXAuthoringShell` | Product Expression | [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:360) |
| Tool rail presentation | `UIUXToolRail` through `UIUXAuthoringShell` | Product Expression | [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:396) |
| Dock layout and shell choreography | `UIUXAuthoringShell` | Product Expression | [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:348) |
| Status strip emergence | `UIUXAuthoringShell` + design strip | Product Expression | [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:386) |
| Empty World copy and card presentation | `UIUXEmptyWorldOverlay` | Product Expression | [UIUXEmptyWorldOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXEmptyWorldOverlay.jsx:101) |
| Empty World starter semantics | `uiuxEmptyWorldExpression` | UIUX Language | [uiuxEmptyWorldExpression.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/uiuxEmptyWorldExpression.js:7) |
| Page / Application meaning | UIUX dictionary | UIUX Language | [uiuxLanguageDictionary.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/uiuxLanguageDictionary.js:121) |
| Landing Page / Dashboard / Login / Settings semantics | UIUX dictionary | UIUX Language | [uiuxLanguageDictionary.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/uiuxLanguageDictionary.js:13) |
| Scenario provision and precedence | `resolveUIUXScenarioProvision()` | UIUX Language | [uiuxScenarioProvision.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/uiuxScenarioProvision.js:79) |
| Identity / meaning / evolution / next meaningful steps | `UIUXLanguageProjectionPanel` | UIUX Language | [UIUXLanguageProjectionPanel.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXLanguageProjectionPanel.jsx:56) |
| Explicit scenario selection persistence | `UIUXAuthoringShell` local storage | UIUX Language | [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:131) |
| Workspace activation contract exposing UIUX panels/tools/canvas defaults | `uiuxWorkspace.js` | Legacy Workspace Ownership | [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:5) |

## 2. UIUX Disappearance Test

Question:

`If UIUX disappeared tomorrow and Graphic became active, would this responsibility still need to exist?`

### Yes, it would still need to exist

These responsibilities survive the test:

- canvas mounting
- canvas substrate
- viewport initialization
- home / focus / geography
- world memory
- first artifact placement
- selection emergence
- inspector emergence
- panel section structure
- dock choreography
- top-level shell presentation surfaces

These are not UIUX-specific by necessity.
They are world-shell or product-expression responsibilities.

### No, it would not still need to exist in the same form

These responsibilities fail the test:

- `Page`
- `Application`
- `Landing Page`
- `Dashboard`
- `Login`
- `Settings`
- scenario semantics
- meaning projection
- scenario-shaped momentum
- next meaningful steps for digital product design

These are clearly UIUX language responsibilities.

### Yes, but expressed differently

These responsibilities survive the test, but not with the same content:

- top bar presentation
- tool rail presentation
- dock layout
- empty world presentation
- inspector framing

These belong to Product Expression.
They are not UIUX Language and not runtime truth.

## 3. Create World Shell Responsibilities

The following responsibilities are responsibility-verified as Create World Shell:

- shared canvas mounting
- shared canvas substrate
- viewport/home/focus/origin behavior
- world geography
- world memory
- first artifact placement
- selection emergence
- inspector emergence
- panel section structure
- return-home concept
- context menu and guide surface integration

Strongest evidence:

- [WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx:117)
- [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:100)
- [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:44)
- [projectSubstrateNavigation.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/workspaces/projectSubstrateNavigation.js:219)

## 4. UIUX Language Responsibilities

The following responsibilities are responsibility-verified as UIUX Language:

- `Page` identity
- `Application` meaning
- `Landing Page`
- `Dashboard`
- `Login`
- `Settings`
- scenario semantics
- scenario precedence/provision
- UIUX creation vocabulary
- UIUX semantic projection
- next meaningful steps for digital product design

Strongest evidence:

- [uiuxLanguageDictionary.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/uiuxLanguageDictionary.js:121)
- [uiuxScenarioProvision.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/uiuxScenarioProvision.js:79)
- [UIUXLanguageProjectionPanel.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXLanguageProjectionPanel.jsx:43)

## 5. Product Expression Responsibilities

The following responsibilities are responsibility-verified as Product Expression:

- top bar presentation
- tool rail presentation
- dock layout
- status strip choreography
- empty world presentation
- inspector framing
- guidance surfacing

These are still needed if Graphic becomes active, but the language projected through them would differ.

Strongest evidence:

- [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:348)
- [UIUXEmptyWorldOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXEmptyWorldOverlay.jsx:101)
- [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:173)

## 6. Legacy Workspace Responsibilities

The following responsibilities are responsibility-verified as Legacy Workspace Ownership:

- `/workspace/uiux` route identity
- shell routing by workspace/mode family
- UIUX activation contract as a workspace definition
- panel/tool exposure through `uiuxWorkspace.js`

These are the main remaining owners that still obscure the true architecture.

Strongest evidence:

- [app/workspace/[mode]/page.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/app/workspace/[mode]/page.js:1)
- [WorkspaceShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/WorkspaceShell.jsx:24)
- [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:5)
- [routes.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/routes.js:5)

## 7. Conclusion

Can the architecture honestly be described as:

`One Create World`

`-> Many Creative Languages`

Not completely.

It can be described that way at the level of responsibilities for:

- Create World Shell
- UIUX Language
- Product Expression

But it cannot yet be described that way at the outer shell boundary because legacy workspace routing, activation contracts, and shell naming still obscure ownership.

Current evidence supports this status:

`Create World Shell`
Status: `Responsibility-Verified`

`UIUX Language`
Status: `Responsibility-Verified`

`Product Expression`
Status: `Responsibility-Verified`

Remaining gap:

- legacy workspace routing
- activation contracts
- shell naming

These do not prove that UIUX still truly owns the authoring experience.
They prove that legacy workspace structures still describe it that way.
