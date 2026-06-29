# Create World Model

## Purpose

This document defines the canonical ownership model for `Create World`.

It does not introduce a new constitutional layer.
It does not extract code.
It does not redesign runtime authority.

It exists to answer one architectural question clearly:

`What belongs to the shared Create World, and what belongs to the active Creative Language?`

This document derives from:

- [CREATIVE_DOMAIN_MODEL.md](./CREATIVE_DOMAIN_MODEL.md)
- [PRODUCT_EXPRESSION_PRINCIPLES.md](./PRODUCT_EXPRESSION_PRINCIPLES.md)
- [CREATE_UI_EXPRESSION_MILESTONES.md](./CREATE_UI_EXPRESSION_MILESTONES.md)
- [UIUX_CREATIVE_DOMAIN_PROJECTION_SPECIFICATION.md](./UIUX_CREATIVE_DOMAIN_PROJECTION_SPECIFICATION.md)

## Core Claim

Dropple should converge toward:

`One Create World`

`-> Many Creative Languages`

This means:

- the world should be shared
- the language should vary by discipline
- runtime should continue to own execution truth
- product expression should continue to own how truth becomes experience

The creator should enter one lawful creative world substrate.
What changes across domains is the language projected inside that world.

## Relationship to Existing Models

The [Creative Domain Model](./CREATIVE_DOMAIN_MODEL.md) defines:

`Creative Domain`

`-> Creative World`

`-> Creative Language`

`-> Artifact Model`

`-> Capability Projection`

This document clarifies ownership inside that stack:

- `Create World` owns the shared world substrate for authoring
- `Creative Language` owns discipline-specific meaning
- `Runtime` owns canonical execution and state truth
- `Product Expression` owns how world and language become creator experience

## Ownership Layers

### 1. Create World

Create World owns the shared authoring universe.

It answers:

`What kind of place has the creator entered before any specific discipline is projected?`

Create World is not:

- a runtime reducer
- a language dictionary
- a discipline-specific shell
- a template family

Create World is the canonical shared substrate for creation.

### 2. Creative Language

Creative Language owns discipline-specific meaning inside the world.

It answers:

`What concepts does this creator think in?`

Examples:

- Application
- Page
- Section
- Component

or

- Composition
- Group
- Object
- Style

Creative Language does not own:

- viewport truth
- selection truth
- canvas transforms
- runtime state

It owns naming, relationships, interpretation, and semantic progression.

### 3. Runtime

Runtime owns canonical execution truth.

It answers:

`What is true right now, and how does it change lawfully?`

Runtime remains the authority for:

- state mutation
- replay
- event application
- viewport truth
- selection truth
- installable truth
- dispatch legality

Runtime does not own creator-facing meaning.

### 4. Product Expression

Product Expression owns how the world and the language become experience.

It answers:

`How should this truth feel to a creator?`

Product Expression does not own canonical truth.
It does not own execution.
It does not own language semantics.

It owns:

- hierarchy
- emphasis
- emergence
- guidance
- creator comprehension

## Canonical Responsibility Split

## Create World Owns

Create World should own the shared authoring substrate for all creation modes.

Its responsibilities are:

- world-level canvas substrate
- world-level navigation model
- world-level viewport home/focus model
- world-level minimap
- world-level camera controls
- world-level infinite-space behavior
- world-level selection surface integration
- world memory
- first-work / worked-world distinction
- artifact-neutral world geography
- shared authoring-shell composition for create flows

Create World may express:

- calm empty space
- home position
- focus position
- world return behavior
- shared world utility surfaces

Create World must not own:

- discipline vocabulary
- scenario semantics
- artifact interpretation such as `Frame -> Page`
- domain-specific milestones
- domain-specific product tutoring

## Creative Language Owns

Creative Language should own the meaning projected into the shared world.

Its responsibilities are:

- discipline vocabulary
- concept hierarchy
- artifact interpretation
- semantic labels
- scenario definitions
- context-sensitive creation naming
- creator-facing structural grammar
- semantic progression
- discipline-specific guidance about what comes next

