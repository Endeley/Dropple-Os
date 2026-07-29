# First World World Renderer Implementation Plan

## Purpose

This document translates the frozen
[FIRST_WORLD_WORLD_RENDERER_CONTRACT.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/FIRST_WORLD_WORLD_RENDERER_CONTRACT.md:1)
into an executable engineering sequence.

It exists to answer one practical question:

`How should the First World World Renderer be built, migrated, validated, and frozen without redefining the renderer constitution?`

## Constitutional Constraint

This implementation plan is subordinate to
[FIRST_WORLD_WORLD_RENDERER_CONTRACT.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/FIRST_WORLD_WORLD_RENDERER_CONTRACT.md:1).

It may decompose and sequence the work.

It may not:

- reinterpret the renderer purpose
- expand the renderer purpose
- weaken the renderer purpose
- replace the renderer constitution
- redefine ownership
- redefine non-ownership
- redefine inputs
- redefine outputs
- redefine the five constitutional laws
- change navigation authority
- change world authority
- change region authority

## Governing Authorities

This plan receives authority from:

- [PRODUCT_GOVERNANCE_CONSTITUTION.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/PRODUCT_GOVERNANCE_CONSTITUTION.md:1)
- [FIRST_WORLD_GOVERNANCE_STATUS.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/FIRST_WORLD_GOVERNANCE_STATUS.md:1)
- [FIRST_WORLD_WORLD_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/FIRST_WORLD_WORLD_MODEL.md:1)
- [FIRST_WORLD_DOMAIN_CAPABILITIES.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/FIRST_WORLD_DOMAIN_CAPABILITIES.md:1)
- [FIRST_WORLD_CONSTITUTIONAL_RUNTIME_INTEGRATION.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/FIRST_WORLD_CONSTITUTIONAL_RUNTIME_INTEGRATION.md:1)
- [FIRST_WORLD_SYSTEM_ARCHITECTURE.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/FIRST_WORLD_SYSTEM_ARCHITECTURE.md:1)
- [FIRST_WORLD_WORLD_RENDERER_CONTRACT.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/FIRST_WORLD_WORLD_RENDERER_CONTRACT.md:1)

## Implementation Objective

Replace the visible First World composition renderer with a dedicated
`World Renderer` that satisfies the frozen renderer constitution while
preserving the existing world architecture:

- `LivingWorldHost`
- `WorldCore`
- `RegionHost`
- `NavigationFramework`

The objective is not to improve the old composition renderer.

The objective is to make the old composition renderer non-authoritative and
replace it with a dedicated world projection engine.

## In Scope

This plan defines:

- the systems to be built
- the boundaries between those systems
- the dependencies between those systems
- migration from `ProjectHomeClient`
- implementation order
- validation gates
- removal of obsolete document and composition behavior
- freeze criteria

## Out of Scope

This plan does not define:

- new renderer laws
- new world truth
- new navigation truth
- new runtime authority
- region redesign at the product-definition layer
- workspace implementation
- product-governance amendments

## Implementation Systems

The `World Renderer` should be decomposed into the following engineering
systems.

Each system exists to satisfy the frozen constitution.

### 1. World Model Adapter

#### Responsibility

Convert existing world geography and district metadata into the renderer's
input shape without creating new world truth.

#### Owns

- renderer input normalization
- immutable renderer-facing world descriptors
- lawful translation of district metadata into renderable world objects

#### Must Never Own

- geography invention
- navigation truth
- region authority
- runtime state authority

#### Dependencies

- `WorldCore`
- `RegionHost`
- frozen world geography and district metadata

### 2. Camera System

#### Responsibility

Hold current and target camera transforms and perform continuous travel
interpolation.

#### Owns

- camera position
- camera heading
- camera orientation
- camera travel interpolation
- arrival and departure interpolation semantics

#### Must Never Own

- district coordinates
- navigation truth
- world truth
- region truth

#### Dependencies

- `NavigationFramework`
- renderer input world geometry

### 3. Projection System

