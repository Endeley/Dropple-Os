# First World World Renderer Contract

## Status

`FROZEN`

## Authority

`Constitutional`

## Layer

`First World -> Rendering`

## Purpose

This document defines the permanent responsibilities, boundaries, and
governing laws of the `First World Renderer`.

It is implementation-agnostic.

It does not define how `React`, `CSS`, `Canvas`, `WebGL`, `Three.js`, or any
future rendering technology implements the renderer.

It defines what the renderer is, what it owns, what it must never own, what
it receives, and what it produces.

It answers one question only:

`What is the permanent constitutional contract of the First World Renderer?`

## Rendering Constitution

The `First World Renderer` is the visual projection engine of the `First
World`.

Its responsibility is to render one persistent `Living World` from the
viewpoint of a camera.

It does not create the world.

It does not define the world.

It does not own navigation truth.

It only projects existing world truth into the browser.

The browser is a viewport, not the world itself.

## Rendering Philosophy

The renderer does not render:

- pages
- sections
- cards
- active screens

The renderer renders:

- a persistent world
- through a camera
- into a viewport

Every visible element must be a consequence of world projection.

Never a consequence of UI composition.

## Governing Authorities

This document receives authority from:

- [PRODUCT_GOVERNANCE_CONSTITUTION.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/PRODUCT_GOVERNANCE_CONSTITUTION.md:1)
- [FIRST_WORLD_GOVERNANCE_STATUS.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/FIRST_WORLD_GOVERNANCE_STATUS.md:1)
- [FIRST_WORLD_WORLD_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/FIRST_WORLD_WORLD_MODEL.md:1)
- [FIRST_WORLD_DOMAIN_CAPABILITIES.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/FIRST_WORLD_DOMAIN_CAPABILITIES.md:1)
- [FIRST_WORLD_CONSTITUTIONAL_RUNTIME_INTEGRATION.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/FIRST_WORLD_CONSTITUTIONAL_RUNTIME_INTEGRATION.md:1)
- [FIRST_WORLD_SYSTEM_ARCHITECTURE.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/FIRST_WORLD_SYSTEM_ARCHITECTURE.md:1)

This document does not redefine those authorities.

It defines the permanent rendering boundary through which they become
perceptible.

## Ownership

The `First World Renderer` owns only visual projection.

### 1. World Surface

The persistent visual surface that represents the `Living World`.

### 2. Camera

The creator's viewpoint into the world.

The renderer owns camera projection concerns such as:

- position
- heading
- orientation
- travel interpolation

The camera moves.

The world does not.

### 3. Projection

Transforms world coordinates into viewport coordinates.

All visible appearance must derive from projection.

### 4. Perspective

Creates the perception of depth through projection.

Not through arbitrary UI animation.

### 5. Depth

Maintains perceived distance between districts, landmarks, and environmental
features.

Distance affects rendering naturally.

### 6. Visibility

Determines which parts of the world are currently visible.

Visibility derives from camera position and projection.

Not active state.

### 7. View Frustum

Determines what the current camera window can see.

Districts outside the camera view continue to exist.

They are simply not rendered inside the current viewport.

### 8. Level of Detail

Distance determines information density.

Example progression:

- `Horizon`
- `Landmark`
- `Identity`
- `Arrival`

### 9. Occlusion

Nearer world objects may naturally obscure farther objects.

The renderer must preserve believable spatial relationships.

### 10. Atmosphere

Renders environmental depth.

Examples may include:

- haze
- light falloff
- environmental particles
- ambient world effects

Atmosphere exists to reinforce distance.

Never to replace it.

### 11. Travel Interpolation

Produces continuous camera movement.

The renderer interpolates the camera.

Never the world.

### 12. Arrival and Departure

The renderer communicates:

- approaching
- arrival
- departure

These are camera relationships.

Not UI state transitions.

## Explicit Non-Ownership

The renderer must never own:

- navigation truth
- region authority
- world geography
- runtime execution
- application state
- workspace logic
- business logic
- routing
- commands
- events

Those responsibilities belong elsewhere.

## Inputs

The renderer receives only:

- world geography
- district metadata
- camera target
- navigation state
- atmosphere state

It does not receive UI instructions.

Example:

Wrong:

`Design is active.`

Correct:

`Camera target = Design.`

Everything else is derived from projection.

## Outputs

The renderer produces:

- projected world
- projected districts
- projected depth
- projected visibility
- projected atmosphere
- projected perspective

Nothing else.

It produces pixels.

Not decisions.

## Constitutional Laws

### Law 1 - Projection Law

Every visible property must derive from world projection.

Never from UI state.

Wrong:

`if active: scale = 1.0`

Correct:

`camera <-> district distance`

`-> projection`

`-> scale`

The same law applies to:

- opacity
- blur
- detail
- brightness
- visibility
- atmospheric effects

### Law 2 - World Permanence Law

The `Living World` exists independently of the viewport.

If a district leaves the viewport, it has not disappeared.

It simply lies outside the current camera view.

The browser is a window.

Not the world.

### Law 3 - Camera Law

The camera is the only travelling observer.

Districts remain fixed within the world's geography.

Districts never animate themselves toward the creator.

The camera approaches districts.

The world remains fixed.

### Law 4 - Viewport Law

The browser is a viewport into the world.

It is not the world itself.

The viewport is never expected to reveal the entire world.

It reveals only what the current camera position can observe.

The existence of unseen geography is a fundamental property of the `First
World`.

### Law 5 - Non-Creation Law

The renderer never creates, modifies, or interprets world truth.

It only projects existing truth.

## Responsibility Boundary

The renderer exists inside a larger constitutional chain:

- `WorldCore` owns world truth
- `RegionHost` owns region truth
- `NavigationFramework` owns navigation truth
- `First World Renderer` owns visual projection

No subsystem may cross those ownership boundaries.

## Success Criteria

The renderer succeeds when the creator naturally believes:

- `I entered a world.`
- `The world exists beyond what I can currently see.`
- `I travelled to this district.`
- `I left another district behind.`
- `The world remained consistent while I moved.`

The creator should never feel:

- that cards slid across the screen
- that sections changed
- that pages switched
- that the interface rearranged itself

The only believable explanation should be:

`The camera moved through a persistent Living World.`

## Architectural Significance

This document establishes `Rendering Constitution` as a first-class layer in
the `First World` pipeline:

- `Truth`
- `Behavior`
- `Structure`
- `Capabilities`
- `Architecture`
- `Rendering Constitution`
- `Implementation`

Rendering is therefore not treated as incidental UI.

It is a governed architectural concern with permanent laws.

## Consequence for Implementation

From this point forward, the renderer is no longer a design question.

The lawful implementation task becomes:

`Build a World Renderer that satisfies this constitution.`
