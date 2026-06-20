# World Authority Audit

Purpose

This document audits the current codebase through one question:

Who owns behavior?

It is not a workspace removal plan.
It is an authority removal plan.

Frozen rule

Do not remove workspaces from the product.
Remove workspaces from authority.

This audit is seeded from the active codebase as of `2026-06-14`.

## WorldShell Authority Principle

Behavior may have many surfaces.
Behavior may have many adapters.
Behavior may have only one authority.

## Migration Rule

Step 1:
Remove authority duplication

Step 2:
Freeze authority ownership

Step 3:
Deprecate legacy paths

Step 4:
Remove dead code

Not:

Delete code first
then
figure out ownership later.

## Current Direction

Dropple is converging toward:

`Project World -> Home -> Artifacts -> Work`

not:

`Workspace -> Editor -> Canvas -> Objects`

That means the following systems should become world authorities:

- substrate / canvas ownership
- navigation
- selection
- drag
- resize
- delete
- history
- memory

And the following should stop owning truth:

- old workspace shells
- old editor compositions
- compatibility facades
- duplicate action surfaces

## Bucket Definitions

### Authoritative

Owns runtime behavior or constitutional UI behavior.

These files should be strengthened, not bypassed.

### Adapters

Translate UI or compatibility input into the authoritative path.

May observe.
May adapt.
May not own truth.

### Legacy-but-kept

Still present in product or repo, but should stop owning behavior.

### Removal Candidate

Safe to remove only after no active behavior depends on it.

## System Audit

### 1. World Shell / Substrate Ownership

Authoritative

- [ui/workspace/WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx)
  - active canvas entrypoint for Create/UI
  - activates workspace and mounts `CanvasRoot`
- [ui/canvas/CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx)
  - active world surface owner
  - owns viewport init, context menu state, world datasets, selection action wiring
- [ui/canvas/CanvasHost.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasHost.jsx)
  - active host for viewport/camera/substrate rendering
- [ui/canvas/surface/CanvasSurface.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/surface/CanvasSurface.jsx)
  - active substrate visual surface

Adapters

- [ui/workspace/uiux/UIUXCanvasStage.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXCanvasStage.jsx)
  - mounts `WorkspaceCanvasRoot`
  - should remain composition-only
- [ui/workspace/uiux/UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx)
  - composes the world shell surfaces around the substrate

Legacy-but-kept

- [ui/workspace/editor/EditorWorkspaceLayout.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/editor/EditorWorkspaceLayout.jsx)
  - older editor-shaped shell
- [ui/workspace/editor/EditorWorkspaceShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/editor/EditorWorkspaceShell.jsx)
  - generic editor fallback
- [ui/workspace/shell/ProjectPerspectiveShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/ProjectPerspectiveShell.jsx)
  - still wraps shells and may still carry older perspective-era assumptions
- [ui/workspace/shell/ProjectUniverseCanvas.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/ProjectUniverseCanvas.jsx)
  - legacy universe surface
  - not the active Create/UI world authority

Removal candidate later

- duplicate workspace-specific canvas wrappers that no longer own active behavior

Verdict

The active substrate authority is already fairly concentrated:

`WorkspaceCanvasRoot -> CanvasRoot -> CanvasHost -> CanvasSurface`

This is good and should remain the canonical world path.

### 2. Shell Routing

Authoritative

- [ui/workspace/shell/WorkspaceShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/WorkspaceShell.jsx)
  - current top-level shell router
  - still routes by mode/workspace family

Adapters

- [ui/workspace/shell/ModeLoader.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/ModeLoader.jsx)
- [ui/workspace/root/WorkspaceRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/root/WorkspaceRoot.jsx)

Legacy-but-kept

- dedicated shell forks for media/editor/ux validation

Risk

`WorkspaceShell` still encodes a multi-shell worldview:

- media -> media shell
- ux validation -> ux shell
- uiux -> dedicated shell
- all else -> editor shell

That is acceptable for now, but long term shell routing should become less behavior-sovereign and more overlay/composition-based.

### 3. Selection

Authoritative

