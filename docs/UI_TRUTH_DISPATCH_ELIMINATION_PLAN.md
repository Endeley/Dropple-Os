# UI Truth Dispatch Elimination Plan

## Purpose

This document defines the next architectural cleanup initiative for remaining UI-side dispatcher access reported by lint.

It is not an implementation commit.
It is not a constitutional change.
It does not authorize a broad refactor.

Its purpose is to separate:

- legitimate constitutional debt
- bridge/root exceptions that may require lint-rule refinement
- lowest-risk extraction paths

## Current Phase

`Complete`

Architectural family discovery, candidate-phase cleanup, and constitutional closure are complete.

## Problem

Current lint output reports multiple instances of:

`dropple-architecture/no-ui-truth-dispatch`

These are no longer abstract warnings.

They are evidence that parts of the UI still hold direct dispatcher access in places where intent bridges or shell-owned coordination should be used instead.

## Scope

Current lint scope:

- [ui/canvas/CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:1)

Files recently removed from the hook-correctness hotspot list:

- [ui/workspace/shell/PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:1)

`PanelRenderer.jsx` no longer belongs to the dispatcher-elimination initiative.
It remains a dependency-warning cleanup candidate only.

## Core Question

Which remaining UI-side dispatcher accesses are true constitutional violations, and which are root-level bridge seams that should be reclassified or wrapped?

## Classification Model

Each flagged file should be classified into one of three groups.

### Group A — Real UI Truth Dispatch Debt

UI components or hooks directly dispatching truth-changing actions that should instead emit intent through a bridge or event bus.

These are implementation debt and should be removed.

### Group B — Root Bridge Seams

Root orchestration surfaces that may legitimately coordinate dispatcher access but are currently located in UI-owned paths.

These may require:

- extraction into a bridge/root boundary
- path relocation
- or lint-rule refinement if the constitutional owner is already correct

### Group C — False Positives / Rule Boundary Mismatch

Files whose behavior is already lawful, but whose path or import shape causes the lint rule to over-report.

These should not be "fixed" by changing lawful code into worse code.

## Current Evidence

After generated artifact ignores and hook-correctness stabilization:

- generated Next build noise has been removed from lint
- `PanelRenderer.jsx` hook-order failures have been eliminated
- `ProjectPerspectiveShell.jsx` hook-order failures have been eliminated
- remaining lint errors are now dominated by `dropple-architecture/no-ui-truth-dispatch`

This means the initiative has moved beyond family discovery and candidate cleanup.

Remaining debt is now concentrated in one constitutional-core substrate file.

## Architectural Families

### Family 1 — World Shell

- `CanvasRoot.jsx`
- `ProjectPerspectiveShell.jsx`
- `UIUXAuthoringShell.jsx`

These are Create World-facing surfaces.

They are likely to contain the highest-value constitutional cleanup work, but they also carry the most architectural risk.

### Family 2 — Workspace Root Infrastructure

- `RuntimeBridgesRoot.jsx`
- `WorkspaceSessionsRoot.jsx`
- `EditorWorkspaceLayout.jsx`

These are orchestration and infrastructure surfaces.

They may contain true debt, but they may also expose rule-boundary seams where the current owner is lawful and the file location is misleading.

### Family 3 — Inspector and Utility Surfaces

- `MotionPanel.jsx`
- `SelectionActionsPanel.jsx`
- `TemplateMotionInspectorPanel.jsx`
- `useCertifiedTemplates.js`
- `MergeBranch.jsx`

These are likely to be the lowest-risk dispatcher cleanup candidates because they are more localized and less world-defining.

## Initial Assessment

Highest-priority correctness issue outside this plan:

- `ProjectPerspectiveShell.jsx` hook-order violations

Status:

`Resolved in the hook-correctness stabilization slice`

That reduces risk for future world-shell cleanup, but does not yet authorize dispatcher cleanup in the same file.

Likely early candidates for real dispatcher cleanup:

- `MotionPanel.jsx`
- `SelectionActionsPanel.jsx`
- `TemplateMotionInspectorPanel.jsx`
- `useCertifiedTemplates.js`
- `MergeBranch.jsx`

Likely root-boundary review candidates:

- `CanvasRoot.jsx`
- `ProjectPerspectiveShell.jsx`
- `EditorWorkspaceLayout.jsx`
- workspace root dispatcher provider bridge files

## Slice Model

The remaining dispatcher debt should not be addressed as one cleanup effort.

It should be split into separate validation slices.

### Slice 1 — Workspace Root Infrastructure

Scope:

- `RuntimeBridgesRoot.jsx`
- `WorkspaceSessionsRoot.jsx`
- `EditorWorkspaceLayout.jsx`

Question:

Are these real UI dispatcher violations, or bridge/root seams that require constitutional reclassification or extraction?

### Slice 2 — World Shell

Scope:

- `CanvasRoot.jsx`
- `ProjectPerspectiveShell.jsx`
- `UIUXAuthoringShell.jsx`

Question:

Can Create World-facing surfaces reduce dispatcher ownership without forcing shell redesign, route changes, or experience regressions?

### Slice 3 — Inspector Panels

Scope:

- `MotionPanel.jsx`
- `SelectionActionsPanel.jsx`
- `TemplateMotionInspectorPanel.jsx`

Question:

Can panel-local dispatcher access be replaced by intent emission or read bridges without changing user-facing behavior?

### Slice 4 — Remaining Utility Components

Scope:

- `useCertifiedTemplates.js`
- `MergeBranch.jsx`

Question:

Are these localized utility cleanup items, or do they reveal another unclassified ownership family?

## Recommended Sequence