#### Responsibility

Convert fixed world coordinates into viewport coordinates and derive scale,
depth, and perspective.

#### Owns

- world-to-viewport projection
- perspective derivation
- depth projection
- derived visual projection values

#### Must Never Own

- authored active-state styling logic
- district truth
- camera target selection

#### Dependencies

- `Camera System`
- `World Model Adapter`

### 4. Visibility and Frustum System

#### Responsibility

Determine what can be seen from the camera without treating invisible
districts as nonexistent.

#### Owns

- frustum checks
- visibility eligibility
- viewport inclusion
- offscreen persistence handling

#### Must Never Own

- world deletion semantics
- navigation decisions
- region authority

#### Dependencies

- `Camera System`
- `Projection System`

### 5. Level of Detail System

#### Responsibility

Derive information density from projected distance and apparent size.

#### Owns

- horizon-level detail
- landmark-level detail
- identity-level detail
- arrival-level detail

#### Must Never Own

- active/inactive presentation truth
- world truth
- business logic

#### Dependencies

- `Projection System`
- `Visibility and Frustum System`

### 6. Occlusion and Render-Order System

#### Responsibility

Establish believable depth ordering and prevent every district from competing
for visibility equally.

#### Owns

- render order
- occlusion ordering
- overlap arbitration
- near/far precedence in projection

#### Must Never Own

- navigation truth
- district existence
- visibility truth outside projection

#### Dependencies

- `Projection System`
- `Visibility and Frustum System`

### 7. Atmosphere System

#### Responsibility

Derive haze, clarity, environmental falloff, and atmospheric depth from
camera relationships.

#### Owns

- atmospheric falloff
- depth reinforcement
- environmental projection effects
- distance-reinforcing ambience

#### Must Never Own

- district truth
- camera target truth
- decorative motion without projection meaning

#### Dependencies

- `Camera System`
- `Projection System`
- `Visibility and Frustum System`

### 8. World Surface and District Renderer

#### Responsibility

Render projected world objects without section, card, or active-state
composition assumptions.

#### Owns

- world surface rendering
- district rendering
- landmark rendering
- projected visual composition inside the viewport

#### Must Never Own

- navigation truth
- list-order composition
- document layout semantics
- section-based rendering assumptions

#### Dependencies

- `World Model Adapter`
- `Projection System`
- `Visibility and Frustum System`
- `Level of Detail System`
- `Occlusion and Render-Order System`
- `Atmosphere System`

### 9. Input-to-Navigation Adapter

#### Responsibility

Convert wheel, keyboard, touch, pointer selection, or future travel intent
into navigation requests without allowing the renderer to own navigation
truth.

#### Owns

- local input capture
- renderer-to-navigation intent translation
- camera-compatible travel request shaping

#### Must Never Own

- final navigation authority
- world truth
- route authority

#### Dependencies

- `NavigationFramework`
- `Camera System`

### 10. Composition-Root Migration

#### Responsibility

Reduce `ProjectHomeClient` to wiring responsibilities and place rendering
inside the dedicated `World Renderer`.

#### Owns

- migration of composition-root responsibilities
- lawful renderer mounting
- root-level integration with `LivingWorldHost`, `WorldCore`, `RegionHost`,
  and `NavigationFramework`

#### Must Never Own

- renderer law redefinition
- world truth creation
- new navigation authority

#### Dependencies

- every renderer system above

### 11. Legacy Removal

#### Responsibility

Remove obsolete document and composition behavior once the dedicated
`World Renderer` is authoritative.

#### Owns

- removal of stop-based composition logic where superseded
- removal of list-order proximity logic where superseded
- removal of hidden section dependencies where lawfully replaceable
- removal of viewport-centered staging assumptions where superseded
- removal of per-district authored visual orchestration that violates
  projection law

#### Must Never Own

- removal of lawful accessibility surfaces without replacement
- removal of world architecture
- removal of navigation authority

#### Dependencies

- `World Renderer`
- technical validation

### 12. Validation and Freeze