- [core/events/reducers/selectionReducers.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/core/events/reducers/selectionReducers.js)
  - canonical runtime selection truth
  - clears deleted selection on `node/delete`
- [runtime/selection/selectBounds.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/selection/selectBounds.js)
  - runtime selection/bounds behavior

Adapters

- [ui/canvas/CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx)
  - opens context menu against selected/targeted node
- [ui/interactions/useCanvasInteractions.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/interactions/useCanvasInteractions.js)
  - routes pointer input into runtime input handling
- [ui/workspace/shared/SelectionContext.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shared/SelectionContext.jsx)
  - legacy context layer; should not own selection truth

Legacy-but-kept

- selection handling embedded in older workspace/editor shells

Verdict

Selection truth is canonical in reducer space.
This is already on the right side of the authority boundary.

### 4. Drag

Authoritative

- [runtime/input/inputEngine.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/input/inputEngine.js)
  - canonical dispatcher-owned input ingress
- [runtime/input/coreToolHandlers.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/input/coreToolHandlers.js)
  - active move/resize/rotate session authority
- [runtime/interaction/dragRuntime.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/interaction/dragRuntime.js)
  - drag session state machine
- [runtime/interaction/dragEngine.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/interaction/dragEngine.js)
  - pure drag delta math
- [runtime/input/sessionCommitRuntimeBridge.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/input/sessionCommitRuntimeBridge.js)
  - commit bridge from preview/session into authored state

Adapters

- [ui/interactions/useCanvasInteractions.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/interactions/useCanvasInteractions.js)
  - canonical UI-to-input adapter
- [ui/bridges/inputEngineFacade.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/bridges/inputEngineFacade.js)
  - adapter into runtime input engine

Legacy-but-kept

- older interaction/session code under `runtime/interactions/` and duplicate legacy wrappers

Verdict

Drag authority is already centralized enough to debug confidently.
This should be the only active drag path for Create/UI.

### 5. Resize

Authoritative

- [runtime/input/coreToolHandlers.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/input/coreToolHandlers.js)
  - active resize session orchestration
- [runtime/transforms/computeResizeDelta.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/transforms/computeResizeDelta.js)
  - active resize delta truth in current path

Legacy-but-kept

- [runtime/interaction/resizeEngine.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/interaction/resizeEngine.js)
  - older interaction-layer implementation
- [runtime/interaction/resizeEngine 2.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/interaction/resizeEngine 2.js)
  - duplicate legacy file and strong removal candidate once verified unused

Verdict

Resize is more fragmented than drag.
This is one of the clearest places where “remove authority before removing code” applies.

### 6. Delete

Authoritative

- [core/events/eventTypes.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/core/events/eventTypes.js)
  - canonical event: `EventTypes.NODE_DELETE` -> `node/delete`
- [core/events/reducers/nodeReducers.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/core/events/reducers/nodeReducers.js)

### 6.5 Grouping

Authoritative

- Shared Interaction Authority
- [runtime/commands/structure/wrapSelection.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/commands/structure/wrapSelection.js)
- [runtime/commands/structure/unwrapNode.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/commands/structure/unwrapNode.js)
- [core/events/reducers/nodeStructureReducers.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/core/events/reducers/nodeStructureReducers.js)

Adapters

- [ui/canvas/SelectionContextMenu.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/SelectionContextMenu.jsx)
- [ui/keyboard/useGroupShortcuts.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/keyboard/useGroupShortcuts.js)
- [ui/inspector/SelectionActionsPanel.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/inspector/SelectionActionsPanel.jsx)

Legacy-but-kept

- any mode-local grouping assumptions or older editor-shell grouping surfaces

Removal candidate later

- duplicate mode-owned grouping implementations

See:

- [GROUPING_AND_MERGING_LAW.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/GROUPING_AND_MERGING_LAW.md)

Verdict

Grouping belongs to Shared Interaction, not to UIUX, Graphic, Animation, or any other grammar.
Modes may expose grouping.
Modes may not own grouping truth.
  - structural delete truth
  - subtree removal
  - world history preserved
- [core/events/reducers/selectionReducers.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/core/events/reducers/selectionReducers.js)
  - selection cleanup on delete
