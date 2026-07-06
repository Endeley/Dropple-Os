# UI Truth Dispatcher Elimination — ProjectPerspectiveShell Review

## Candidate

`ProjectPerspectiveShell.jsx`

File:

- [ui/workspace/shell/ProjectPerspectiveShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/ProjectPerspectiveShell.jsx:1)

## Question

Has `ProjectPerspectiveShell.jsx` earned its own dispatcher-elimination slice without changing the validated Living Create World experience?

## Evaluation

### Ownership Improvement

`PASS`

`ProjectPerspectiveShell.jsx` still owns direct dispatcher access for three action families:

- blueprint installation
- blueprint upgrade
- assistant request enqueue

Removing that ownership would further reduce direct UI-held mutation authority inside a constitutional core surface.

### Runtime Authority Preservation

`PASS`

There is no evidence that runtime authority must change. The remaining dispatcher-backed actions appear to be routable through the already validated relay pattern while keeping runtime as the sole mutation authority.

### Behavioral Risk

`PASS`

The candidate is high-sensitivity, but its direct dispatcher use is concentrated in a narrow set of actions rather than in every shell behavior. The risk is therefore real but bounded, provided the slice is limited to those action paths only.

### Candidate Independence

`PASS`

The file is adjacent to navigation, continuity, and world-context behavior, but the dispatcher-backed actions do not appear to require concurrent changes to:

- [ui/canvas/CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:1)
- projection slots
- route definitions
- Create World substrate ownership

This makes the candidate independently sliceable under a strict narrow-scope contract.

### Validation Strategy

`PASS`

Success can be verified through:

- targeted lint for `ProjectPerspectiveShell.jsx`
- architecture audit
- release operator surfaces
- focused workspace route / project continuity Playwright coverage
- focused blueprint install / upgrade or assistant-request coverage where available

### Experience Preservation

`PASS`

This candidate touches a constitutional core surface, so experience preservation is the primary constraint.

The slice is acceptable only if it preserves:

- world continuity
- navigation continuity
- `Creative Direction -> Creative Arrival`
- project emergence behavior
- home / focus relationship

Current evidence supports that because the remaining direct dispatcher paths are concentrated in blueprint and assistant actions rather than in the core continuity calculations themselves.

## Deferred Candidate

### CanvasRoot

Deferred because:

- highest constitutional sensitivity
- shared Create World substrate
- tightly coupled to viewport, projection overlays, and world interaction
- should remain the final dispatcher candidate

## Verdict

Status:

`Accepted`

## Authorization

This review authorizes a dispatcher-elimination candidate slice for:

`ProjectPerspectiveShell.jsx`

## Constraint

Any future slice must remain limited to the dispatcher-backed blueprint and assistant action paths inside `ProjectPerspectiveShell.jsx`.

It must not widen into:

- world continuity behavior
- navigation state calculations
- route structure
- Create World substrate logic
