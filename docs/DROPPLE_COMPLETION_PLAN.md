# DROPPLE COMPLETION PLAN

Status: Master execution board  
Scope: Dropple v1 completion  
Priority order:
1. Architecture consolidation
2. Editor core completion
3. Structural editing
4. Persistence + replay correctness
5. Export pipeline
6. Platform features

---

## Purpose

This document is the master execution board for finishing Dropple as a stable v1 editor.

It follows Dropple constitutional law:

- `core -> infrastructure -> runtime -> workspace -> ui -> product`
- all mutations flow through `runtime/dispatcher/dispatch.js`
- replay must go through dispatcher -> `applyEvent` -> reducers
- UI emits intents only
- panels read from projection
- engine remains pure deterministic computation

This plan does not introduce new parallel systems.

---

## Current Reality

Dropple already has:

- a strong deterministic `core/`
- a strong pure `engine/`
- a real runtime dispatcher pipeline
- a capable workspace registry
- substantial canvas, timeline, export, template, and platform code

Dropple is not complete because the repository still contains:

- parallel editor/workspace shell systems
- split persistence ownership
- incomplete branch/merge semantics
- mixed UI mutation patterns
- overlapping canvas/projection/UI generations

The critical path is consolidation, not feature sprawl.

---

## Completion Definition

Dropple v1 is complete when all of the following are true:

- one canonical workspace/editor boot path
- one canonical mutation funnel
- one canonical replay path
- one canonical persistence model
- stable design workspace editing loop
- structural editing works through runtime authority
- export is validated and deterministic
- templates/components are installable through canonical runtime flow

Everything else is secondary.

---

## Phase 1: Architecture Consolidation

### Goal

Collapse Dropple onto one authoritative editor/runtime architecture.

### Why This Comes First

Without this, every additional feature increases architectural entropy and makes persistence, merge, and export harder to finish correctly.

### Target Outcome

- one workspace shell architecture
- one bridge registration path
- one canvas/editor surface
- one public projection path
- no active parallel mutation systems

### Workstreams

#### 1.1 Collapse the workspace shell architecture

Keep as canonical:

- `ui/workspace/root/WorkspaceRoot.jsx`
- `runtime/boundary/DispatcherProvider.jsx`
- `ui/workspace/shell/ModeLoader.jsx`
- `ui/workspace/shell/WorkspaceShell.jsx`

Collapse or retire:

- `ui/workspace/shared/WorkspaceShell.jsx`
- `ui/workspace/editor/EditorWorkspaceShell.jsx`
- `app/workspace/design/DesignWorkspaceClient.jsx`

Definition of done:

- `/workspace/design` uses the dispatcher-backed workspace root path
- old event-log editor shell is no longer part of the active editor architecture
- no route depends on parallel shell state ownership

#### 1.2 Normalize bridge registration

Current ambiguity:

- `ui/workspace/root/DispatcherProvider/Bridges/WorkspaceBridgesRoot.jsx`
- `ui/workspace/root/DispatcherProvider/Sessions/WorkspaceSessionsRoot.jsx`
- `ui/interaction/sessionBinding.js`

Definition of done:

- one place mounts bridge registration
- one place mounts input/session lifecycle bindings
- no duplicate bridge registration risk

#### 1.3 Collapse duplicate canvas systems

Keep as canonical:

- `ui/canvas/CanvasRoot.jsx`
- `ui/canvas/*`

Retire or quarantine:

- `ui/Canvas.jsx`

Definition of done:

- one canonical canvas surface
- one canonical interaction entrypoint
- older canvas path is deleted or explicitly marked legacy and unused

#### 1.4 Flatten the projection path

Current split:

- `runtime/projection/index.js`
- `runtime/projection/v1/*`

Definition of done:

- one public projection API
- UI imports only canonical projection hooks/selectors
- projection remains read-only transport

#### 1.5 Audit UI dispatch boundaries

All UI mutation flows must be classified as:

- allowed system dispatch
- intent -> bridge -> dispatch
- legacy path to remove

Start with:

- `ui/interactions/useCanvasInteractions.js`
- `ui/workspace/shared/SelectionContext.jsx`
- `ui/timeline/TimelinePanel.jsx`

Definition of done:

- no illegal domain mutation from UI
- tools emit intents only
- bridges own translation to dispatcher events

### Tests Required

- route smoke tests for workspace modes
- dispatcher authority tests
- mount/unmount tests for bridge registration
- search/lint guard for illegal UI mutation patterns

---

## Phase 2: Editor Core Completion

### Goal

Finish the design workspace as the stable v1 editor surface.

### Target Outcome

Users can:

- create nodes
- select nodes
- move nodes
- resize nodes
- snap and align nodes
- undo/redo
- save/load
- work without hitting architectural edge cases

### Workstreams

#### 2.1 Canonical editing loop

The editor loop must be:

UI tool -> intent -> bridge -> dispatcher -> reducers -> runtime -> projection -> render

