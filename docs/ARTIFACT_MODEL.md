# Artifact Model

## Purpose

This document defines the missing structural layer between Creative Blueprint
and Runtime Blueprint in Dropple.

It answers:

`What is the first authoritative structural representation of creative work after semantic planning and before runtime compilation?`

The Artifact Model exists because Creative Blueprint and Runtime Blueprint own
different kinds of truth.

Creative Blueprint owns:

- semantic specification
- scenario
- purpose
- structure intent
- relationships

Runtime Blueprint owns:

- installable runtime representation
- certified bootstrap package shape
- lineage-bearing executable package inputs

The Artifact Model owns neither semantic intent nor runtime execution.
It owns structural truth.

## Core Claim

The Artifact Model is the first authoritative structural representation of
creative work.

It is:

- more concrete than Creative Blueprint
- less runtime-shaped than `BlueprintV1`
- deterministic
- structurally complete
- independent of runtime execution state

It is not:

- a semantic proposal
- a scene graph
- a runtime node graph
- an event stream
- an installable blueprint package

## Lifecycle Position

Constitutional owner:

`Artifact Model System`

Current lifecycle:

`Verified`

Target lifecycle:

`Verified -> Frozen`

This document now describes repository-backed structural truth.
Planner, compiler, and installer seams exist in code and have deterministic
verification coverage.

## Why This Layer Exists

Without an Artifact Model, Dropple risks collapsing two different
responsibilities into one translation:

`Creative Blueprint -> runtime-shaped output`

That would cause:

- planning and compilation to blur together
- runtime vocabulary to leak upward
- structure to become whatever the builder happens to emit
- duplicate planning logic to appear downstream

The Artifact Model prevents that by freezing one intermediate truth:

`semantic truth has already been planned into structural truth`

After that point, downstream layers may translate but must not reinterpret.

## Relationship to Neighboring Layers

### Upstream: Creative Blueprint

Creative Blueprint remains semantic truth.

It defines:

- what the creator is trying to make
- why it exists
- what structural parts are intended
- how those parts conceptually relate

It does not define structural authority yet.

The Artifact Planner converts Creative Blueprint into Artifact Model.

### Downstream: Runtime Blueprint

The repository already defines a runtime-facing install contract in
[core/contracts/blueprint.v1.ts](/Users/endeleykonboye/Desktop/dropple-os/dropple/core/contracts/blueprint.v1.ts:12).

That contract contains runtime package truth such as:

- `seedGraph`
- `seedEvents`
- `certification`
- `lineage`

The Artifact Model should compile into Runtime Blueprint.
It should not bypass Runtime Blueprint and speak directly to runtime.

## Ownership

### The Artifact Model Owns

The Artifact Model owns structural truth, including:

- authoritative artifact hierarchy
- containment relationships
- ordering relationships
- composition structure
- structural roles after planning
- artifact identity within the planned structure
- artifact-level references that are still structural rather than runtime

### The Artifact Model Does Not Own

The Artifact Model does not own:

- scenario precedence
- semantic identity definitions
- semantic momentum
- runtime node ids
- runtime transforms
- runtime motion clips
- event payloads
- dispatcher truth
- install certification
- lineage records

## Structural Truth

Structural truth means:

`what exists structurally once semantic intent has been planned`

This is different from semantic truth and different from runtime truth.

Examples:

Semantic truth:

- this is a Landing Page
- it needs a Hero and Features region

Structural truth:

- the Page contains Hero
- Hero contains Heading, Subheading, and CTA
- Features follows Hero
- Footer closes the page structure

Runtime truth:

- authoritative nodes exist
- positions, events, and motion execute

## Planner Responsibility

The Artifact Planner's real responsibility is not:

`Blueprint -> flat artifacts`

Its correct responsibility is:

`Creative Blueprint -> structural truth`

That means the planner must decide:

- which conceptual relationships become hierarchy
- which become ordering
- which become references
- which remain advisory and do not become structural authority

This is the most important correction from the current audit.

In the current implementation, every planned artifact is attached directly to
the root at
[planUIUXArtifactModel.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/domain/creativeBlueprint/planUIUXArtifactModel.js:49).
That expresses membership, not structure.

The Artifact Model must be strong enough that downstream layers do not need to
plan again.

## Builder Responsibility

The Artifact Builder should consume Artifact Model.
It should not decide structural truth.

Its role is translation, not planning.

That means:

- hierarchy must already be authoritative before the builder runs
- structural ordering must already be authoritative before the builder runs
- builder code must not reinterpret semantic relationships to invent structure

This is especially important because the current builder already translates
artifact types directly into runtime node types at
[buildUIUXArtifactGraph.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/domain/creativeBlueprint/buildUIUXArtifactGraph.js:4).

That is a useful temporary seam, but it is not the long-term definition of
Artifact Model.

