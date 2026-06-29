# UIUX Creative Domain Projection Specification

## Purpose

This document is the first Era II-B product specification.

It translates the
[Creative Domain Model](./CREATIVE_DOMAIN_MODEL.md)
into an actual `uiux` user experience.

It does not define runtime architecture.
It does not define governance.
It defines how `uiux` should make a creator feel like they are speaking the
language of Digital Product Design inside Dropple.

## Scope

This specification governs the `uiux` reference experience for:

- Creation Rail
- Inspector
- Context Menu
- Timeline
- Templates
- future AI assistance

It should be used as the blueprint for product behavior during the
`Create/UI Reference Implementation v1`
transition from `Verified -> Frozen`.

Its current execution lane is:

`Create/UI Expression`

For the product-side bridge and active milestone framing, see:

- [PRODUCT_EXPRESSION_PRINCIPLES.md](./PRODUCT_EXPRESSION_PRINCIPLES.md)
- [CREATE_UI_EXPRESSION_MILESTONES.md](./CREATE_UI_EXPRESSION_MILESTONES.md)

## Domain Definition

### Creative Domain

Digital Product Design

### Creative World

Application

### Creative Language

`Application`

`-> Page`

`-> Section`

`-> Component`

`-> Element`

### Artifact Model

Current artifact representations should bias toward:

- Frame
- Container
- Text
- Image
- Button
- Input
- Navigation block

Important:

The creator should experience the language first.
Artifacts are the current representation of that language.

So:

- a `Frame` should be experienced as a `Page` or `Screen`
- a `Container` should be experienced as a `Section` or `Component` boundary
- `Text` should be experienced as content hierarchy

## Product Objective

A new user should be able to move from an empty project to a meaningful
interface while naturally learning the language of Digital Product Design.

The experience should not feel like:

- managing tools
- browsing property lists
- operating an editor

It should feel like:

- shaping an application
- adding pages and structure
- introducing content
- refining interface behavior
- revealing motion only when time becomes relevant

## Core Projection Rule

Dropple should not primarily expose tools in `uiux`.

It should expose the language of Digital Product Design progressively.

Every UI decision should be evaluated by one question:

`Does this help the creator speak Digital Product Design more fluently?`

## Experience Stages

### Stage 0 — Empty World

#### State

- no artifacts
- no selection
- world is calm

#### What the creator should feel

`I'm about to design an application.`

Not:

`I am staring at a blank editor.`

#### Language being introduced

- Application
- Page
- Start point

#### Creation Rail

Primary entries:

- Frame
- Templates
- Import

Secondary entries may exist, but should not dominate.

The rail should not foreground:

- border radius
- fill
- shadow
- fine-grained styling controls

Those concepts do not belong yet because nothing exists yet.

#### Inspector

- hidden or quiet
- may show guidance, but not editing chrome

#### Context Menu

- absent unless world-level action exists

#### Timeline

- absent

#### Templates

Primary template families:

- Landing Page
- Dashboard
- Login Flow
- Mobile App
- SaaS App Shell

Templates should feel like meaningful application starting points, not sample files.

#### AI

Future AI prompts should be framed like:

- start a landing page
- create a dashboard shell
- begin a mobile app screen

Not:

- draw a rectangle

### Stage 1 — First Frame

#### State

- first frame exists
- frame is selected or newly created

#### What the creator should feel

`I am creating a page or screen.`

Not:

`I have created a rectangle with width and height.`

#### Language being introduced

- Page
- Screen
- Section
- Structure

#### Artifact Interpretation

The first frame should be treated as the first visible page/screen artifact in
the application world.

#### Creation Rail

Now relevant:

- Text
- Section
- Container
- Component
- Assets

The rail should guide the creator toward populating the page, not toward
unrelated low-level controls.

#### Inspector

The inspector should first communicate possibility before property editing.

It should help the creator understand:

`This Page can become:`

- Landing Page
- Dashboard
- Mobile Screen
- Login
- Settings
- Component Shell

Only after that should editing controls become prominent.

Property groups should be language-shaped:

- Structure
- Layout
- Appearance

instead of a raw dump of geometry fields.

#### Context Menu

Shared interaction actions are allowed, but should remain contextual and quiet.

#### Timeline

- absent

### Stage 2 — Content Introduction

#### State

- text, image, or container content has been added

#### What the creator should feel

`I am shaping the content and hierarchy of an interface.`