Definition of done:

- all primary editing actions use the canonical mutation funnel
- no alternate local event-log editing loop remains active

#### 2.2 Canvas interaction stabilization

Primary files:

- `ui/canvas/CanvasRoot.jsx`
- `ui/interactions/useCanvasInteractions.js`
- `ui/interaction/sessionBinding.js`
- `runtime/interactions/input/*`

Definition of done:

- pointer down/move/up flow is stable
- selection, move, resize, and session commit are deterministic
- session lifecycle always resolves through runtime authority

#### 2.3 Snap + guide integration finalization

Primary files:

- `engine/constraints/snapEngine.js`
- `engine/guides/*`
- `ui/canvas/GuideLayer.jsx`

Definition of done:

- snapping and guides are consistently driven by canonical interaction flow
- no UI-side ad hoc snap logic competes with engine output

#### 2.4 History correctness

Primary files:

- `ui/bridges/historyBridge.js`
- `runtime/dispatcher/history.js`
- `core/history/historyStack.js`

Definition of done:

- undo/redo operate through canonical state history
- no hidden local editor history remains active

### Tests Required

- create/select/move/resize integration tests
- snap/guide regression tests
- undo/redo regression tests
- deterministic replay tests after editing sessions

---

## Phase 3: Structural Editing

### Goal

Finish layout inference, auto-layout conversion, and structural editing through runtime authority.

### Target Outcome

Dropple can edit structure, not just pixels:

- reorder
- attach/detach
- infer layout patterns
- convert freeform groups into structured layout containers

### Workstreams

#### 3.1 Layout inference completion

Primary files:

- `engine/layout/detectRows.js`
- `engine/layout/detectColumns.js`
- `engine/layout/detectStacks.js`
- `engine/layout/detectGrids.js`
- `engine/layout/computeLayoutInference.js`

Definition of done:

- inferred structures are stable and deterministic
- engine remains pure and independent of UI/runtime concerns

#### 3.2 Auto-layout conversion completion

Primary files:

- `engine/layout/convertLayout.js`
- `ui/bridges/layoutConvertBridge.js`
- `core/events/reducers/layoutReducers.js`

Definition of done:

- conversion is triggered by intent
- reducer-backed state changes produce structural updates
- no direct UI-side structural mutation exists

#### 3.3 Structural editing rules

Primary files:

- `core/events/reducers/treeReducers.js`
- `core/events/reducers/layoutReducers.js`
- `runtime/input/layoutConvertRuntimeBridge.js`

Definition of done:

- attach/detach/reorder rules are canonical
- container/child semantics are consistent across workspaces
- workspace policy gates structural actions without changing runtime shape

### Tests Required

- layout inference unit tests
- structural reducer tests
- conversion integration tests
- reorder/attach/detach regression tests

---

## Phase 4: Persistence + Replay Correctness

### Goal

Establish one canonical persistence ownership model and guarantee legal replay.

### Problem To Solve

Dropple currently has split persistence ownership:

- local/browser persistence in `persistence/`
- durable backend persistence in `convex/`

This must be reduced to one truth model.

### Canonical Rule

Persistence stores data.
Replay and mutation remain in:

- dispatcher
- `core/events/applyEvent.js`
- reducers

Infrastructure does not own replay logic.

### Workstreams

#### 4.1 Choose the persistence authority model

Decision required:

- Convex is durable truth, local state is cache/draft only
or
- local-first event log is truth, Convex is sync/backup only

Definition of done:

- one document lifecycle model is documented and enforced
- the competing ownership model is removed from active editor flow

#### 4.2 Canonical save/load path

Primary files:

- `persistence/saveDocument.js`
- `persistence/loadDocument.js`
- `persistence/documentCommands.js`
- `convex/loadDocumentSnapshot.js`
- `convex/appendEvents.js`

Definition of done:

- loading a document hydrates state through canonical runtime flow
- saving persists canonical event/snapshot data without mutating runtime illegally

#### 4.3 Replay correctness

Primary files:

- `runtime/replay/*`
- `runtime/dispatcher/dispatch.js`
- `core/events/applyEvent.js`

Definition of done:

- persisted event sequences replay through dispatcher/reducer semantics
- deterministic state hashes remain stable

### Tests Required

- save/load roundtrip tests
- replay determinism tests
- persisted branch replay tests
- durable append/load idempotency tests if Convex is canonical

---

## Phase 5: Export Pipeline

### Goal

Deliver one canonical, validated export pipeline for v1.

### Target Outcome

Exports must derive from canonical runtime truth and be blocked when invalid.

### Workstreams

#### 5.1 Define v1 export matrix by workspace

Examples:

- Design workspace: image/vector/static exports
- UI/UX workspace: HTML/CSS/React-safe exports
- Timeline workspace: motion export where explicitly supported

Definition of done:

- each workspace has a documented supported export set
- unsupported exports are hidden or disabled

