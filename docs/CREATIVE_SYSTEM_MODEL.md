# Creative System Model

## Purpose

This document freezes Dropple's product-level understanding of creative work.

It answers:

`What is the canonical shape of creation before any individual Creative Language expresses it?`

This model exists to prevent Dropple from drifting back toward:

- isolated outputs
- tool-first editing
- artifact-first thinking
- setup-heavy workflows

It defines the common creative structure that should govern UIUX, Graphic,
Motion, and future languages.

## Status

Current lifecycle:

`Proposed -> Frozen candidate`

This document should be treated as product-foundation truth unless later
evidence proves parts of it wrong.

In practical terms:

- treat this as a guiding design principle
- do not reinvent this model casually
- require evidence before changing its core claims

## Relationship to Existing Models

This document sits above several existing product and architecture documents.

It does not replace them.
It gives them a common conceptual source.

Relevant downstream models:

- [CREATIVE_DOMAIN_MODEL.md](./CREATIVE_DOMAIN_MODEL.md)
- [CREATE_WORLD_MODEL.md](./CREATE_WORLD_MODEL.md)
- [PRODUCT_EXPRESSION_PRINCIPLES.md](./PRODUCT_EXPRESSION_PRINCIPLES.md)
- [CREATIVE_BLUEPRINT_MODEL.md](./CREATIVE_BLUEPRINT_MODEL.md)
- [ARTIFACT_MODEL.md](./ARTIFACT_MODEL.md)

Those documents answer:

- what discipline is active
- what the shared world owns
- how truth becomes experience
- how semantic proposals are formed
- how structural truth is compiled

This document answers the layer above them:

`What is the stable shape of creative work itself?`

## Core Claim

Creative work is not a collection of isolated artifacts.

It is a system of intent expressed through related compositions.

Or, in creator-facing language:

`Outputs are artifacts. Composition is the system that gives them meaning.`

This is the product principle that should influence:

- language design
- create flows
- guidance systems
- capability projection
- future AI assistance
- architectural boundaries between world, language, and runtime

## Internal Creative Philosophy

Dropple should understand creative work internally through this model:

`Intent`

`-> Composition`

`-> Artifacts`

`-> Elements`

### 1. Intent

Intent is why the creator is creating.

Examples:

- launch a product
- promote an event
- build a brand
- tell a story
- explain a system

Intent is the invisible origin of the work.

It should usually remain implicit in the product experience.
It exists to power:

- guidance
- naming
- inheritance
- semantic suggestions
- next-step relevance

Intent should not become a mandatory setup ceremony.

### 2. Composition

Composition is the first structured expression of intent.

It is the first meaningful owner in the creative system.
It is the first structured owner in creative work.

Composition answers:

`What coherent system is being created here?`

Examples:

- an Application
- a visual Composition
- a Film
- a Document

Composition is not just grouping.
It owns:

- cross-artifact meaning
- inheritance
- relationships
- variants
- semantic coherence across outputs

### 3. Artifacts

Artifacts are bounded outputs inside a composition.

Examples:

- Page
- Artboard
- Shot
- Screen
- Poster

Artifacts are where work becomes concrete, exportable, and directly editable.

They are important.
They are not the highest concept.

### 4. Elements

Elements are the local building blocks inside artifacts.

Examples:

- Component
- Object
- Scene item
- Text block
- Image
- Shape

Elements should be experienced in service of the artifact and composition,
not as isolated low-level objects.

## User-Facing Model

Intent should remain mostly invisible.

Creators should experience the system through the language of the active
discipline, not through abstract architecture.

### UIUX

`Application`

`-> Pages`

`-> Components`

### Graphic

`Composition`

`-> Artboards`

`-> Objects`

### Motion

`Film`

`-> Sequences`

`-> Shots`

`-> Scenes`

## Internal vs User-Facing Rule

Dropple should preserve a split between:

- internal creative understanding
- creator-facing creative language

Internal understanding:

`Intent -> Composition -> Artifacts -> Elements`

Creator-facing understanding:

- UIUX: `Application -> Pages -> Components`
- Graphic: `Composition -> Artboards -> Objects`
- Motion: `Film -> Sequences -> Shots -> Scenes`

This allows Dropple to stay structurally consistent while still feeling
native to each discipline.

## Language Rule

