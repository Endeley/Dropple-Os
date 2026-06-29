# Graphic Composition Model

## Purpose

This document defines what a `Composition` is in Dropple Graphic.

It does not define implementation.
It does not define toolbar layout.
It does not define canvas mechanics.

Its purpose is to answer:

`What is the thing the Graphic creator is actually building?`

This document exists because Graphic should not be defined by:

- artboards first
- tools first
- geometry first
- isolated outputs first

Graphic should instead be defined by the system that gives those outputs meaning.

That system is:

`Composition`

## Core Claim

People do not create graphics for their own sake.

They create to communicate visually.

Graphic is therefore not fundamentally about helping people draw.
Graphic is about helping people communicate visually.

`Composition` is the first creative system Dropple introduces to make that communication possible.

## Relationship to Existing Models

This document sits between:

- [GRAPHIC_CREATIVE_JOURNEY.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/GRAPHIC_CREATIVE_JOURNEY.md)
- [GRAPHIC_LANGUAGE_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/GRAPHIC_LANGUAGE_MODEL.md)
- [GRAPHIC_LANGUAGE_DICTIONARY.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/GRAPHIC_LANGUAGE_DICTIONARY.md)
- [GRAPHIC_PROJECTION_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/GRAPHIC_PROJECTION_MODEL.md)
- [CREATIVE_SYSTEM_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_SYSTEM_MODEL.md)

Those documents establish:

- the creator's first thought
- the Graphic language
- the Graphic dictionary
- how Graphic concepts project
- the cross-language creative system

This document answers the missing question:

`What is a Composition, creatively, inside Graphic?`

## 1. What a Composition Is

A `Composition` is the first structured owner of visual communication work in Graphic.

It is not:

- a folder
- a page list
- an asset bin
- an artboard collection
- a canvas alias

A Composition is the creative system that holds:

- purpose
- message
- direction
- relationships
- consistency
- evolution across related outputs

In short:

`Composition is the system that gives Graphic artifacts meaning.`

## 2. Why a Composition Exists

A Composition exists because visual communication work is rarely a single isolated output.

Creators are often actually building:

- a campaign
- a brand
- a presentation
- a social media launch
- a product announcement
- an invitation system
- a promotional set

Each of those may contain multiple outputs.

The Composition exists to give those outputs:

- coherence
- relationship
- shared direction
- shared identity
- shared reusable structure

Without Composition, Dropple would collapse back into isolated graphics.

## 3. Composition Before Artboard

This is the governing Graphic rule:

`Composition is the owner.`

`Artboards are bounded expressions inside a Composition.`

That means the mental model is not:

`Canvas -> Artboard -> Objects`

It is:

`Communication -> Composition -> Artboards -> Objects`

Artboards matter.
They are not the center of the Graphic system.

Composition is.

## 4. What Belongs to a Composition

A Composition should own the truths that apply across one or more visual outputs.

### Composition Owns

- communication purpose
- visual direction
- message coherence
- brand direction
- audience relevance
- relationships between outputs
- variants and families
- reusable assets
- reusable style decisions
- reusable typography decisions
- reusable color decisions
- cross-artboard structure
- cross-artboard consistency
- campaign-level or system-level meaning

### Composition May Contain

- one poster
- ten posters
- multiple social graphics
- a brand board
- logo explorations
- reference material
- moodboards
- reusable assets
- presentation covers
- supporting layouts

The key rule is:

If multiple outputs still belong to one communication system, they belong to one Composition.

## 5. What Belongs to an Artboard Instead

An Artboard is not the owner of the larger communication system.

An Artboard owns one bounded expression inside that system.

### Artboard Owns

- one concrete output surface
- one publishable or reviewable piece
- one specific layout
- one specific spatial arrangement
- one format-specific manifestation

Examples:

- one poster variation
- one Instagram post
- one logo presentation sheet
- one presentation cover
- one flyer layout

### Artboard Does Not Own

- the whole campaign
- the whole brand system
- the whole communication direction
- the entire asset family
- cross-output consistency as a system truth

Those belong to the Composition.

## 6. Multiple Artboards

Multiple Artboards should not feel like unrelated surfaces.

They should feel like bounded expressions inside one living communication system.

### Multiple Artboards May Represent

- different sizes of the same campaign asset
- variations of one concept
- multiple communication moments in one launch
- alternative covers in one presentation system
- brand applications inside one identity system

### Relationship Rule

Artboards inside one Composition should be related by:

- purpose
- style
- message
- hierarchy
- color language
- typography system
- asset reuse

If those relationships do not matter, the work may belong in separate Compositions.

## 7. Composition as a Living System

A Composition should feel alive, not archival.

That means it should not feel like:

- a static folder of unrelated files
- a dead list of canvases
- a storage container

It should feel like:

- a living communication system
- a coherent visual direction
- a place where outputs inherit meaning from one another

### A Living Composition Understands

- what it is trying to communicate
- which outputs belong together
- which assets are shared
- which visual decisions should remain consistent
- how one artifact relates to another

This is the Graphic expression of Dropple's broader `Living Artifacts` principle.

## 8. Examples of Compositions

### Campaign Composition

A marketing system for launching a product.

May contain:

- poster
- social graphics
- presentation cover
- announcement visuals

### Brand Composition

A visual identity system.

May contain:

- brand board
- logo sheets
- color direction
- type direction
- reusable assets

### Presentation Composition

A communication system for presenting an idea.

May contain:

- presentation cover
- section visuals
- reusable headers
- supporting diagrams or visuals

### Social Launch Composition

A set of related graphics for one release or message.

May contain:

- primary post
- variants
- story format
- teaser visual

## 9. Composition-Level Questions

Graphic should help the creator answer questions such as:

- What am I trying to communicate?
- What outputs belong to this system?
- What visual direction unifies them?
- What should stay consistent across them?
- What should vary?
- What is the next meaningful artifact inside this Composition?

Those are Composition questions.

They are more important at the beginning than:

- what tool is active
- what geometry exists
- what inspector property is editable

## 10. Product Implications

If Composition is understood correctly, several product decisions become clearer.

### Empty World

Graphic should begin by helping the creator enter a communication system, not a dead surface.

### Starter Directions

Starter choices should imply possible Compositions, not just isolated outputs.

Examples:

- Poster
- Brand Board
- Social Graphic
- Presentation Cover

These are not just templates.
They are likely first bounded expressions of a larger Composition.

### First Artboard

The first Artboard should feel like:

- a bounded expression inside a living Composition

not:

- a lonely rectangle on an infinite canvas

### Guidance

Guidance should help creators think:

- composition-wide
- communication-first
- system-aware

before surfacing detailed formatting and object editing.

## 11. Non-Goals

This document does not:

- define toolbar layout
- define layer systems
- define UI panels
- define implementation architecture
- define runtime ownership

It defines the creative meaning of Composition only.

## 12. Conclusion

Graphic is not fundamentally about creating artboards.

Graphic is about building `Compositions` that express visual communication.

Artboards matter because they make that communication concrete.
Objects matter because they build those Artboards.

But the first true owner is:

`Composition`

That is the concept that should define Graphic more than any individual UI surface or feature.
