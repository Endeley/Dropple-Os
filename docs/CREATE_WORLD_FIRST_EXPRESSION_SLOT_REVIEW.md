# Create World First Expression Slot Review

## Purpose

This document is a narrow review.

It does not implement code.
It does not authorize a refactor by itself.
It only answers one question:

`Has GraphicFirstExpression earned Projection Slot Slice 3 planning?`

The objective is to produce a correct decision, not code.

## Evidence Reviewed

Reviewed planning artifacts:

- [CREATE_WORLD_PROJECTION_SLOT_REVIEW.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_PROJECTION_SLOT_REVIEW.md:1)
- [CREATE_WORLD_SECOND_SLOT_FAMILY_PLAN.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_SECOND_SLOT_FAMILY_PLAN.md:1)

Reviewed implementation files:

- [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:109)
- [GraphicFirstExpressionOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/GraphicFirstExpressionOverlay.jsx:1)
- [EditorWorkspaceLayout.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/editor/EditorWorkspaceLayout.jsx:139)
- [graphicProjectionSlots.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/graphicProjectionSlots.js:1)

Reviewed validation sources:

- [graphic-empty-world.spec.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/tests/e2e/graphic-empty-world.spec.js:57)
- full Playwright smoke validation previously passing at `140 / 140`

## Current State

Today, `GraphicFirstExpressionOverlay` is still mounted directly by `CanvasRoot`.

Current dependency direction:

`CanvasRoot`
`-> imports GraphicFirstExpressionOverlay`

Current state inputs:

- `workspaceId`
- `modeId`
- `nodeCount`
- `selectedNode`
- `dismissedFirstExpressionNodeId`
- `onDismiss`

Current behavioral role:

- visible only after first expression exists
- visible only for the selected Graphic first-expression artboard
- dismissible without changing runtime authority
- hands off to `GraphicVocabularyOverlay` after dismissal

## Review Criteria

| Criterion | Question | Result | Notes |
| --- | --- | --- | --- |
| Ownership | Does slotting improve ownership compared to today? | `Pass` | `CanvasRoot` would stop importing a Graphic-specific first-expression overlay directly. The world would own the mount surface, and Graphic would own the meaning. |
| Dependency Direction | Does it reduce Create World -> Language coupling? | `Pass` | This is the same dependency-direction correction already proven for `emptyWorld`, applied to a new family. |
| Runtime Authority | Can runtime remain completely unchanged? | `Pass` | The overlay is projection-only. Runtime selection, node creation, and reducer ownership can remain untouched. |
| Behavior Preservation | Can behavior remain identical? | `Pass` | Existing first-expression behavior is already validated in e2e and depends on state that can be passed through a slot contract without semantic change. |
| Consumer Complexity | Do consumers remain as simple or simpler? | `Pass` | `CanvasRoot` gains one more slot-aware branch, but no external consumer contract redesign is required. Complexity increases slightly, but locally and acceptably. |
| Sliceability | Can this be implemented as one small reversible slice? | `Pass` | Yes. Only the first-expression family needs to move. `vocabulary`, `refinement`, and `delivery` can remain direct mounts. |
| Generalizability | If this succeeds, does it strengthen the architecture beyond this local feature? | `Pass` | Yes. It would validate projection-slot reuse across a second family and confirm that richer slot inputs remain understandable. |

## Detailed Assessment

## Ownership

`GraphicFirstExpressionOverlay` is Graphic language meaning.

Its current direct import inside `CanvasRoot` keeps Graphic-specific projection mounted by the shared world layer.

Moving it behind a slot would improve ownership in the same way `emptyWorld` improved ownership:

`Create World owns the place`

`Graphic owns the meaning`

## Dependency Direction

The current dependency is still:

`CanvasRoot`
`-> GraphicFirstExpressionOverlay`

That remains a world-to-language dependency leak.

Slotting this family would reduce the leak without changing who decides visibility or meaning.

## Runtime Authority

The reviewed overlay does not write runtime truth directly.

Its dismissal flow is local UI state owned in `CanvasRoot`:

- `dismissedFirstExpressionNodeId`
- reset when selection changes

That is not reducer authority.

A slot contract can carry:

- `selectedNode`
- `nodeCount`
- `dismissedNodeId`
- `onDismiss`

without moving runtime ownership.

## Behavior Preservation

Behavior is already defined and tested:

- first expression appears only after the composition needs visible existence
- the artboard remains the first bounded expression
- composition remains the mental owner
- continuing dismisses first-expression guidance and reveals vocabulary

Nothing in that behavior requires `CanvasRoot` itself to own the Graphic overlay implementation.

## Consumer Complexity

This slice would slightly expand the slot contract beyond `emptyWorld`.

That is the main cost.

However:

- `WorkspaceCanvasRoot` already passes `projectionSlots`
- `EditorWorkspaceLayout` already provides Graphic slots
- no tool consumer changes are required
- no panel consumer changes are required

So the complexity remains localized to the projection wiring rather than spreading across consumers.

## Sliceability

This is small enough to isolate:

1. expose `firstExpression` slot in `CanvasRoot`
2. move only Graphic first-expression filling to Graphic-owned slot declaration
3. preserve dismissal and selection behavior
4. leave all later Graphic overlays unchanged

That makes the slice reversible and testable on its own.

## Generalizability

This is the strongest reason to allow planning.

If `emptyWorld` proved slot reuse across languages in one family, `firstExpression` can prove slot reuse across families with a richer input contract.

That strengthens the architectural pattern beyond a local Graphic cleanup.

It does not prove universal generalization, but it does earn the next evidence step.

## Verdict

`Projection Slot Slice 3 Planning`

Status:

`Earned`

Reason:

All review criteria pass.

The candidate improves ownership, reduces dependency leakage, preserves runtime authority, appears behaviorally preservable, remains locally sliceable, and strengthens the architecture beyond one local cleanup.

## What Is Earned

This review earns:

`Projection Slot Slice 3 Planning`

Specifically:

- a planning artifact for `GraphicFirstExpression`
- not implementation

## What Is Not Earned

This review does not earn:

- implementation
- `GraphicVocabulary` slotting
- `GraphicRefinement` slotting
- `GraphicDelivery` slotting
- general projection-slot validation across all families

## Next Step

Create:

`Projection Slot Slice 3 Plan`

Scope:

- `GraphicFirstExpression` only

That plan should define:

- slot contract shape
- minimal wiring path
- validation targets
- explicit stop condition
