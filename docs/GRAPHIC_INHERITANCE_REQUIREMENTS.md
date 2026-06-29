# Graphic Inheritance Requirements

## 1. Purpose

This document is a proof artifact.

It does not implement Graphic.
It does not extract Create World Shell.
It does not rename routes or shells.

Its purpose is to answer one question:

`If Graphic became active tomorrow, would it inherit the existing Create World Shell and Product Expression surfaces, or would it require a duplicated Graphic-specific world/shell?`

Primary references:

- [CREATE_WORLD_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_MODEL.md)
- [CREATE_WORLD_NAVIGATION_AND_GEOGRAPHY_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_NAVIGATION_AND_GEOGRAPHY_MODEL.md)
- [CREATE_WORLD_SHELL_BOUNDARY_AUDIT.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_SHELL_BOUNDARY_AUDIT.md)
- [PRODUCT_EXPRESSION_PRINCIPLES.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/PRODUCT_EXPRESSION_PRINCIPLES.md)
- [CREATIVE_DOMAIN_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_DOMAIN_MODEL.md)
- [MODE_OVERLAY_MATRIX.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/MODE_OVERLAY_MATRIX.md)

## 2. Inheritance Test

Validation rule:

If Graphic needs its own:

- canvas
- world
- navigation shell
- viewport system
- world memory
- inspector shell
- selection substrate

then the Create World Shell model is overstated.

If Graphic mostly needs:

- Graphic language dictionary
- Graphic semantic projection
- Graphic creation vocabulary
- Graphic starter semantics
- Graphic domain meanings

while inheriting the existing world/shell/expression substrate, then the model is holding.

Evidence from the current repository supports the second case more strongly than the first:

- [graphicWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/graphicWorkspace.js:4) defines Graphic as a mode with tools, panels, capabilities, and event policy, not as a separate canvas or world runtime.
- [WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx:117) mounts the shared canvas substrate by `workspaceId`.
- [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:100) owns shared viewport, history, selection, guides, context menu, first-artifact, and world-memory behavior.
- [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:44) already behaves like a generic inspector shell framework driven by workspace activation.

## 3. What Graphic Inherits from Create World Shell

Graphic can inherit these responsibilities unchanged from the existing shared shell substrate:

- Canvas mounting.
  Evidence: [WorkspaceCanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/WorkspaceCanvasRoot.jsx:117)
- Canvas substrate and host composition.
  Evidence: [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:100)
- Viewport initialization.
  Evidence: [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:286)
- Home, focus, origin, and geography policy.
  Evidence: [projectSubstrateNavigation.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/workspaces/projectSubstrateNavigation.js:219), [CREATE_WORLD_NAVIGATION_AND_GEOGRAPHY_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_NAVIGATION_AND_GEOGRAPHY_MODEL.md:20)
- World memory and worked-world law.
  Evidence: [CREATE_WORLD_NAVIGATION_AND_GEOGRAPHY_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_NAVIGATION_AND_GEOGRAPHY_MODEL.md:29)
- First artifact placement.
  Evidence: [CREATE_WORLD_NAVIGATION_AND_GEOGRAPHY_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_NAVIGATION_AND_GEOGRAPHY_MODEL.md:71)
- Selection emergence.
  Evidence: [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:178), [CREATE_WORLD_SHELL_BOUNDARY_AUDIT.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_SHELL_BOUNDARY_AUDIT.md:73)
- Inspector emergence from selection.
  Evidence: [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:136)
- Panel section structure.
  Evidence: [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:44)
- Context menu, guides, ghost layers, and overlay substrate.
  Evidence: [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:367)
- Return-home behavior.
  Evidence: [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:294) calling [projectSubstrateNavigation.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/workspaces/projectSubstrateNavigation.js:219)

Interpretation:

Graphic does not need a `GraphicCanvasRoot`, `GraphicWorld`, `GraphicViewportSystem`, or `GraphicSelectionSubstrate` if the current Create World Shell audit is accurate.

## 4. What Graphic Inherits from Product Expression

Graphic should inherit these expression surfaces as shared patterns, while replacing language and framing content where needed:

- Top bar presentation pattern.
  Evidence: [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:360)
- Tool rail presentation pattern.
  Evidence: [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:396)
- Dock layout and shell choreography.
  Evidence: [UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:348)
- Inspector framing pattern.
  Evidence: [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:173)
- Empty World presentation pattern.
  Evidence: [UIUXEmptyWorldOverlay.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXEmptyWorldOverlay.jsx:101)
- Guidance surface pattern.
  Evidence: [PanelRenderer.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/PanelRenderer.jsx:173)
- Timeline emergence pattern when time-authoring becomes relevant.
  Evidence: [MODE_OVERLAY_MATRIX.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/MODE_OVERLAY_MATRIX.md:116)

Important distinction:

Graphic should inherit the pattern, not the UIUX wording.

For example:

- Empty World presentation pattern can be shared.
- “Design an Application” cannot be shared.
- Inspector framing pattern can be shared.
- UIUX-specific “Page/Application” semantics cannot be shared.

## 5. What Graphic Must Provide as Graphic Language

