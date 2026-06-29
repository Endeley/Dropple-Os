# Create World Activation Ownership Model

## Purpose

This document freezes activation ownership.

It does not audit.
It does not extract code.
It does not rename existing files.

It answers one question:

`Which activation truths belong to Create World Shell, which belong to Product Expression, and which must be declared by each Creative Language?`

This document exists because the audit evidence has stabilized.

The following are now responsibility-verified:

- Create World Shell exists
- Shell Activation exists
- Product Expression exists
- Creative Language exists

The remaining issue identified across the audits was:

`activation source ownership`

This model resolves that ownership explicitly.

## Governing Rule

`Create World Shell activates surfaces.`

`Creative Languages populate surfaces.`

`Product Expression presents surfaces.`

This is the canonical activation law for Create World.

## 1. Create World Shell

Create World Shell is inherited by every creative language.

It owns activation truths that survive the disappearance test:

If UIUX disappeared tomorrow and Graphic became active, these truths would still need to exist.

Therefore they are not UIUX truths.

### Create World Shell Owns

- shared authoring tools
  - `select`
  - `move`
  - `resize`
- shared shell surfaces
  - inspector emergence
  - panel emergence
  - dock surfaces
  - overlay surfaces
- canvas policy primitives
  - `allowPan`
  - `allowZoom`
  - `origin`
  - world interaction rules
- empty-world visibility surface
- projection slots
- shared shell-facing activation surfaces consumed by:
  - canvas substrate
  - panel substrate
  - shell emergence

### Create World Shell Does Not Own

- language meanings
- language vocabulary
- scenario semantics
- starter semantics
- momentum
- projection content

### Inheritance Rule

A creative language should never need to redefine Create World Shell truths.

If Graphic, Motion, System, Collaboration, or future languages appear, they inherit these truths automatically.

## 2. Product Expression

Product Expression owns how activated shell surfaces are presented to creators.

It owns appearance and framing.
It does not own meaning.

### Product Expression Owns

- presentation framing
- surface styling
- dock presentation
- empty-world experience pattern
- language-neutral creator-guidance patterns
- shell presentation rhythm
- emphasis and hierarchy of surfaced information

### Product Expression Decides

- how a shell surface appears
- how guidance is framed
- how the creator is invited into a surface

### Product Expression Does Not Decide

- what a language means
- which creative concepts exist
- which starter semantics a language defines

In short:

Product Expression decides:

`how something appears`

not:

`what it means`

## 3. Creative Language

Creative Language owns the semantic declarations that populate shared shell surfaces.

It supplies meaning.
It does not create the shell.

### Creative Language Must Declare

- language-specific tools
- language-specific panels
- projection content
- starter semantics
- meaning
- momentum
- evolution paths
- creative vocabulary

### Examples

UIUX:

- `Page`
- `Application`
- `Landing Page`
- `Dashboard`
- `Login`
- `Settings`

Graphic:

- `Artboard`
- `Poster`
- `Brand Asset`
- `Illustration`
- `Social Graphic`

Motion:

- `Sequence`
- `Shot`
- `Camera`
- `Animation`

### Creative Language Does Not Own

- shared canvas policy primitives
- shell emergence
- selection substrate
- dock surfaces
- generic activation surfaces

The shell should not know language concepts.
The language should not redefine shell concepts.

## 4. Activation Ownership

Activation ownership must follow the same separation.

### Create World Shell Activates

- shared surfaces
- shared shell-facing tool availability
- shared panel slots
- shell emergence surfaces
- empty-world visibility surface
- canvas primitives required for all languages

### Creative Language Populates

- language-specific tools
- language-specific panels
- semantic projections
- scenario systems
- meaning
- momentum
- starter choices

### Product Expression Presents

- styling of activated surfaces
- framing of activated surfaces
- guidance patterns
- empty-world presentation pattern
- dock and panel presentation

## 5. Activation Truth Classification

| Activation Truth | Owner |
|---|---|
| Shared authoring tools | Create World Shell |
| Language-specific tools | Creative Language |
| Shared shell surfaces | Create World Shell |
| Shared inspector/panel emergence | Create World Shell |
| Panel framing and presentation | Product Expression |
| Shared canvas policy primitives | Create World Shell |
| Canvas surface styling | Product Expression or Creative Language, depending on whether the choice is purely visual or semantically meaningful |
| Empty-world visibility | Create World Shell |
| Empty-world experience pattern | Product Expression |
| Empty-world meaning and starter semantics | Creative Language |
| Projection slot availability | Create World Shell |
| Projection framing | Product Expression |
| Projection content | Creative Language |

## 6. Current State

Current repository evidence indicates:

`uiuxWorkspace.js`

currently mixes:

- UIUX Language Contract
- Shell Activation Contract

This is not a missing architecture problem.
It is a source-ownership mixture.

### Current State

`uiuxWorkspace.js`

=

`Language Contract`

+

`Activation Contract`

### Target State

`UIUX Language Contract`

`-> Create World Activation`

`-> Shell Surfaces`

This means future work is not:

`invent activation`

It is:

`separate language declarations from activation declarations`

## 7. Non-Goals

This model does not:

- define implementation files
- require a new runtime subsystem
- require route changes
- require shell rewrites
- require immediate extraction

It only freezes ownership.

## 8. Implication for Graphic

Graphic should not need to answer:

`Where does Graphic live?`

That question is already substantially answered.

Graphic should answer:

- what language-specific tools it contributes
- what language-specific panels it contributes
- what starter semantics it contributes
- what meanings it projects
- what creative vocabulary it declares

That is the correct inheritance posture.

## 9. Conclusion

Create World Shell owns inherited activation surfaces.

Product Expression owns presentation of those surfaces.

Creative Languages own the semantic declarations that populate those surfaces.

This is the canonical Create World activation ownership boundary.

From this point forward, the correct question for a new language is not:

`Where does it live?`

It is:

`Which activation truths does it inherit, and which must it declare for itself?`