#### Language being introduced

- Typography
- Content hierarchy
- Media
- Layout
- Spacing

#### Creation Rail

Prominent entries:

- Text
- Image
- Container
- Component
- Assets

#### Inspector

The inspector should now reveal capability domains such as:

- Content
- Typography
- Layout
- Spacing
- Appearance

It should not force the user to think first in CSS-like implementation terms.

#### Context Menu

May offer:

- duplicate
- group
- delete
- arrangement-related actions when context makes them relevant

#### Timeline

- absent unless motion has been attached

### Stage 3 — Structure and Interaction

#### State

- multiple artifacts exist
- relationships matter
- interface begins behaving like an application rather than a static page

#### What the creator should feel

`I am organizing interface behavior and structure.`

#### Language being introduced

- Component
- Navigation
- Input
- State
- Relationship

#### Creation Rail

Prominent entries may include:

- Component
- Input
- Navigation block
- Assets

#### Inspector

Now relevant domains include:

- Structure
- Layout
- Interaction
- Component semantics
- Reuse potential

The inspector should help the creator see what the current artifact can become:

- a reusable component
- a navigation region
- an input pattern
- a structured section

#### Context Menu

Now grouping, duplication, and other shared interaction actions become more
important because the creator is working structurally.

#### Timeline

- still absent unless time becomes relevant

### Stage 4 — Motion Emergence

#### State

- motion is attached
- the interface has entered temporal behavior

#### What the creator should feel

`I am refining how the interface behaves over time.`

#### Language being introduced

- Transition
- Motion
- Timing
- Sequence

#### Inspector

Motion should appear as a capability domain when relevant.

It should not permanently dominate the editor before time becomes relevant.

#### Timeline

The timeline should appear only when the language enters time.

It should never be treated as a permanently visible editor fixture in `uiux`.

The creator should feel:

`Time is now part of this interface.`

Not:

`This editor always has a timeline.`

#### Context Menu

May reveal motion-aware actions only when motion context exists.

### Stage 5 — Refine and Deliver

#### State

- structure exists
- content exists
- interaction exists
- optional motion exists

#### What the creator should feel

`I am polishing and preparing a coherent interface.`

#### Language being introduced

- consistency
- reuse
- polish
- export
- handoff

#### Inspector

Relevant domains now emphasize:

- consistency
- appearance refinement
- component reuse
- export readiness

#### Templates

At this stage, template logic may also help identify:

- convert this into a reusable pattern
- save as a component seed
- derive from an existing app shell

## Surface Rules

### Creation Rail

The Creation Rail introduces things into the Project World.

In `uiux`, it should introduce the language of application design, not a
permanent inventory of primitive tools.

### Inspector

The Inspector should explain what artifacts can become before drowning the user
in raw properties.

The Inspector should behave like:

- language guide
- capability revealer
- evolution surface

Not:

- property dump

### Context Menu

The Context Menu should offer contextual actions within the language.

It should not become the primary teaching surface for the mode.

### Timeline

The Timeline should appear when the `uiux` language enters time.

It is a projection of motion relevance, not a permanent editor assumption.

### Templates

Templates should represent meaningful starting points in the language of
Digital Product Design.

They should feel like:

- application patterns
- page archetypes
- interface journeys

Not:

- sample files

### AI Assistance

Future AI in `uiux` should complete the language, not generate random objects.

Examples:

- create a dashboard section
- add a login flow
- turn this into a reusable settings component

This is stronger than:

- add a rectangle
- add a button

## Success Criteria

This specification is successful when:

- the creator experiences `Frame` as `Page/Screen`
- the creator learns structure before low-level styling
- the inspector explains possibility before raw property editing
- the creation rail introduces meaningful application artifacts
- the timeline appears only when time becomes relevant
- templates feel like Digital Product Design starting points
- the overall flow teaches the language of Digital Product Design progressively

## Evaluation Questions

Every `uiux` projection decision should be tested against these questions:

1. What stage of the language is the creator currently in?
2. What concept should be revealed next?
3. Which surface should reveal that concept?
4. Does this surface express the language, or just expose software operations?
5. Does this move the creator from confusion toward fluency in the domain?

## Implementation Use

This specification should now drive:

- Creation Rail refinement
- Inspector evolution
- Template exposure
- motion emergence behavior
- Context Menu projection
- future AI assistance behavior

It is the product blueprint for the first `uiux` Creative Domain Projection
pass.
