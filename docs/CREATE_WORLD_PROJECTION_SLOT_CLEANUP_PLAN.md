# Create World Projection Slot Cleanup Plan

## Purpose

This document defines the lawful cleanup path from direct world-to-language overlay imports
toward slot-based language projection.

It does not implement code.
It does not rename routes.
It does not rename shells.
It does not change runtime or dispatcher authority.
It does not change behavior.
It does not introduce a second shell authority.

Its purpose is to answer one narrow question:

`Which current overlays are shared world visibility surfaces, and which are language projections?`

This plan exists to ensure projection ownership is clarified before overlay code moves.

## Scope

Audited sources:

- [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:1)
- [WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx:1)
- [UIUXEmptyWorldOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXEmptyWorldOverlay.jsx:1)
- [GraphicEmptyWorldOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/GraphicEmptyWorldOverlay.jsx:1)
- [GraphicFirstExpressionOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/GraphicFirstExpressionOverlay.jsx:1)
- [GraphicVocabularyOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/GraphicVocabularyOverlay.jsx:1)
- [GraphicRefinementOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/GraphicRefinementOverlay.jsx:1)
- [GraphicDeliveryOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/GraphicDeliveryOverlay.jsx:1)

Related references:

- [CREATE_WORLD_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_MODEL.md)
- [CREATE_WORLD_SHELL_BOUNDARY_AUDIT.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_SHELL_BOUNDARY_AUDIT.md)
- [CREATE_WORLD_SHELL_EXPRESSION_AUDIT.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_SHELL_EXPRESSION_AUDIT.md)
- [CREATE_WORLD_ACTIVATION_OWNERSHIP_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_ACTIVATION_OWNERSHIP_MODEL.md)
- [PRODUCT_EXPRESSION_PRINCIPLES.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/PRODUCT_EXPRESSION_PRINCIPLES.md)

Out of scope:

- route changes
- shell rename
- runtime or dispatcher changes
- broad shell extraction
- overlay redesign

## Governing Constraints

This plan is subordinate to:

- [docs/LAW.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/LAW.md)
- [docs/CREATE_WORLD_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_MODEL.md)
- [docs/CREATE_WORLD_ACTIVATION_OWNERSHIP_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_ACTIVATION_OWNERSHIP_MODEL.md)

Frozen direction:

`Create World Shell activates surfaces.`

`Creative Languages populate surfaces.`

`Product Expression presents surfaces.`

Projection cleanup must preserve that law.

## Current Leak

Current dependency direction:

`CanvasRoot`
`-> imports UIUXEmptyWorldOverlay`
`-> imports GraphicEmptyWorldOverlay`
`-> imports GraphicFirstExpressionOverlay`
`-> imports GraphicVocabularyOverlay`
`-> imports GraphicRefinementOverlay`
`-> imports GraphicDeliveryOverlay`

Evidence:

- [CanvasRoot.jsx:22](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:22)
- [CanvasRoot.jsx:519](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:519)

This means the shared world substrate currently knows specific creative language overlays.

That is the architectural leak.

## Target Direction

Target dependency direction:

`CanvasRoot`
`-> exposes projection slots`

`Creative Language`
`-> fills projection slots`

The world should decide:

- whether a projection surface exists
- when that surface is visible
- where that surface mounts

The language should decide:

- what the overlay says
- what meaning is projected
- what creator transition is being expressed

## Current Overlay Classification

### Shared World Visibility Surfaces

These are not language meanings.
They are world-level projection mount opportunities.

- empty world visibility surface
- first expression visibility surface
- vocabulary visibility surface
- refinement visibility surface
- delivery visibility surface

Evidence:

- [CanvasRoot.jsx:519](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:519)
- [CanvasRoot.jsx:525](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:525)
- [CanvasRoot.jsx:530](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:530)
- [CanvasRoot.jsx:538](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:538)
- [CanvasRoot.jsx:545](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:545)
- [CanvasRoot.jsx:551](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:551)

### Language Projections

These are language-owned content surfaces:

- UIUX Empty World
- Graphic Empty World
- Graphic First Expression
- Graphic Vocabulary
- Graphic Refinement
- Graphic Delivery

Evidence:

- [UIUXEmptyWorldOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXEmptyWorldOverlay.jsx:72)
- [GraphicEmptyWorldOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/GraphicEmptyWorldOverlay.jsx:48)
- [GraphicFirstExpressionOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/GraphicFirstExpressionOverlay.jsx:31)
- [GraphicVocabularyOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/GraphicVocabularyOverlay.jsx:8)
- [GraphicRefinementOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/GraphicRefinementOverlay.jsx:6)
- [GraphicDeliveryOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/GraphicDeliveryOverlay.jsx:6)

## Overlay Responsibility Table

