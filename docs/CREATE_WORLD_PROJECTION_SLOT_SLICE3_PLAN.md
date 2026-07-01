# Create World Projection Slot Slice 3 Plan

## Purpose

Define the minimal implementation slice for moving `GraphicFirstExpression` from direct `CanvasRoot` mounting to a Graphic-owned projection slot.

This document is a slice plan only.

It does not implement code.
It does not approve broader projection-slot work.
It does not authorize `vocabulary`, `refinement`, or `delivery`.

Its purpose is to define one small reversible slice.

## Earned Entry Condition

This plan is authorized by:

- [CREATE_WORLD_PROJECTION_SLOT_REVIEW.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_PROJECTION_SLOT_REVIEW.md:1)
- [CREATE_WORLD_SECOND_SLOT_FAMILY_PLAN.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_SECOND_SLOT_FAMILY_PLAN.md:1)
- [CREATE_WORLD_FIRST_EXPRESSION_SLOT_REVIEW.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_FIRST_EXPRESSION_SLOT_REVIEW.md:1)

Review verdict:

`Projection Slot Slice 3 Planning`

Status:

`Earned`

## Slice Objective

Change:

`CanvasRoot`
`-> imports GraphicFirstExpressionOverlay`

Toward:

`CanvasRoot`
`-> exposes firstExpression slot`

`Graphic`
`-> fills firstExpression slot`

Without changing:

- runtime authority
- behavior
- dismissal semantics
- downstream `GraphicVocabulary` behavior

## Scope

In scope:

- `GraphicFirstExpression` only
- shared mount-surface ownership for the `firstExpression` family
- Graphic-owned slot filler declaration
- local slot contract needed to preserve current behavior

Out of scope:

- `GraphicVocabulary`
- `GraphicRefinement`
- `GraphicDelivery`
- new projection families beyond `firstExpression`
- shell extraction
- route changes
- runtime or dispatcher changes

## Current Responsibility

| Responsibility | Current File | Current Owner |
| --- | --- | --- |
| first-expression overlay mount surface | [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:524) | mixed: shared world + Graphic language import |
| first-expression meaning and visibility rules | [GraphicFirstExpressionOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/GraphicFirstExpressionOverlay.jsx:1) | Graphic language |
| Graphic slot declaration entrypoint | [EditorWorkspaceLayout.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/editor/EditorWorkspaceLayout.jsx:139) + [graphicProjectionSlots.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/graphicProjectionSlots.js:1) | Graphic composition/orchestration layer |

## Intended Responsibility

| Responsibility | Intended Owner |
| --- | --- |
| first-expression projection slot surface | Create World / shared canvas shell |
| first-expression overlay implementation | Graphic language |
| first-expression slot filler declaration | Graphic projection slot declaration |

## Projection Slot Boundary

The `firstExpression` slot should carry only what the current overlay already requires:

- `workspaceId`
- `modeId`
- `nodeCount`
- `selectedNode`
- `dismissedNodeId`
- `onDismiss`

It should not carry:

- runtime dispatchers
- creation intents
- vocabulary state
- refinement state
- delivery state

This keeps the slot contract narrowly projection-focused.

## State Dependencies

Current state dependencies:

- `nodeCount`
- `selectedNode`
- local dismissal state via `dismissedFirstExpressionNodeId`
- dismissal reset when selection changes

Assessment:

- richer than `emptyWorld`
- still local and understandable
- still independent from runtime authority mutation

## Affected Files

Expected implementation touch points:

- [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:109)
- [EditorWorkspaceLayout.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/editor/EditorWorkspaceLayout.jsx:139)
- [graphicProjectionSlots.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/graphicProjectionSlots.js:1)

Possible validation touch points:

- [graphic-empty-world.spec.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/tests/e2e/graphic-empty-world.spec.js:57)

Files that should remain untouched:

- `GraphicVocabularyOverlay.jsx`
- `GraphicRefinementOverlay.jsx`
- `GraphicDeliveryOverlay.jsx`
- runtime reducers
- dispatcher bridges

## Minimal Implementation Path

1. Extend `CanvasRoot` to resolve an optional `firstExpression` slot.
2. Remove the direct `GraphicFirstExpressionOverlay` import/mount from `CanvasRoot`.
3. Extend `buildGraphicProjectionSlots()` to provide a `firstExpression` filler.
4. Keep `EditorWorkspaceLayout` as the Graphic slot provider boundary.
5. Preserve current local dismissal wiring and selection-based reset behavior.

## Validation Strategy

Minimum validation required:

- focused Graphic first-expression e2e coverage
- focused empty-world to first-expression handoff coverage
- full Playwright smoke if the focused checks pass
- architecture gate
- release operator surfaces gate

Validation questions:

- does first-expression still appear only after composition begins visible existence?
- does dismissal still reveal vocabulary correctly?
- does selection change still reset dismissal state correctly?
- did any non-Graphic consumer need to change?

## Rollback Strategy

Rollback is simple if the slice fails:

- restore direct `GraphicFirstExpressionOverlay` mount in `CanvasRoot`
- remove the `firstExpression` slot from Graphic slot declarations

Because this slice is isolated to one projection family, rollback should not affect:

- `emptyWorld` slots
- later Graphic overlays
- runtime authority

## Stop Condition

Stop immediately if any of the following occurs:

- slot contract starts pulling in downstream vocabulary/refinement concerns
- runtime authority must change
- dismissal semantics require broader shared state redesign
- consumer complexity spreads beyond local projection wiring
- behavior cannot be preserved under focused validation

If any stop condition is met:

`Slice 3 implementation is not authorized`

## Success Condition

Slice 3 succeeds only if:

- `CanvasRoot` no longer imports `GraphicFirstExpressionOverlay`
- the `firstExpression` family is filled by Graphic-owned slot declaration
- behavior remains identical
- runtime authority remains untouched
- validation passes

## Result

If reviewed and accepted, this document earns:

`Projection Slot Slice 3`

For:

`GraphicFirstExpression only`

## Implementation Result

Status:

`Implemented`

Outcome:

- `CanvasRoot` now exposes and resolves a `firstExpression` projection slot
- direct `GraphicFirstExpressionOverlay` mounting was removed from `CanvasRoot`
- Graphic now fills the `firstExpression` slot from `graphicProjectionSlots.js`
- `GraphicVocabulary`, `GraphicRefinement`, and `GraphicDelivery` remained untouched
- runtime and dispatcher authority remained untouched

## Validation Result

Status:

`Validated`

Validation completed:

- focused Graphic unit tests
- focused Graphic first-expression e2e flow
- architecture test gate
- release operator surfaces gate

Observed result:

- first-expression behavior remained identical
- vocabulary handoff remained identical
- no runtime authority changes were required
- `CanvasRoot` now knows less about Graphic