- [ui/canvas/deleteSelection.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/deleteSelection.js)
  - shared active Create/UI delete helper

Adapters

- [ui/canvas/SelectionContextMenu.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/SelectionContextMenu.jsx)
  - quick delete surface
- [ui/interaction/interaction/useKeyboardShortcuts.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/interaction/interaction/useKeyboardShortcuts.js)
  - power delete surface

Legacy-but-kept

- [ui/inspector/nodeUpdateIntent.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/inspector/nodeUpdateIntent.js)
  - still emits delete intent and can confuse ownership if used as an active delete path
- [ui/bridges/intentEventFacade.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/bridges/intentEventFacade.js)
- [ui/bridges/nodeUpdateBridge.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/bridges/nodeUpdateBridge.js)
  - compatibility/translation surfaces

Legacy-but-kept, separate domain

- graph delete path:
  - [ui/bridges/graphIntentBridge.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/bridges/graphIntentBridge.js)
  - [core/events/reducers/graphInteractionReducer.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/core/events/reducers/graphInteractionReducer.js)
  - [core/events/reducers/graphReducers.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/core/events/reducers/graphReducers.js)

Verdict

Create/UI delete authority is now conceptually clean:

`Context menu or Keyboard -> dispatchNodeDeleteSelection -> EventTypes.NODE_DELETE -> nodeReducers + selectionReducers`

The remaining problem is rendered behavior and duplicate surfaces, not missing canonical authority.

### 7. Navigation / Home / Focus

Authoritative

- [runtime/workspaces/projectSubstrateNavigation.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/workspaces/projectSubstrateNavigation.js)
  - canonical world navigation law
  - project origin
  - project home
  - current focus
  - first-frame placement
  - worked-vs-empty world distinction

Adapters

- [ui/canvas/HomeLandmark.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/HomeLandmark.jsx)
  - visual projection of home
- [ui/workspace/uiux/UIUXToolRail.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXToolRail.jsx)
  - return-home style actions via viewport intent
- [ui/canvas/CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx)
  - viewport initialization against project home

Verdict

Navigation authority is already world-centric and should remain outside workspace-specific shells.

### 8. History / Memory

Authoritative

- [core/events/reducers/nodeReducers.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/core/events/reducers/nodeReducers.js)
  - seeds `document.world.history.firstRememberedArtifact`
- [runtime/workspaces/projectSubstrateNavigation.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/workspaces/projectSubstrateNavigation.js)
  - resolves `hasProjectHistory`
  - resolves `firstRememberedArtifact`
- [runtime/__tests__/projectWorldMemory.test.mjs](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/__tests__/projectWorldMemory.test.mjs)
  - current proof surface for project memory laws

Adapters

- [ui/canvas/CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx)
  - projects memory state into dataset flags
- [ui/canvas/FirstFrameAffordance.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/FirstFrameAffordance.jsx)
  - world-side expression of empty/first-act state

Verdict

History/memory is already closer to world authority than most other systems.
Do not move this back into workspace UI panels.

## Active Create/UI Authority Chain

This is the current best reading of the active Create/UI path:

### World / Substrate

`WorkspaceCanvasRoot`
-> `CanvasRoot`
-> `CanvasHost`
-> `CanvasSurface`

### Input / Interaction

`useCanvasInteractions`
-> `inputEngine`
-> `coreToolHandlers`
-> dispatcher events

### Delete

`SelectionContextMenu` or `useKeyboardShortcuts`
-> `dispatchNodeDeleteSelection`
-> `EventTypes.NODE_DELETE`
-> `nodeReducers`
-> `selectionReducers`

### Navigation / Home / Memory

`projectSubstrateNavigation`
-> `CanvasRoot` / `HomeLandmark` / `FirstFrameAffordance`

This is the path that should be protected.

## Legacy Surfaces Still Causing Complexity

These are the main sources of current architectural noise:

### Legacy shell forks

- `ui/workspace/editor/*`
- `ui/workspace/ux/*`
- `ui/workspace/media/*`
- `ui/workspace/shell/ProjectPerspectiveShell.jsx`
- `ui/workspace/shell/ProjectUniverseCanvas.jsx`