1. Ignore generated lint artifacts.
2. Fix real React hook-order violations first.
3. Group the remaining dispatcher lint errors by architectural family.
4. Review and authorize one family slice at a time.
5. Implement only the lowest-risk authorized slice first.
6. Re-run lint, architecture, release, and affected route tests.
7. Record evidence before touching the next family.

## Validation Status

### Slice 1 — Workspace Root Infrastructure

Status:

`Validated`

Evidence summary:

- dispatcher lint violations removed from the authorized family files
- architecture audit passed
- release operator surfaces passed
- focused Playwright workspace continuity flows passed
- runtime and dispatcher authority remained unchanged

Current repo-wide lint snapshot after Slice 1:

`35 problems (18 errors, 17 warnings)`

Remaining dispatcher violations are now concentrated in deferred families:

- World Shell
- Inspector Panels
- Utility Components

### Slice 2 — Inspector Panels

Status:

`Validated`

Evidence summary:

- dispatcher lint violations removed from the authorized family files
- architecture audit passed
- release operator surfaces passed
- focused Playwright inspector and motion flows passed
- runtime and dispatcher authority remained unchanged

Current repo-wide lint snapshot after Slice 2:

`29 problems (12 errors, 17 warnings)`

Remaining dispatcher violations are now concentrated in deferred families:

- World Shell
- Utility Components

### Slice 3 — World Shell Candidate / UIUXAuthoringShell

Status:

`Validated`

Evidence summary:

- dispatcher lint violations removed from `UIUXAuthoringShell.jsx`
- architecture audit passed
- release operator surfaces passed
- focused Playwright empty-world continuity flows passed
- focused Playwright inspector and motion authoring flows passed
- runtime and dispatcher authority remained unchanged
- validated Create World experience remained unchanged

Current repo-wide lint snapshot after Slice 3:

`27 problems (10 errors, 17 warnings)`

Remaining dispatcher violations are now concentrated in:

- `CanvasRoot.jsx`
- `ProjectPerspectiveShell.jsx`
- `useCertifiedTemplates.js`
- `MergeBranch.jsx`

### Slice 4 — Candidate Phase / useCertifiedTemplates.js

Status:

`Validated`

Evidence summary:

- dispatcher lint violations removed from `useCertifiedTemplates.js`
- architecture audit passed
- release operator surfaces passed
- focused Playwright certified-template workflow passed
- runtime and dispatcher authority remained unchanged

Current repo-wide lint snapshot after Slice 4:

`25 problems (8 errors, 17 warnings)`

Remaining dispatcher violations are now concentrated in:

- `MergeBranch.jsx`
- `ProjectPerspectiveShell.jsx`
- `CanvasRoot.jsx`

### Slice 5 — Candidate Phase / MergeBranch.jsx

Status:

`Validated`

Evidence summary:

- dispatcher lint violations removed from `MergeBranch.jsx`
- architecture audit passed
- release operator surfaces passed
- merge application unit tests passed
- merge pipeline boundary tests passed
- runtime and dispatcher authority remained unchanged

Current repo-wide lint snapshot after Slice 5:

`23 problems (6 errors, 17 warnings)`

Remaining dispatcher violations are now concentrated in the final constitutional candidates:

- `ProjectPerspectiveShell.jsx`
- `CanvasRoot.jsx`

### Slice 6 — Constitutional Core / ProjectPerspectiveShell.jsx

Status:

`Validated`

Evidence summary:

- dispatcher lint violations removed from `ProjectPerspectiveShell.jsx`
- architecture audit passed
- release operator surfaces passed
- focused Playwright build, operate, publish, and collaborate perspective workflows passed
- runtime and dispatcher authority remained unchanged
- validated Living Create World continuity remained unchanged

Current repo-wide lint snapshot after Slice 6:

`21 problems (4 errors, 17 warnings)`

Remaining dispatcher violations are now concentrated in the final constitutional closure candidate:

- `CanvasRoot.jsx`

### Slice 7 — Constitutional Closure / CanvasRoot.jsx

Status:

`Validated`

Evidence summary:

- dispatcher lint violations removed from `CanvasRoot.jsx`
- architecture audit passed
- release operator surfaces passed
- focused Playwright UIUX empty-world suite passed
- focused Playwright world continuity route envelope flow passed
- focused Playwright grouping / reselection flow passed
- focused Playwright motion authoring flow passed
- runtime and dispatcher authority remained unchanged
- validated Living Create World continuity remained unchanged

Current repo-wide lint snapshot after Slice 7:

`17 problems (0 errors, 17 warnings)`

Remaining constitutional dispatcher violations:

- `none`

## Stop Conditions

This initiative succeeds only if:

- UI components own less dispatcher authority than they do today
- runtime and dispatcher authority remain constitutionally unchanged
- no shell or route redesign is required
- architecture and release gates remain green

This initiative stops immediately if cleanup begins requiring:

- broad shell redesign
- runtime contract changes
- dispatcher ownership changes
- large-scale unreviewed refactors across project perspective surfaces

## Next Step

This initiative is complete.

The next lawful move is not additional dispatcher cleanup.

It is initiative closure and archival reference:

- preserve [docs/UI_TRUTH_DISPATCH_VALIDATION_HISTORY.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/UI_TRUTH_DISPATCH_VALIDATION_HISTORY.md:1) as the evidence record
- preserve [docs/UI_TRUTH_DISPATCH_CANVASROOT_REVIEW.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/UI_TRUTH_DISPATCH_CANVASROOT_REVIEW.md:1) as the constitutional closure review
- proceed to the next independently earned Validation Cycle