#### 5.2 Canonical export entrypoints

Primary files:

- `runtime/export/exportDroppleSpec.js`
- `runtime/export/exportGate.js`
- `ui/export/exportGateClient.js`
- `runtime/export/svg/exportSVG.js`
- `runtime/export/css/exportCSS.js`

Definition of done:

- export starts from canonical runtime state
- export gate validation is mandatory
- no alternate UI-owned export path bypasses validation

#### 5.3 Deterministic export verification

Definition of done:

- same runtime state produces the same export payloads where applicable
- failures are surfaced through export gate, not silent divergence

### Tests Required

- export gate tests
- per-format smoke tests
- deterministic export output tests

---

## Phase 6: Platform Features

### Goal

Resume platform-level features only after the editor core is stable.

### Includes

- collaboration mutation semantics
- marketplace
- education
- review/certification
- plugins
- AI generation flows

### Rule

These systems must sit on top of the completed editor/runtime architecture.
They must not redefine authority, persistence, or mutation flow.

### Workstreams

#### 6.1 Template certification integration

Primary files:

- `core/ccm/validate/validateTemplateArtifact.ts`
- `domain/templates/installCertifiedTemplate.js`
- `engine/templates/templateCompilerV1.js`

Definition of done:

- certified templates install through canonical runtime hydration
- template registry and validation paths are cleaned up

#### 6.2 Collaboration after persistence is canonical

Definition of done:

- awareness is stable
- document mutation semantics do not bypass persistence/replay rules

#### 6.3 Marketplace / education / review / plugins / AI

Definition of done:

- each subsystem depends on the canonical editor core
- none of them introduce parallel mutation or persistence systems

### Tests Required

- template install/certification tests
- collaboration persistence integration tests
- feature-specific integration tests only after core stabilization

---

## Priority Board

### P0

- collapse workspace shell duplication
- normalize bridge registration
- remove illegal UI mutation paths
- choose canonical persistence model
- fix branch/merge legality

### P1

- stabilize editor core interaction loop
- complete structural editing
- flatten projection/canvas duplication
- complete canonical save/load/replay flow

### P2

- finalize export matrix and export gate integration
- finish template certification integration

### P3

- collaboration mutation semantics
- marketplace
- education/review/certification productization
- plugins
- AI-assisted workflows

---

## Immediate Execution Queue

### Task 1

Collapse `/workspace/design` into the dispatcher-backed workspace root path.

Primary files:

- `app/workspace/design/DesignWorkspaceClient.jsx`
- `ui/workspace/shared/WorkspaceShell.jsx`
- `ui/workspace/editor/EditorWorkspaceShell.jsx`
- `ui/workspace/root/WorkspaceRoot.jsx`

### Task 2

Make one bridge/session mount path canonical.

Primary files:

- `ui/workspace/root/DispatcherProvider/Bridges/WorkspaceBridgesRoot.jsx`
- `ui/workspace/root/DispatcherProvider/Sessions/WorkspaceSessionsRoot.jsx`
- `ui/interaction/sessionBinding.js`

### Task 3

Run UI dispatch audit and convert domain mutations to intent/bridge flow.

Primary files:

- `ui/interactions/useCanvasInteractions.js`
- `ui/workspace/shared/SelectionContext.jsx`
- `ui/timeline/TimelinePanel.jsx`

### Task 4

Choose and implement the canonical persistence model.

Primary files:

- `persistence/documentCommands.js`
- `persistence/saveDocument.js`
- `persistence/loadDocument.js`
- `convex/loadDocumentSnapshot.js`
- `convex/appendEvents.js`

### Task 5

Repair merge to respect dispatcher event ownership.

Primary files:

- `branching/merge/applyMerge.js`
- `branching/merge/planMerge.js`
- `runtime/dispatcher/dispatch.js`

---

## Done Criteria By Major Area

### Architecture consolidation is done when

- only one editor authority path is active
- bridge registration has one home
- UI does not own domain mutation
- old parallel shells/canvas paths are retired

### Editor completion is done when

- design workspace editing loop is stable
- interaction, snapping, history, and rendering all follow canonical flow

### Structural editing is done when

- layout inference is deterministic
- conversion and structural changes are reducer-driven
- workspace policy gates behavior without changing runtime shape

### Persistence is done when

- one canonical truth model exists
- save/load/replay are coherent
- deterministic replay from persisted state is verified

### Export is done when

- export formats are explicitly scoped
- export gate is mandatory
- exports derive from canonical runtime state only

### Platform is done when

- templates, collaboration, marketplace, education, review, plugins, and AI all build on the completed editor core

---

## Non-Goals During Core Completion

Do not let these block v1 editor completion:

- advanced multiplayer mutation
- full marketplace maturity
- education product depth
- certification/review expansion
- plugin ecosystem completeness
- AI-assisted generation breadth

These remain phase-2 surfaces until the editor core is structurally complete.