Examples:

- `Frame` experienced as `Page`
- `Container` experienced as `Section`
- `Landing Page` as a meaningful start point in Digital Product Design

Creative Language must not own:

- canvas transforms
- minimap behavior
- viewport mutation
- selection mutation
- runtime event authority
- shell routing as a permanent world fork

## Runtime Owns

Runtime should continue to own every canonical state transition.

Its responsibilities are:

- dispatcher authority
- event legality
- event application
- replay
- canonical document truth
- canonical workspace truth
- viewport state
- selection state
- scene graph truth
- world history truth
- create / update / delete authority
- installation and runtime execution

Runtime may project read models.

Runtime must not own:

- creative-domain language
- creator-facing explanations
- milestone framing
- product tutoring

## Product Expression Owns

Product Expression should own how world and language are revealed to creators.

Its responsibilities are:

- empty-world messaging
- visual hierarchy
- progressive disclosure
- emergence timing
- guidance surfaces
- creator-first sequencing
- language-first onboarding
- confidence-reducing copy
- capability timing
- expression evidence

Product Expression must answer:

- what should be seen first
- what should remain quiet
- what should emerge next
- what the creator should understand right now

Product Expression must not own:

- runtime truth
- event mutation
- language contract truth
- canvas substrate truth

## Concrete Mapping

### Canvas

Owner:

`Create World`

Reason:

The canvas is the shared spatial world substrate.
It should not be owned by a single creative language.

### Navigation

Owner:

`Create World`

Runtime enforces lawful state transitions.

Reason:

Pan, zoom, home, focus, and camera movement are world behaviors.
They are not language semantics.

### Viewport State

Owner:

`Runtime`

Reason:

Viewport position and scale are canonical workspace truth.
They must remain reducer-owned and replay-safe.

### Minimap

Owner:

`Create World`

Runtime supplies source truth.

Reason:

Minimap is a world-comprehension surface.
It should not be reimplemented separately by each language.

### Selection

Owner:

`Runtime`

Create World may present selection surfaces.

Reason:

Selection is canonical interaction truth.
Languages may interpret the selected artifact, but they do not own selection state.

### Artifact Interpretation

Owner:

`Creative Language`

Reason:

The meaning of an artifact is discipline-specific.
The same underlying artifact substrate may be interpreted differently across languages.

### Empty World Guidance

Owner:

`Product Expression`

Backed by:

- `Create World` for world substrate
- `Creative Language` for semantic meaning

Reason:

The empty world must communicate both place and purpose.
That communication is an expression concern, not a runtime concern.

## What Create World Should Not Own

To prevent a new duplicated authority layer, Create World must not become:

- a planner
- a runtime
- a compiler
- a language dictionary
- a product-specific design system
- a template registry

Create World is narrower than all of those.

It owns only the shared creative world substrate for authoring.

## What UIUX Should Eventually Stop Owning

If `uiux` is to become a pure Creative Language projection over Create World,
it should eventually stop owning:

- a dedicated world shell branch
- `uiux`-specific project-home substrate rules
- `uiux`-specific first-artifact world geography
- `uiux`-specific minimap ownership
- `uiux`-specific world navigation semantics

It should retain:

- Digital Product Design vocabulary
- Application / Page / Section / Component semantics
- scenario language
- artifact interpretation
- language-shaped rails
- language-shaped inspector guidance
- language-shaped empty-world expression

## Canonical Rule

The world should answer:

`Where am I creating?`

The language should answer:

`What am I creating here?`

Runtime should answer:

`What is true?`

Product Expression should answer:

`How should that truth feel?`

## Recommended Next Architectural Direction

The next architectural move should not be to create more language-specific
world shells.

It should be to define and stabilize a shared `Create World` owner that
absorbs:

- world substrate
- navigation substrate
- camera/minimap substrate
- world memory substrate
- artifact-neutral geography

Then each creative mode should project only:

- its language
- its artifact interpretation
- its creator guidance

That is the path to:

`One Create World`

`-> Many Creative Languages`
