# UI Truth Dispatcher Elimination — Slice 3 Review

## Candidate Family

`World Shell`

Files:

- [ui/canvas/CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:1)
- [ui/workspace/shell/ProjectPerspectiveShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/ProjectPerspectiveShell.jsx:1)
- [ui/workspace/uiux/UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:1)

## Objective

Determine whether World Shell has earned Dispatcher Elimination Slice 3 using the already validated runtime relay pattern.

## Evidence Review

### Ownership Improvement

`PASS`

Removing direct dispatcher access from World Shell would further reduce UI ownership of dispatcher truth in the most visible Create World-facing surfaces.

### Runtime Authority

`PASS`

There is no evidence that runtime authority itself needs to change. The open question is not ownership lawfulness at the runtime layer, but whether the UI surfaces can be cleaned up without destabilizing the experience they currently host.

### Behavioral Risk

`FAIL`

This family contains behavior-heavy surfaces rather than localized interaction panels. `CanvasRoot.jsx` coordinates viewport changes, context-menu command flows, motion actions, and projection overlays. `UIUXAuthoringShell.jsx` coordinates selection deletion, grouping, motion actions, and keyboard flows in the validated UIUX authoring experience. `ProjectPerspectiveShell.jsx` also routes dispatcher-backed project and assistant actions. These are not narrow behavior surfaces.

### Sliceability

`FAIL`

The family is not cohesive enough to be treated as one implementation slice. Internally it already divides into at least three different responsibilities:

- `CanvasRoot.jsx` — world interaction and projection surface coordination
- `ProjectPerspectiveShell.jsx` — project shell and blueprint/assistant orchestration
- `UIUXAuthoringShell.jsx` — language-facing authoring orchestration

Treating all three as one slice would combine different risk profiles and different validation needs.

### Validation Strategy

`FAIL`

Unlike Workspace Root Infrastructure and Inspector Panels, this family does not have one obvious focused validation surface. Each file would require a different test strategy spanning world continuity, selection flows, onboarding/arrival behavior, projection overlays, and UIUX authoring operations.

### Experience Preservation

`FAIL`

This family overlaps directly with recently validated creator-facing behavior:

- Creative Direction -> Creative Arrival
- Empty World behavior
- projection slot continuity
- navigation continuity
- world memory and world response

The current evidence does not support changing all three surfaces together while confidently preserving those validated transitions.

## Internal Subdivision

World Shell should not be treated as one authorized family.

It should be reclassified into narrower candidate slices:

- `CanvasRoot.jsx`
- `ProjectPerspectiveShell.jsx`
- `UIUXAuthoringShell.jsx`

Each of these should earn review independently before any implementation begins.

## Deferred Families

### Utility Components

Still deferred because:

- lower architectural leverage
- can reuse patterns established by earlier slices

## Verdict

Status:

`Deferred`

## Reason

World Shell has not earned implementation as a single family.

The dispatcher-elimination pattern is proven, but the remaining Create World-facing surfaces are too behaviorally sensitive and too internally heterogeneous to be changed under one slice without risking validated experience work.

## Authorization

This review does not authorize:

- a combined World Shell slice
- changes to `CanvasRoot.jsx`
- changes to `ProjectPerspectiveShell.jsx`
- changes to `UIUXAuthoringShell.jsx`

## Next Lawful Move

Create a narrower follow-up review that evaluates one World Shell surface at a time and asks whether that individual surface has earned a dispatcher-elimination slice without violating experience preservation.