### Duplicate or competing interaction implementations

- `runtime/interaction/resizeEngine.js`
- `runtime/interaction/resizeEngine 2.js`
- older `runtime/interactions/*` session code

### Duplicate delete-adjacent surfaces

- inspector-driven delete affordances
- context menu delete
- keyboard delete
- legacy node update delete bridges

The goal is not to delete all of these today.
The goal is to stop them from owning active Create/UI behavior.

## Recommended Classification

### Keep and strengthen

- `ui/workspace/WorkspaceCanvasRoot.jsx`
- `ui/canvas/CanvasRoot.jsx`
- `ui/interactions/useCanvasInteractions.js`
- `runtime/input/inputEngine.js`
- `runtime/input/coreToolHandlers.js`
- `core/events/reducers/nodeReducers.js`
- `core/events/reducers/selectionReducers.js`
- `runtime/workspaces/projectSubstrateNavigation.js`
- `ui/canvas/deleteSelection.js`

### Keep as adapters only

- `ui/canvas/SelectionContextMenu.jsx`
- `ui/interaction/interaction/useKeyboardShortcuts.js`
- `ui/workspace/uiux/UIUXAuthoringShell.jsx`
- `ui/workspace/uiux/UIUXCanvasStage.jsx`
- `ui/workspace/uiux/UIUXToolRail.jsx`
- `ui/bridges/*` surfaces that translate into canonical runtime paths

### Freeze as legacy-but-kept

- `ui/workspace/editor/*`
- `ui/workspace/ux/*`
- `ui/workspace/media/*`
- `ui/workspace/shell/ProjectPerspectiveShell.jsx`
- `ui/workspace/shell/ProjectUniverseCanvas.jsx`
- graph-specific delete/interaction stack, as a separate domain

### Investigate for removal later

- `runtime/interaction/resizeEngine 2.js`
- duplicate workspace-specific shell chrome
- duplicate interaction implementations that no longer feed the active Create/UI path

## Concrete Action List

This section turns the audit into execution order.

### Phase 1 - Freeze the active Create/UI authority path

Goal

Make the active Create/UI path the only path allowed to own behavior.

Action list

- Keep `WorkspaceCanvasRoot -> CanvasRoot -> CanvasHost -> CanvasSurface` as the only active substrate path.
- Keep `useCanvasInteractions -> inputEngine -> coreToolHandlers` as the only active interaction path.
- Keep `SelectionContextMenu or Keyboard -> dispatchNodeDeleteSelection -> EventTypes.NODE_DELETE -> nodeReducers + selectionReducers` as the only active delete path.
- Keep `projectSubstrateNavigation` as the only active authority for Home, Focus, and project history state.
- Stop routing new Create/UI fixes into `editor/*`, `ux/*`, `media/*`, `ProjectPerspectiveShell`, or `ProjectUniverseCanvas`.

Acceptance

- Every active Create/UI bug can be traced to one substrate path, one interaction path, one delete path, and one navigation path.

Active Create/UI delete checklist

- Quick delete surface: `SelectionContextMenu`
- Power delete surface: active `UIUXAuthoringShell` keyboard handler
- Shared helper: `ui/canvas/deleteSelection.js`
- Canonical runtime event: `EventTypes.NODE_DELETE`
- Canonical reducer chain: `nodeReducers -> selectionReducers`
- Explicitly disallow: resize inside the delete context menu
- Explicitly disallow: inspector-owned frame delete as a second authority

### Phase 2 - Demote duplicate authorities to adapters only

Goal

Allow legacy surfaces to remain present without letting them own truth.

Action list

- Demote `UIUXAuthoringShell`, `UIUXCanvasStage`, and `UIUXToolRail` to composition-only surfaces.
- Demote `SelectionContextMenu` and keyboard shortcuts to trigger surfaces only.
- Demote `ui/bridges/*` files to translation-only surfaces. They may forward to runtime truth, but may not invent parallel truth.
- Demote inspector actions so they never become a second delete, resize, or selection authority.
- Prevent any workspace-local context or panel from owning selection, drag session state, resize session state, or history state.

Acceptance