#### Responsibility

Prove that the renderer constitution has been satisfied technically and
perceptually before freeze.

#### Owns

- technical validation planning
- creator validation planning
- freeze readiness evidence

#### Must Never Own

- architectural reinterpretation
- renderer law amendment

#### Dependencies

- full implementation

## Dependency Sequence

The implementation order should be:

1. `World Model Adapter`
2. `Camera System`
3. `Projection System`
4. `Visibility and Frustum System`
5. `Level of Detail System`
6. `Occlusion and Render-Order System`
7. `Atmosphere System`
8. `World Surface and District Renderer`
9. `Input-to-Navigation Adapter`
10. `Composition-Root Migration`
11. `Legacy Removal`
12. `Validation and Freeze`

This sequence ensures that projection truth exists before rendering, and that
rendering truth exists before legacy behavior is removed.

## Migration Strategy

The migration from `ProjectHomeClient` must proceed in three phases.

### Phase 1 - Parallel Preparation

Build renderer systems while `ProjectHomeClient` remains the visible
composition root.

Purpose:

- establish renderer inputs
- establish camera and projection
- establish world surface rendering primitives

### Phase 2 - Renderer Assumption Transfer

Move visible rendering authority from `ProjectHomeClient` to the dedicated
`World Renderer`.

Purpose:

- retire section/card/page assumptions
- retire viewport-centered composition authority
- make the renderer the visible authority of the First World

### Phase 3 - Legacy Removal

Remove obsolete composition behavior only after the `World Renderer` is
proven authoritative.

Purpose:

- reduce `ProjectHomeClient` to composition-root wiring
- remove renderer logic from the page shell
- preserve only lawful accessibility or compatibility surfaces

## Technical Validation

Technical validation must prove the renderer constitution.

At minimum it must verify:

- districts remain fixed in world coordinates
- only the camera travels
- visual properties derive from projection
- navigation authority remains external
- offscreen geography persists
- no section-scrolling renderer remains authoritative
- active-state composition is no longer the source of visible rendering truth
- visibility derives from frustum and projection, not list order

## Creator Validation

Creator validation must prove perception, not just correctness.

At minimum it must verify:

- travel does not feel like cards sliding
- arrival feels spatial
- the previous district appears left behind
- unseen geography feels present
- the browser feels like a camera window into a larger world
- the current destination becomes the dominant frame of reference
- the world feels persistent while the creator moves

## Validation Gates

Implementation should not advance to freeze unless both validation classes
pass.

### Gate 1 - Constitutional Fidelity

Does the implementation preserve:

- `Projection Law`
- `World Permanence Law`
- `Camera Law`
- `Viewport Law`
- `Non-Creation Law`

### Gate 2 - Authority Fidelity

Does the implementation preserve:

- `WorldCore` ownership of world truth
- `RegionHost` ownership of region truth
- `NavigationFramework` ownership of navigation truth
- renderer ownership of visual projection only

### Gate 3 - Technical Fidelity

Does the implementation obey the plan's engineering boundaries and remove
obsolete composition authority?

### Gate 4 - Creator Fidelity

Does the visible First World feel like travelling through a persistent world
rather than switching between page states?

## Freeze Criteria

The `World Renderer` is not complete merely because new components exist.

It is complete only when:

- the old composition renderer no longer controls the visible `First World`
- the constitutional laws are technically verified
- creator validation passes
- obsolete document/composition authority is lawfully removed or reduced to
  non-authoritative compatibility surfaces
- the replacement is documented and frozen

## Completion Rule

The lawful end of this plan is not:

`new renderer code exists`

The lawful end of this plan is:

`the First World is visibly rendered by a dedicated World Renderer that satisfies the frozen constitution`

## Consequence for Engineering

From this point forward, implementation must be judged against the frozen
renderer constitution and this implementation sequence.

If implementation attempts to redefine renderer ownership, introduce new laws,
or reintroduce document composition assumptions as authoritative rendering
logic, the implementation has failed and must be corrected rather than
explained.
