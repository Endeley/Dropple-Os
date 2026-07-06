# Creative Blueprint Model

## Purpose

The Creative Blueprint Model defines the product-semantic specification that
exists between resolved creative scenario and deterministic artifact planning in
Dropple.

It answers:

`What is the canonical proposal that producers generate before artifacts, runtime nodes, and execution truth exist?`

This model exists to prevent direct producer-to-runtime paths.

Without it, Dropple would drift toward:

- template -> runtime
- AI -> runtime
- wizard -> runtime
- marketplace asset -> runtime
- guided flow -> runtime

Each of those paths would duplicate planning logic and weaken constitutional
ownership.

With the Creative Blueprint Model:

- producers target one semantic specification
- the Artifact Planner consumes one specification
- runtime remains the owner of nodes, events, layout, motion, and execution
- existing blueprint lineage and certification infrastructure remains the owner
  of installable runtime blueprints

## Lifecycle Position

Constitutional owner:

`Creative Blueprint System`

Current lifecycle:

`Proposed`

Target lifecycle:

`Proposed -> Verified`

This document is design truth only.
It does not advance runtime behavior.
It defines the next lawful layer that implementation may later verify.

## Core Claim

Creative Blueprint is not the same thing as the repository's existing
installable `BlueprintV1`.

The repository already defines a runtime-facing blueprint contract in
[core/contracts/blueprint.v1.ts](/Users/endeleykonboye/Desktop/dropple-os/dropple/core/contracts/blueprint.v1.ts:12).
That contract includes:

- `seedGraph`
- `seedEvents`
- `workspaceProfiles`
- `capabilityProfiles`
- `certification`
- `lineage`

That is an installable, certified, runtime bootstrap package.

Creative Blueprint is an upstream semantic model.
It must eventually compile into existing installable blueprint or certified
template infrastructure.
It must not become a second competing install format.

## Relationship to Frozen Systems

The following systems are already Frozen and are not redefined here:

- Creative Domain Model
- UIUX Language Dictionary
- Semantic Projection
- Scenario Provision

Creative Blueprint sits below scenario resolution and above artifact planning.

It consumes:

- creative world
- resolved scenario
- declared purpose

It does not own:

- semantic identity
- semantic meaning
- semantic evolution
- semantic momentum
- scenario precedence
- runtime execution truth

## Constitutional Guarantees

### Runtime Truth Boundary

Runtime owns:

- events
- nodes
- layout
- motion
- execution

Therefore Creative Blueprints must never contain:

- runtime node ids
- runtime event ids
- event history
- authoritative coordinates
- selection state
- dispatcher metadata
- execution state

### Semantic Truth Boundary

The Semantic Dictionary owns:

- identity
- meaning
- evolution
- momentum

Creative Blueprints may reference semantic concepts such as scenario,
structural roles, and creative purpose.

Creative Blueprints must not redefine:

- what a Page is
- what a Section means
- what a scenario's momentum is
- what a selected artifact can become

### Scenario Truth Boundary

Scenario Provision owns:

- provider precedence
- authoritative scenario resolution

Creative Blueprints consume resolved scenario.
They do not infer or resolve scenario authority.

### Assistant Authority Boundary

Assistants may produce draft Creative Blueprints.
They do not establish truth.

Every assistant-produced Creative Blueprint remains a proposal until accepted by
the creator or another lawful product flow.

## What a Creative Blueprint Is

A Creative Blueprint is a producer-neutral semantic specification for a creative
outcome before artifact planning begins.

It is:

- higher-level than artifact graphs
- lower-level than abstract creative intent
- independent of runtime state
- stable across producer types
- precise enough for deterministic planning

It solves one product problem:

`Many producers need one lawful planning target before runtime artifacts exist.`

## What a Creative Blueprint Is Not

It is not:

- a runtime document
- an event stream
- a scene graph
- a certified installable blueprint package
- a template snapshot
- a semantic dictionary replacement
- a scenario resolver

Those all already belong elsewhere in the architecture.

## Ownership

### Producers

Expected lawful producers are:

- Templates
- AI-assisted proposals
- Marketplace assets
- Wizards
- Guided user flows

These producers should all target one Creative Blueprint model.

They may differ in origin and UX.
They must not differ in semantic target.

### Consumers

The first consumer is:

`Artifact Planner`

The Artifact Planner's responsibility is:

`Creative Blueprint -> Artifact Model`

That planner path is now implemented and repository-verified for the current
Create/UI creative domain.

Later consumers may include:

- preview systems
- critique systems
- cost estimation
- export planning
- certification tooling

But the initial consumer remains the Artifact Planner only.

## Scope

### Belongs Inside a Creative Blueprint

The model should include semantic specification fields such as:

- creative world
- resolved scenario
- declared purpose
- intended structure
- relationships between structural parts
- optional hierarchy, where hierarchy expresses design structure rather than
  runtime parenting
- optional constraints, where constraints express product intent rather than
  layout coordinates