- Adapters may trigger behavior, but they may not define behavior.

### Phase 3 - Isolate legacy stacks

Goal

Stop legacy shells and duplicate engines from confusing the active architecture.

Action list

- Mark `ui/workspace/editor/*`, `ui/workspace/ux/*`, and `ui/workspace/media/*` as legacy-but-kept in practice as well as in docs.
- Keep `ProjectPerspectiveShell.jsx` and `ProjectUniverseCanvas.jsx` out of the active Create/UI bug-fix lane.
- Audit `runtime/interaction/resizeEngine.js` and `runtime/interaction/resizeEngine 2.js` and decide which one is active. Freeze the other as legacy immediately.
- Audit older `runtime/interactions/*` session code and document whether it still participates in Create/UI.
- Keep graph delete and graph interaction as a separate domain; do not mix graph cleanup with Create/UI cleanup.

Acceptance

- When debugging Create/UI, there is no ambiguity about whether a legacy stack is still participating.

### Phase 4 - System-by-system ownership cleanup

Goal

Finish one authority decision per core world behavior.

#### Selection

- Keep `selectionReducers` as canonical selection truth.
- Remove or demote any workspace-local selection ownership.
- Ensure deleted nodes cannot remain selected.

#### Delete

- Keep `EventTypes.NODE_DELETE`, `nodeReducers`, and `selectionReducers` as the canonical delete chain.
- Use one shared Create/UI delete helper for both context menu and keyboard.
- Remove duplicate floating delete surfaces.
- Remove inspector-owned delete as an active Create/UI delete authority.

#### Drag

- Keep `useCanvasInteractions -> inputEngine -> coreToolHandlers` as the only active drag path.
- Prevent shells or panels from owning drag session state.
- Fix drag issues only in the canonical path.

#### Resize

- Choose one active resize engine and freeze the other as legacy.
- Keep resize preview and resize commit inside the same canonical interaction path.
- Prevent inspector or shell code from becoming a second resize authority.

#### Navigation / Home / Focus

- Keep `projectSubstrateNavigation` as the only world navigation authority.
- Do not let shell code redefine Home, Focus, or project history state.
- Keep Home and Focus as world concepts, not panel concepts.

#### History / Memory

- Keep `hasProjectHistory` and `firstRememberedArtifact` world-derived, not shell-derived.
- Do not reintroduce history truth into UI metadata surfaces.
- Keep world behavior as the expression of memory.

Acceptance

- Every system above has exactly one answer to: "Who owns behavior?"

### Phase 5 - Removal pass later

Goal

Remove code only after it has already lost authority.

Action list

- Remove duplicate shell chrome only after no active path depends on it.
- Remove duplicate interaction implementations only after tests prove the canonical path covers the behavior.
- Remove `resizeEngine 2.js` or its sibling only after the active engine is proven and frozen.
- Remove legacy delete surfaces only after context menu + keyboard + canonical reducer path are stable.

Acceptance

- Code removal becomes safe and boring because ownership was already settled first.

## Recommended Next Steps

### 1. Continue on the single active Create/UI path

Do not branch interaction fixes into legacy shells.

Focus only on:

- delete truth
- drag truth
- resize truth
- context menu lifecycle

through:

`WorkspaceCanvasRoot -> CanvasRoot -> useCanvasInteractions -> inputEngine -> coreToolHandlers`

### 2. Freeze one owner per system

For each of these systems, do not allow multiple active authorities:

- selection
- drag
- resize
- delete
- navigation
- history
- memory

### 3. Remove authority before removing files

Only after a system no longer participates in active behavior should its old workspace-specific code be removed.

### 4. Use this audit as a working checklist

When debugging a bug, ask:

1. Which file is authoritative?
2. Which files are adapters only?
3. Which legacy files are still accidentally participating?

If more than one answer exists for authority, ownership is still unclear.

## Working Conclusion

Dropple should not delete old workspaces first.

Dropple should first make old workspaces non-authoritative.

The active convergence path is:

- one world shell
- one substrate path
- one interaction path
- one delete path
- one navigation law
- one history/memory law

Once that is stable, removing old workspace code becomes safe and boring.