| Current Overlay / Surface | Current Mount Owner | True Visibility Owner | True Content Owner | Risk | Minimal Cleanup Path | Stop Condition |
|---|---|---|---|---|---|---|
| `UIUXEmptyWorldOverlay` | `CanvasRoot` | Create World Shell | UIUX Language plus Product Expression | Low | Introduce an empty-world projection slot and route UIUX overlay through that slot without changing its props or behavior | `CanvasRoot` no longer imports the UIUX overlay directly |
| `GraphicEmptyWorldOverlay` | `CanvasRoot` | Create World Shell | Graphic Language plus Product Expression | Low | Reuse the same empty-world slot mechanism after UIUX proves stable, or keep Graphic temporarily until slot path is validated | Empty-world slot can host either language without consumer changes |
| `GraphicFirstExpressionOverlay` | `CanvasRoot` | Create World Shell | Graphic Language | Medium | Add a first-expression slot only after empty-world slot is proven; preserve existing visibility condition inputs | First-expression mount is indirect while selected-node semantics remain unchanged |
| `GraphicVocabularyOverlay` | `CanvasRoot` | Create World Shell | Graphic Language | Medium | Add a vocabulary slot after first-expression slot if needed; keep current selected node and dismissal inputs intact | Vocabulary overlay visibility remains identical while import direction changes |
| `GraphicRefinementOverlay` | `CanvasRoot` | Create World Shell | Graphic Language | Medium | Move behind a refinement slot later; leave projection logic untouched initially | No refinement behavior changes are needed to support slot mounting |
| `GraphicDeliveryOverlay` | `CanvasRoot` | Create World Shell | Graphic Language | Medium | Move behind a delivery slot later; preserve audience-first projection inputs exactly | Delivery overlay remains behavior-identical under slot mounting |
| Selection context menu and debug overlay | `CanvasRoot` | Create World Shell | Create World Shell / debug surface | None | No change in projection cleanup slice | Leave in place |

## Visibility Condition Classification

### Conditions That Belong to Shared World Visibility

These are slot-visibility concerns:

- world is empty or worked
- node count is zero or non-zero
- a first expression exists
- a selected node qualifies as the current projection focus

These are currently computed in the overlays, but conceptually they govern whether a world projection surface should appear.

Examples:

- `shouldShowUIUXEmptyWorld(...)` in [UIUXEmptyWorldOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXEmptyWorldOverlay.jsx:72)
- `shouldShowGraphicEmptyWorld(...)` in [GraphicEmptyWorldOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/GraphicEmptyWorldOverlay.jsx:48)
- `visible` checks in [GraphicFirstExpressionOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/GraphicFirstExpressionOverlay.jsx:41)
- `visible` checks in [GraphicVocabularyOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/graphic/GraphicVocabularyOverlay.jsx:22)

### Conditions That Belong to Language Projection

These are language meaning concerns:

- what title, copy, and actions appear
- what starter semantics exist
- what “first expression” means
- what vocabulary choices mean
- what refinement or delivery guidance is shown

These should remain inside the language overlays during initial cleanup.

## Recommended Cleanup Order

### Phase 1 — Freeze Current Overlay Inputs

Do not change the props currently passed from `CanvasRoot`.

Preserve inputs such as:

- `workspaceId`
- `modeId`
- `nodeCount`
- `worldHistory`
- `selectedNode`
- `nodesById`
- `dismissedNodeId`

Reason:

The first cleanup slice should change mount ownership, not behavior or state derivation.

### Phase 2 — Introduce a Shared Projection Slot Surface

Introduce a slot mechanism conceptually owned by the world substrate.

Initial slot categories:

- `emptyWorld`
- `firstExpression`
- `vocabulary`
- `refinement`
- `delivery`

The first implementation slice should use only:

- `emptyWorld`

Reason:

It is the clearest, lowest-risk slot and already exists in both UIUX and Graphic.

### Phase 3 — Move One Language Overlay Through One Slot

Start with:

- UIUX empty-world projection

Reason:

- it is a single overlay
- it has simple world visibility inputs
- it has existing tests
- it is the clearest proof that world visibility and language content can separate without affecting runtime

After that is validated, the same slot can host Graphic empty-world projection.

### Phase 4 — Expand Only After Slot Proof

Only after empty-world slot mounting is validated should later slots be considered:

- first expression
- vocabulary
- refinement
- delivery

Do not bundle them into the first slice.

## Lowest-Risk First Slot

The first projection slot should be:

`emptyWorld`

First mounted language:

`UIUXEmptyWorldOverlay`

Why this is lowest-risk:

- it is already an isolated overlay
- it has direct world-state gating
- it does not depend on selection dismissal chains
- it validates the dependency direction change clearly
- it does not require new shell authority

Optional second proof after validation:

- `GraphicEmptyWorldOverlay`

## First-Slice Non-Goals

Do not include in the first slot slice:

- Graphic first-expression overlay
- vocabulary overlay
- refinement overlay
- delivery overlay
- overlay redesign
- new shell composition layer
- changes to activation contracts

These are later steps.

## Validation Targets

The first projection-slot slice should validate with:

- focused overlay tests
- Graphic and UIUX empty-world flow tests
- architecture gate
- release operator surfaces gate

If a Playwright suite is required, keep it focused on overlay and entry-state behavior rather than broad interaction churn.

## Stop Conditions

Projection cleanup should stop immediately if:

- slot mounting requires runtime shape changes
- slot mounting requires route or shell renames
- slot mounting changes overlay behavior rather than mount direction
- shared world slot logic starts owning language copy or semantics
- a new parallel shell authority becomes necessary

If any of these occur, stop and produce a narrower follow-up plan.

## Recommendation

The repository is ready for projection-slot cleanup planning.

It is not ready for broad overlay extraction.

Recommended next sequence:

1. Commit and freeze Activation Slice 1.
2. Implement one empty-world projection slot only.
3. Route UIUX empty-world through that slot without behavior changes.
4. Validate with focused overlay tests plus architecture and release gates.
5. Record results before considering Graphic or later projection stages.

Key principle:

`Plan projection ownership before moving overlay code.`