Graphic must provide its own language layer.

The current constitutional/domain evidence implies at least the following:

- Creative world:
  `Visual Communication`
  Evidence: [CREATIVE_DOMAIN_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_DOMAIN_MODEL.md:224)
- Primary grammar:
  `Composition`
  Evidence: [CREATIVE_DOMAIN_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_DOMAIN_MODEL.md:224)
- Expanded grammar direction:
  `Composition -> Group -> Object -> Style -> Effect`
  Evidence: [CREATIVE_DOMAIN_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_DOMAIN_MODEL.md:354)
- Primary artifact:
  `Artboard`
- Secondary artifacts:
  `Shape`, `Vector`, `Text`, `Image`
  Evidence: [graphicWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/graphicWorkspace.js:10)
- Graphic starter meanings such as:
  `Poster`, `Social Card`, `Brand Board`, `Icon Set`
  This is implied by the design overlays and Graphic’s role as the owner of `branding` and `icons`.
  Evidence: [MODE_OVERLAY_MATRIX.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/MODE_OVERLAY_MATRIX.md:59)
- Graphic creation vocabulary.
- Graphic semantic projection.
- Graphic next meaningful steps.
- Graphic-specific capability framing for export, vector, image composition, and branding/icon overlays.

Graphic therefore needs a language system parallel in role to UIUX, but not parallel in shell/runtime ownership.

## 6. What Must Not Be Duplicated

Graphic should not duplicate the following:

- a Graphic-specific canvas root
- a Graphic-specific world-memory system
- a Graphic-specific viewport/home/focus system
- a Graphic-specific selection substrate
- a Graphic-specific inspector shell framework
- a Graphic-specific panel section structure
- a Graphic-specific return-home law
- a Graphic-specific context menu/guides/ghost-layer substrate
- a Graphic-specific navigation geography policy

If Graphic introduces those, the current Create World Shell claim is weakened.

The strongest anti-duplication evidence is that these responsibilities already survive the UIUX disappearance test in [CREATE_WORLD_SHELL_BOUNDARY_AUDIT.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_SHELL_BOUNDARY_AUDIT.md:67).

## 7. Legacy Workspace Leakage

The main inheritance blockers are not canvas or runtime blockers.
They are legacy workspace-expression blockers.

Current leakage points:

- Route identity still expresses mode/workspace sovereignty.
  Evidence: [app/workspace/[mode]/page.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/app/workspace/[mode]/page.js:1), [routes.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/routes.js:3)
- Shell routing still special-cases `uiux`.
  Evidence: [WorkspaceShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/WorkspaceShell.jsx:24)
- Workspace activation contracts still expose panels/tools/canvas defaults as mode-owned workspace definitions.
  Evidence: [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:5), [graphicWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/graphicWorkspace.js:4)
- `uiux` still extends `graphic` through workspace registry inheritance, which is useful evidence for language inheritance but still expressed in workspace terms.
  Evidence: [uiuxWorkspace.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/workspaces/registry/uiuxWorkspace.js:11)
- `CanvasRoot` still imports a UIUX-specific Empty World overlay, meaning the world still knows one language directly.
  Evidence: [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:20), [CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:409)

These leaks do not prove Graphic needs its own shell.
They prove the current shared shell is not yet cleanly named or projected.

## 8. Minimum Requirement for Graphic Inheritance

Graphic inheritance does not require immediate extraction.
It does require the following boundary assumptions to hold:

1. Graphic must be allowed to mount through the same shared canvas substrate used today by UIUX.
2. Graphic must be allowed to drive `PanelRenderer` through Graphic activation panels rather than a Graphic-specific inspector shell.
3. Graphic must project its own empty-world language through the existing empty-world presentation pattern.
4. Graphic must provide its own language dictionary, semantic projection, starter vocabulary, and next-step guidance.
5. Graphic must not be forced to clone `UIUXAuthoringShell` merely to inherit shared world/shell behavior.

If those assumptions cannot hold without rewriting Graphic around a separate shell, the Create World Shell model is not ready.

## 9. Conclusion

Conclusion: `B`

Partially, Graphic can inherit the substrate, but shell/product expression extraction is still required first.

Why `B` instead of `A`:

- The shared-world substrate is strong enough.
- The shared inspector/panel substrate is strong enough.
- The shared product-expression patterns are visible enough.
- Graphic does not appear to need its own canvas, world, viewport, memory, or selection runtime.

But:

- shell routing still treats `uiux` as a dedicated shell owner
- route identity still expresses legacy workspace ownership
- activation contracts still express mode/workspace ownership rather than clean shell/language composition
- `CanvasRoot` still imports a UIUX-specific empty-world projection directly

Therefore the architecture is close to:

`One Create World`
`-> Many Creative Languages`

but not yet clean enough to claim Graphic inheritance as language-only without qualification.

Practical reading:

- Graphic can likely inherit Create World Shell.
- Graphic can likely inherit Product Expression patterns.
- Graphic must supply Graphic Language.
- Legacy workspace routing and shell naming still obscure that inheritance boundary and remain the minimum structural risk.