Each Creative Language should have its own vocabulary.

But every language should preserve the same deeper structural pattern:

`system owner -> bounded artifacts -> local building blocks`

This lets Dropple feel native to different disciplines without fragmenting its
product philosophy.

## Create World Principle

This remains constitutional:

`Create World owns the world. Languages give that world meaning.`

That means Create World should not own discipline-specific artifact semantics.

Create World should not know:

- what a Page is
- what an Artboard is
- what a Shot is

Create World should know:

- world navigation
- world geography
- world selection surfaces
- activation
- projection slots
- empty-world and worked-world behaviors

Creative Languages own the interpretation projected into that shared world.

## Living Artifacts Principle

Dropple is not trying to invent a better rectangle.

It is trying to make artifacts alive.

A living artifact understands the larger system it belongs to.

Examples:

- a Page belongs to an Application
- an Artboard belongs to a Composition
- a Shot belongs to a Sequence

This allows Dropple to guide based on meaning, not just geometry.

The product should help the creator feel:

`This artifact understands its role in the larger work.`

not:

`This is just an editable surface.`

## Progressive Revelation Principle

Dropple should infer more than it asks.

The creator should not be forced through a large setup form for:

- audience
- tone
- message
- brand
- outputs
- goals

The desired progression is:

`The creator creates`

`-> the system observes`

`-> the system understands`

`-> the system guides`

This keeps the experience fluent while still allowing deep semantic support.

## Creator-Experience Rule

Every feature should introduce meaning before tools.

Before exposing editing mechanics, Dropple should help the creator understand:

- what they are making
- what system it belongs to
- what artifact they are shaping
- what the next meaningful thought is

If a feature begins with tool vocabulary instead of creative meaning, it is
probably regressing toward traditional editor behavior.

## Decision Rule

When evaluating a new feature, ask these questions in order:

1. What is the creator's intent?
2. What composition or system are they building?
3. What artifact are they working on?
4. What elements are they manipulating?
5. What is the next meaningful thought, not just the next tool?

This order should constrain:

- UX flows
- onboarding
- rails and inspectors
- template systems
- AI prompts
- guidance surfaces

## Product Expression Implications

This model implies several product rules:

- start from system meaning, not artifact emptiness
- reveal artifact identity through behavior, not naming alone
- preserve relationships between related artifacts
- let semantic understanding emerge from work in progress
- keep intent mostly invisible while allowing it to shape guidance

In practice, this means:

- creators should begin a meaningful composition, not a dead rectangle
- artboards/pages/shots should inherit context from their parent system
- assistance should feel timely and contextual rather than questionnaire-based

## Example Mappings

### UIUX

Internal:

`Intent -> Application -> Pages -> Components`

Creator-facing:

`Application -> Pages -> Components`

### Graphic

Internal:

`Intent -> Composition -> Artboards -> Objects`

Creator-facing:

`Composition -> Artboards -> Objects`

### Motion

Internal:

`Intent -> Film -> Sequences/Shots -> Scenes`

Creator-facing:

`Film -> Sequences -> Shots -> Scenes`

## Architectural Implications

This model should inform downstream systems without collapsing ownership.

### Create World

Owns shared world substrate.

### Creative Language

Owns discipline vocabulary and system meaning.

### Product Expression

Owns how meaning is revealed progressively to creators.

### Creative Blueprint

Should capture semantic proposals in terms that preserve intent and composition
context before structural planning.

### Artifact Model

Should preserve artifact relationships as expressions of a higher composition,
not as disconnected roots.

## Frozen Principles

The following should be treated as frozen unless evidence proves otherwise:

- creative work is a system, not a pile of outputs
- intent is the invisible origin of creative work
- composition is the first structured owner
- artifacts are bounded outputs, not the highest concept
- elements exist in service of artifacts and composition
- Create World owns substrate, not discipline meaning
- Creative Languages own vocabulary, semantics, and progression
- Dropple should infer more than it asks
- living artifacts are a product differentiator
- product experience should begin with meaning before tools

## Next Use

This document should become the reference layer above:

- UIUX language projections
- Graphic language projections
- Motion language design
- template semantics
- AI generation prompts
- create-flow design
- onboarding and guidance systems

Future creative-language documents should be evaluated against this model
before they are treated as design truth.