## Translation Chain

The full lawful chain should be:

`Creative Intent`

`-> Creative Scenario`

`-> Creative Blueprint`

`-> Artifact Planner`

`-> Artifact Model`

`-> Runtime Blueprint Compiler`

`-> Runtime Blueprint (BlueprintV1)`

`-> Runtime Builder`

`-> Runtime`

`-> Projection`

This clarifies two different downstream translators:

### Runtime Blueprint Compiler

Responsibility:

`Artifact Model -> Runtime Blueprint`

This is where structural truth becomes installable runtime package truth.

### Runtime Builder

Responsibility:

`Runtime Blueprint -> Runtime`

This is where runtime package truth becomes executable runtime state.

## Structural Relationships

The Artifact Model should make explicit which relationships become
authoritative.

At minimum, the model should distinguish between:

- containment
- hierarchy
- ordering
- composition
- references

### Containment

Answers:

`What lives inside what?`

This becomes authoritative structural truth.

### Hierarchy

Answers:

`What is structurally above or below what?`

This becomes authoritative structural truth.

### Ordering

Answers:

`What comes before, after, or alongside what within a structure?`

This becomes authoritative structural truth.

### Composition

Answers:

`What collection of structural parts forms a larger artifact?`

This becomes authoritative structural truth.

### References

Answers:

`What points to what without implying containment?`

This may become structural truth, but it must remain distinct from containment.

## What Stops Here

The Artifact Model is the last layer that should still be runtime-independent.

Therefore the following information must stop here and not be confused with
runtime truth:

- structural roles
- containment decisions
- ordering decisions
- composition decisions

The following information must not appear yet:

- runtime node ids
- authoritative layout coordinates
- event records
- timeline clips
- runtime selection state

## Guarantees

The Artifact Model should satisfy these guarantees.

### Deterministic

Equivalent Creative Blueprints must plan to equivalent Artifact Models.

### Structurally Complete

The model must express enough structure that downstream compilation does not
need to plan again.

### Runtime Independent

The model must not require runtime state in order to be valid.

### Planner Complete

Once Artifact Model exists, the planner's job is done.
No downstream layer should need to reinterpret semantics to recover missing
structure.

### Builder Independent

The Artifact Builder should be able to consume Artifact Model without becoming a
second planner.

## Current Audit Implications

The current implementation exposes the exact gap this document addresses.

### Current Planner Gap

The current planner emits:

- one root
- a flat artifact list
- root membership only

That was lawful as an early seam.
The current repository now verifies the seam as structural truth for the active
creative compilation path, even though the model may broaden as more creative
domains arrive.

### Current Builder Gap

The current builder maps artifact types directly to runtime node types in
[buildUIUXArtifactGraph.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/domain/creativeBlueprint/buildUIUXArtifactGraph.js:4).

That means runtime vocabulary is already influencing a layer that should still
be structurally defined.

### Current Relationship Gap

`relationships` are validated and preserved but not planned into authoritative
structure.

That means the planner is preserving semantic information, not yet converting it
into structural truth.

## Example: Landing Page

Creative Blueprint may say:

- scenario: Landing Page
- structure: hero, features, pricing, faq, footer

Artifact Model should be able to say more than:

- Page contains Hero
- Page contains Features
- Page contains Pricing
- Page contains FAQ
- Page contains Footer

It should eventually be capable of saying:

- Application contains Page
- Page contains Hero, Features, Pricing, FAQ, Footer
- Hero contains Heading, Supporting Copy, Primary CTA
- Features is ordered after Hero
- Footer closes the composition

That is structural truth.
It is not yet runtime truth.

## Design Questions This Model Must Freeze

The next implementation should be guided by four explicit questions.

### 1. What structure does Artifact Model own beyond root + children?

This is the first thing that must be made explicit.

### 2. Are `relationships` authoritative or advisory?

The planner must decide which relationship kinds affect structural truth and
which do not.

### 3. Which fields are artifact truth versus runtime translation hints?

Artifact truth belongs here.
Runtime translation hints may exist, but they must not replace structural
authority.

### 4. Where does Runtime Blueprint compilation begin?

The answer should now be:

`After Artifact Model is complete.`

Not before.

## Non-Goals

This document does not define:

- planner implementation
- compiler implementation
- runtime builder implementation
- scene graph schemas
- runtime node schemas
- event construction
- certification formats

Those should derive from this model later.

## Summary

The Artifact Model is Structural Truth.

It is the first authoritative representation of creative work after semantic
planning and before runtime compilation.

Recognizing that boundary prevents Dropple from freezing the wrong seam:

- Creative Blueprint remains semantic truth
- Artifact Model becomes structural truth
- Runtime Blueprint remains installable runtime truth
- Runtime remains executable truth

That is the next lawful layer to freeze before deeper implementation continues.
