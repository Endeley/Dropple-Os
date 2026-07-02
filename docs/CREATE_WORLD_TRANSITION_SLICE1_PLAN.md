# Create World Transition Slice 1 Plan

## Purpose

This document defines the first Living Create World transition slice.

It is not a UI specification.
It is not a shell specification.
It is not an implementation plan for broad interface redesign.

It is an experience transition specification.

Its purpose is to define how Dropple should transform from:

`Creative Direction`

to:

`Creative Arrival`

while making the creator feel they never left the same world.

## Position in the Current Model

This slice follows the now-frozen experience progression in:

- [CREATE_WORLD_EXPERIENCE_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATE_WORLD_EXPERIENCE_MODEL.md:1)

It starts from the currently validated UIUX entry state proven by:

- [uiux-empty-world.spec.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/tests/e2e/uiux-empty-world.spec.js:3)

It does not yet define:

- `Creative Arrival -> First Expression`
- `First Expression -> Project Emergence`
- `Project Emergence -> Living Project`

Those belong to later slices.

## Core Question

What should happen one second after a creator commits to a meaningful starting direction so that the world feels like it responded, rather than the software loading a different editor?

## Current State

Current validated state:

- the creator enters a language-specific empty world
- the system communicates:
  - `Design an Application`
  - `Everything starts with a Page`
- the creator chooses a meaningful direction:
  - `Blank Page`
  - `Landing Page`
  - `Dashboard`
  - `Login`
  - `Settings`

This state already succeeds at `Creative Direction`.

The creator feels:

- oriented
- guided
- not tool-overloaded
- invited into a meaningful beginning

## Trigger

This transition begins when the creator makes their first meaningful creative commitment.

Examples:

- choosing `Blank Page`
- choosing `Landing Page`
- choosing `Dashboard`
- choosing `Login`
- choosing `Settings`

The trigger is not:

- opening a tool
- clicking a panel
- selecting a property

It is the first meaningful creative commitment.

## Destination

The destination is `Creative Arrival`.

The creator should feel:

- the world acknowledged my choice
- I am still in the same place
- something has begun
- nothing is demanding too much from me yet

They should not feel:

- a new editor loaded
- I was dropped into a tool
- the system changed modes abruptly
- I need to understand everything now

## Transition Principle

The transition itself is the product.

This slice should not be approached as:

`Hide one screen`
`Show another screen`

It should be approached as:

`The world responds to the creator's commitment.`

That means the creator should experience continuity, not replacement.

## Transformation Requirements

The transformation should make the world feel alive and responsive without increasing complexity too quickly.

### What should change

The following kinds of change are expected:

- the starter cards recede
- the empty-world headline loses authority
- the chosen direction becomes the active narrative
- the world becomes calmer and more spatially legible
- the first project identity begins to emerge
- visual authority begins shifting away from onboarding guidance and toward the emerging work

### What may change visually

Without specifying exact UI, the world may respond through moves such as:

- guidance cards fading or withdrawing
- a gentle camera move or spatial easing
- a page or initial artifact beginning to materialize
- subtle shell rebalancing
- world atmosphere becoming quieter and more focused

These are not implementation instructions.

They are examples of how continuity, response, and arrival might be felt without making the transition behave like a screen replacement.

### What must remain stable

The creator must still feel:

- this is the same world
- this is the same project
- this is the same creative journey

The transition must not feel like:

- route replacement
- mode switching
- launching a separate editor

## Visual Authority

This transition must change who owns the creator's attention.

Before the transition:

- onboarding guidance owns visual authority

After the transition:

- the emerging work begins taking visual authority

The world should remain present.
The UI should remain quiet.
But guidance should begin yielding to the creator's chosen direction.

This is the first moment where the project begins to matter more than the invitation.

## What Must Not Appear Yet

This slice should not introduce the full complexity of worked-world authoring.

Do not require:

- dense inspector complexity
- deep layer hierarchy management
- advanced panel choreography
- broad capability exposure
- tool-heavy interaction burden

The creator has only just chosen a direction.
They have not yet earned full editing complexity.

## Relationship to First Expression

This slice stops before `First Expression`.

That means the transition is not yet trying to answer:

- how the first page appears as an active artifact
- how editing begins in detail
- how worked-world structure becomes dominant

It is only responsible for moving the creator from:

`I have chosen a direction`

to:

`I have arrived in my world`

## Experience Laws

This slice must preserve:

### Continuity

The creator never feels they left the world.

### Meaning Before Mechanics

Creative commitment happens before editing mechanics.

### Progressive Revelation

Only what is needed now becomes visible.

### Visual Authority

Guidance yields to the creator's work.

### World Stability

Navigation, geography, and identity remain constant throughout the transition.

## Success Criteria

This slice succeeds only if the creator feels:

- the world responded to my decision
- I did not leave the same creative universe
- the system is guiding me into creation naturally
- complexity is still under control

This slice fails if the creator feels:

- another editor loaded
- I was dropped into tooling
- the interface became the main subject
- the transition was abrupt or mechanical

## Validation Questions

Future implementation and validation should answer:

- Does the creator feel continuity between empty world and arrival?
- Does the chosen direction remain meaningful during the transition?
- Does the world feel more alive rather than simply more populated?
- Is complexity still being withheld appropriately?
- Does the creator remain oriented without feeling forced into editing?

## Out of Scope

This slice does not define:

- final shell layout
- final animation choreography
- full worked-world authoring
- first-expression implementation
- project emergence behavior
- living-project behavior

Those belong to later transition slices.

## Follow-on Sequence

If this slice is later reviewed, implemented, validated, and frozen, the next slice becomes:

`Creative Arrival`

to:

`First Expression`

## Closing Rule

The current first screen is not the wrong beginning.

It is the beginning.

This slice exists to define how that beginning transforms into lived presence inside one continuous Create World.