- optional styling intent at a semantic level
- optional motion intent at a semantic level

These are lawful because they describe what should be created, not how runtime
already exists.

### Must Never Appear Inside a Creative Blueprint

The model must exclude:

- runtime ids
- node ids tied to runtime truth
- layout coordinates
- transform values
- event history
- dispatcher metadata
- selection state
- authoritative motion keyframes
- reducer state
- bridge state

### Field Evaluation

`scenario`

- belongs inside
- must be consumed as already resolved scenario truth

`purpose`

- belongs inside
- expresses why the creator is building this artifact set

`structure`

- belongs inside
- expresses the intended conceptual parts of the outcome

`relationships`

- belongs inside
- expresses conceptual adjacency, sequence, dependency, or grouping between
  structural parts

`hierarchy`

- may belong inside, but only as conceptual hierarchy
- must not silently become runtime parenting authority

`constraints`

- may belong inside if they remain design intent
- must not become encoded runtime layout coordinates

`styling`

- may belong only as styling intent
- must not become runtime property payloads at this layer

`motion intent`

- may belong only as temporal intent
- must not become timeline clips or keyframes at this layer

`runtime ids`

- forbidden

`layout coordinates`

- forbidden

`event history`

- forbidden

## Pipeline

The clean product pipeline is:

`Creative Intent`

`-> Creative Scenario`

`-> Creative Blueprint`

`-> Artifact Planner`

`-> Artifact Model`

`-> Artifact Builder`

`-> Runtime`

This is the correct separation of responsibilities with one clarification:

The repository's existing installable blueprint and template infrastructure sits
after deterministic build products exist, not before semantic planning begins.

So the larger repository pipeline should be understood as:

`Creative Intent`

`-> Creative Scenario`

`-> Creative Blueprint`

`-> Artifact Planner`

`-> Artifact Model`

`-> Artifact Builder`

`-> Runtime-facing blueprint/template package`

`-> Certification / lineage / bootstrap infrastructure`

`-> Runtime installation or environment activation`

That keeps product semantics upstream and governance infrastructure downstream.

## Validation Position

Creative Blueprints should have their own validation layer before Artifact
Planning.

This validation is not runtime validation.
It is semantic contract validation.

It should verify at least:

- required identity fields are present
- world is declared
- scenario is declared
- purpose is declared
- structural entries are valid and non-empty
- structural references are internally consistent
- relationship references point to declared structure
- forbidden runtime fields are absent
- the payload is deterministic enough for planner consumption

This validation layer should fail closed before artifact planning begins.

It should not validate:

- runtime node legality
- reducer behavior
- dispatcher behavior
- rendered UI projection

Those belong later in the pipeline.

## Integration with Existing Blueprint Infrastructure

This repository already has substantial blueprint governance infrastructure.
Creative Blueprint must integrate with it rather than duplicate it.

### 1. Installable Blueprint Contract

The repository's current blueprint authority is `BlueprintV1` in
[core/contracts/blueprint.v1.ts](/Users/endeleykonboye/Desktop/dropple-os/dropple/core/contracts/blueprint.v1.ts:12).

That contract is installable and runtime-oriented.
It includes certified lineage, `seedGraph`, and `seedEvents`.

Creative Blueprint does not replace `BlueprintV1`.
It becomes an upstream producer input from which a later lawful process may
derive:

- certified runtime blueprints
- certified templates
- other runtime-installable packages

### 2. Bootstrap Provenance

Blueprint bootstrap provenance already exists in Release Trust.
The bootstrap gate verifies deterministic manifest creation, persistence, replay
equivalence, and routable project perspective identity in
[scripts/releaseTrustReport.mjs](/Users/endeleykonboye/Desktop/dropple-os/dropple/scripts/releaseTrustReport.mjs:434)
and records the check in
[scripts/releaseTrustReport.mjs](/Users/endeleykonboye/Desktop/dropple-os/dropple/scripts/releaseTrustReport.mjs:712).

That governance system assumes a runtime-installable blueprint package already
exists.

Creative Blueprint should integrate by feeding the package-generation stage that
eventually produces those installable blueprints.
It should not attempt to become a new bootstrap event type.

### 3. Blueprint Lineage

Blueprint lineage already exists as a release artifact in
[scripts/blueprintLineageReport.mjs](/Users/endeleykonboye/Desktop/dropple-os/dropple/scripts/blueprintLineageReport.mjs:18).

That lineage records:

- blueprint identity
- version transition
- replay equivalence
- additive-only guarantees
- dispatcher-only guarantees
- upgrade certification requirements
- merge policy identity

Creative Blueprint should not introduce a second lineage graph for installed
runtime blueprints.

Instead, the lawful future is:

`Creative Blueprint -> compiled runtime package -> existing blueprint lineage`

### 4. Blueprint Ledger

Blueprint lineage ledger chaining already exists in
[scripts/blueprintLineageLedger.mjs](/Users/endeleykonboye/Desktop/dropple-os/dropple/scripts/blueprintLineageLedger.mjs:93).

That ledger records append-only lineage entries and verifies chain continuity.

Creative Blueprint should not create a parallel ledger.

If Creative Blueprint lineage is ever recorded, it should do so as an upstream
provenance input to the same governance story, not as a separate constitutional
authority.

### 5. Certified Template Lineage and Bootstrap

The repository also already has certified template lineage and environment
bootstrap infrastructure:

- template lineage graph in
  [domain/templates/TemplateSeedLineageGraph.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/domain/templates/TemplateSeedLineageGraph.js:167)
- environment descriptor derivation in
  [domain/templates/TemplateEnvironmentDescriptor.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/domain/templates/TemplateEnvironmentDescriptor.js:26)
- certified template descriptor build in
  [domain/templates/buildDescriptorFromCertifiedTemplate.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/domain/templates/buildDescriptorFromCertifiedTemplate.js:4)
- installation in
  [domain/templates/installCertifiedTemplate.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/domain/templates/installCertifiedTemplate.js:7)

This matters because Creative Blueprint's first lawful downstream targets may be
either:

- runtime `BlueprintV1` packages
- certified templates

The model should remain neutral between those targets.

That is exactly why Creative Blueprint must stay semantic and pre-runtime.

## Producer Model

### Template Producer

Templates should become pre-authored Creative Blueprint producers.

Templates are not the blueprint model itself.
They are one origin of blueprint proposals.

### AI Producer

AI should become a Creative Blueprint draft producer.

AI must not produce runtime truth directly.
Its lawful role is:

`Prompt -> intent draft -> Creative Blueprint proposal`

Only later does planning and build produce runtime-installable truth.

### Marketplace Producer

Marketplace assets should produce the same Creative Blueprint model.

Marketplace should not require a special planning path.

### Wizard / Guided Flow Producer

Wizards and onboarding flows should also emit the same Creative Blueprint model.

That preserves a single planning contract across interactive and non-interactive
entry points.

## Consumer Model

The first consumer is the Artifact Planner.

Its contract is intentionally narrow:

`Creative Blueprint -> Artifact Model`

The Artifact Planner should not own:

- scenario precedence
- semantic definitions
- runtime installation
- certification policy
- lineage policy

It consumes semantic truth and produces deterministic artifact planning output.

## Examples

These are conceptual examples only.
They are not schemas and not runtime payloads.

### Landing Page

World:

`Digital Product Design`

Scenario:

`Landing Page`

Purpose:

Present a product or service clearly and persuade action.

Structure:

- hero
- feature explanation
- social proof
- pricing or offer
- call to action
- footer

Relationships:

- hero leads to feature explanation
- proof supports offer
- offer leads to primary action

### Dashboard

World:

`Digital Product Design`

Scenario:

`Dashboard`

Purpose:

Summarize operational information and enable fast navigation.

Structure:

- navigation
- metrics overview
- data cards
- charts or tables
- activity region

Relationships:

- navigation frames the whole page
- metrics summarize the system
- detailed cards elaborate the summary

### Login

World:

`Digital Product Design`

Scenario:

`Login`

Purpose:

Authenticate a user with clarity and low friction.

Structure:

- identity region
- authentication form
- primary action
- recovery path

Relationships:

- identity supports trust
- form leads to primary action
- recovery path remains secondary but present

### Poster

World:

`Visual Communication`

Scenario:

`Poster`

Purpose:

Communicate one message with high visual emphasis.

Structure:

- focal headline
- supporting visual
- secondary information
- callout or signature

Relationships:

- headline dominates
- supporting visual reinforces message
- secondary information remains subordinate

## Non-Goals

This document does not define:

- runtime code
- reducers
- dispatcher behavior
- artifact builders
- installable blueprint schemas
- JSON schemas
- AI UX
- template marketplace policy
- new constitutional authorities

Those either already exist elsewhere or should derive from this model later.

## Immediate Implication

The correct next implementation direction is not:

- direct AI-to-runtime generation
- direct template-to-runtime generation
- direct wizard-to-runtime generation

The correct next direction is:

`Creative Blueprint validation and Artifact Planner integration`

That is the narrowest lawful next layer.

## Related Constitutional Clarifications

- [BLUEPRINT_TEMPLATE_CONSTITUTIONAL_CLARIFICATION.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/BLUEPRINT_TEMPLATE_CONSTITUTIONAL_CLARIFICATION.md:1)
  Explains the creator-facing and constitutional relationship between
  `Creative Blueprint`, `BlueprintV1`, and `Certified Template` systems already
  present in the repository.

## Summary

Creative Blueprint is the canonical semantic proposal model between resolved
creative scenario and deterministic artifact planning.

It is distinct from the repository's existing runtime-installable `BlueprintV1`.

Its job is not to replace existing blueprint governance.
Its job is to feed it lawfully.

That keeps Dropple's product semantics, runtime authority, and blueprint
governance aligned in one pipeline instead of creating a parallel system.
