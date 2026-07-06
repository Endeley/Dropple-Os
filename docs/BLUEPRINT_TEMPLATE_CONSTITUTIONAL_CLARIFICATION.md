# Blueprint / Template Constitutional Clarification

## Purpose

This document audits the constitutional relationship between Dropple's existing
Blueprint and Template systems.

It does not:

- change runtime contracts
- rename existing systems
- replace any current install path
- authorize implementation changes

It records repository truth, identifies ambiguity, and recommends whether
clarification should be adopted.

## Scope

This is a constitutional product audit.

It evaluates:

- `Creative Blueprint`
- `BlueprintV1`
- certified runtime blueprints
- certified templates
- template registry / install / activation
- workspace implications
- terminology consistency

---

## Repository Facts

### Fact 1 — `Creative Blueprint` is already constitutionally distinct from `BlueprintV1`

The repository already states that `Creative Blueprint` is not the same thing
as installable `BlueprintV1`.

Evidence:

- [CREATIVE_BLUEPRINT_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_BLUEPRINT_MODEL.md:52)
- [CREATIVE_BLUEPRINT_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_BLUEPRINT_MODEL.md:54)
- [CREATIVE_BLUEPRINT_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_BLUEPRINT_MODEL.md:70)

Repository truth:

- `Creative Blueprint` is an upstream semantic proposal model
- `BlueprintV1` is a runtime-facing installable contract

### Fact 2 — `BlueprintV1` already serves as the installable runtime bootstrap package

The `BlueprintV1` contract already includes runtime-facing installation fields
such as `seedGraph`, `seedEvents`, `workspaceProfiles`, `capabilityProfiles`,
`certification`, and `lineage`.

Evidence:

- [blueprint.v1.ts](/Users/endeleykonboye/Desktop/dropple-os/dropple/core/contracts/blueprint.v1.ts:12)
- [CREATIVE_BLUEPRINT_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_BLUEPRINT_MODEL.md:57)
- [CREATIVE_BLUEPRINT_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_BLUEPRINT_MODEL.md:68)

Repository truth:

- `BlueprintV1` already represents a certified runtime bootstrap package
- Blueprint installation already exists as a lawful runtime path

### Fact 3 — The blueprint path already installs into project/runtime truth

Blueprint installation is already implemented through catalog resolution,
project manifest creation, and `installBlueprint(...)`.

Evidence:

- [blueprintInstallBridge.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/bridges/blueprintInstallBridge.js:38)
- [blueprintInstallBridge.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/bridges/blueprintInstallBridge.js:101)
- [blueprintInstallBridge.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/bridges/blueprintInstallBridge.js:171)

Repository truth:

- blueprints already install as project/bootstrap packages
- composed blueprints are already supported

### Fact 4 — A certified-template runtime path already exists

The repository already contains a real certified-template system with:

- registry
- certification
- UI consumption
- installation
- activation
- runtime hydration

Evidence:

- [useCertifiedTemplates.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/registry/useCertifiedTemplates.js:4)
- [CertifiedTemplatesPanel.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/ux/panels/CertifiedTemplatesPanel.jsx:7)
- [.registry/certifiedTemplates.json](/Users/endeleykonboye/Desktop/dropple-os/dropple/.registry/certifiedTemplates.json:2)
- [installCertifiedTemplate.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/domain/templates/installCertifiedTemplate.js:7)
- [activateResolvedTemplateEnvironment.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/templates/activateResolvedTemplateEnvironment.js:87)

Repository truth:

- certified templates are not hypothetical
- templates already install into runtime through a lawful activation path

### Fact 5 — Templates are already treated as a cross-workspace system

The workspace ownership map explicitly says Templates are not a workspace and
must not become a separate workspace shell.

Evidence:

- [WORKSPACE_MODE_OWNERSHIP_MAP.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/WORKSPACE_MODE_OWNERSHIP_MAP.md:250)

Repository truth:

- templates are shared system infrastructure
- templates are not their own sovereign workspace

### Fact 6 — The creative-domain model already makes templates domain-derived

The creative-domain model already says templates should derive from creative
domains rather than behave like arbitrary starter files.

Evidence:

- [CREATIVE_DOMAIN_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_DOMAIN_MODEL.md:454)

Repository truth:

- templates already belong to domain expression
- they are aligned to creative world and language

### Fact 7 — The current Creative Blueprint document also treats templates as upstream producers

The Creative Blueprint model explicitly lists Templates as lawful producers of
Creative Blueprint proposals.

Evidence:

- [CREATIVE_BLUEPRINT_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_BLUEPRINT_MODEL.md:28)
- [CREATIVE_BLUEPRINT_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_BLUEPRINT_MODEL.md:123)
- [CREATIVE_BLUEPRINT_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_BLUEPRINT_MODEL.md:498)

Repository truth:

- `Template` is currently overloaded
- in one place it means a producer origin for Creative Blueprint
- elsewhere it means an installable certified runtime package

### Fact 8 — Product expression principles argue against exposing raw technical nouns directly to creators

The repository already says creators should not need to think in technical
terms such as `BlueprintV1`.

Evidence:

- [PRODUCT_EXPRESSION_PRINCIPLES.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/PRODUCT_EXPRESSION_PRINCIPLES.md:78)

Repository truth:

- internal constitutional distinctions may exist
- product-facing language should still translate those distinctions into creator meaning

---

## Question 1 — Does Current Constitutional Documentation Already Imply the Proposed Distinction?

### Verdict

`Partially yes.`

The repository already implies a meaningful distinction, but it does not state
the proposed philosophy cleanly in one place.

### What Already Exists

The existing corpus already implies:

- `Creative Blueprint` is upstream, semantic, and system-shaping
- `BlueprintV1` is installable and runtime-facing
- certified templates are installable runtime environments
- templates derive from creative domains and therefore from expression needs

### What Is Missing

The repository does not yet provide a single clarification that says:

- blueprints and templates solve different creative problems
- blueprint installation and template installation are both lawful
- template-as-producer and certified-template-as-package are not the same thing

### Ambiguity

The main ambiguity is not blueprint terminology.
It is template terminology.

`Template` currently means at least three different things:

1. a generic product concept
2. a producer origin for Creative Blueprint proposals
3. a certified installable runtime package

That ambiguity is real and worth clarifying.

---

## Question 2 — Should Creative Blueprints and Templates Remain Separate Creator-Facing Concepts?

### Verdict

`Yes, conceptually.`

`Not necessarily by exposing the raw internal terms directly.`

### Reasoning

Repository philosophy already requires:

- creators think in world, structure, role, and intention before tooling
- product surfaces reveal meaning before configuration
- creators should not think in `BlueprintV1` or runtime language

Evidence:

- [PRODUCT_EXPRESSION_PRINCIPLES.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/PRODUCT_EXPRESSION_PRINCIPLES.md:45)
- [PRODUCT_EXPRESSION_PRINCIPLES.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/PRODUCT_EXPRESSION_PRINCIPLES.md:52)
- [PRODUCT_EXPRESSION_PRINCIPLES.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/PRODUCT_EXPRESSION_PRINCIPLES.md:78)

Therefore the correct conclusion is:

- the product should preserve the distinction
- the distinction should be expressed in creator language, not raw contract names

Recommended creator-facing interpretation:

- blueprint-like concepts correspond to system formation
- template-like concepts correspond to expression instantiation

But the repository should not require creators to think:

- `BlueprintV1`
- `certification hash`
- `lineage`

---

## Question 3 — Does the Current Runtime Architecture Already Naturally Support the Separation?

### Verdict

`Yes.`

No architectural redesign is required to support the separation.

### Blueprint Path

Current blueprint flow is naturally system-oriented:

- catalog / route selection
- project manifest
- bootstrap event
- seed events
- project/runtime state installation

Evidence:

- [blueprintInstallBridge.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/bridges/blueprintInstallBridge.js:101)
- [installBlueprint.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/blueprints/installBlueprint.js:77)

This is consistent with:

- project bootstrapping
- runtime initialization
- system-level installation

### Template Path

Current certified-template flow is naturally expression/environment-oriented:

- registry entry
- descriptor
- resolved environment
- runtime snapshot
- hydration

Evidence:

- [installCertifiedTemplate.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/domain/templates/installCertifiedTemplate.js:7)
- [activateResolvedTemplateEnvironment.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/templates/activateResolvedTemplateEnvironment.js:41)
- [activateResolvedTemplateEnvironment.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/templates/activateResolvedTemplateEnvironment.js:87)

This is consistent with:

- expression instantiation
- template environment activation
- expression-first hydration

### Architectural Conclusion

The current runtime already supports a separation between:

- blueprint bootstrap packages
- template environment packages

The gap is semantic clarification, not runtime capability.

---

## Question 4 — Does the Proposed Creator Model Fit the Repository's Constitutional Direction?

### Proposed Model A

`Creative Systems -> Creative Blueprint -> BlueprintV1 -> First Expression -> Project Emergence -> Living Project`

### Proposed Model B

`Creative Expressions -> Template -> Finished Design`

### Verdict

`Model A fits partially.`

`Model B fits partially, but is too narrow in its current wording.`

### Why Model A Partially Fits

It fits because the repository already supports:

- semantic proposal -> `Creative Blueprint`
- installable runtime package -> `BlueprintV1`
- living project experience progression after world entry

But it should not be adopted as a strict constitutional lifecycle as written,
because it mixes two different axes:

- package / semantic conversion
- creator experience transition

`BlueprintV1` is a runtime package contract.
`First Expression`, `Project Emergence`, and `Living Project` are creator
experience states.

They are related, but they are not the same layer.

### Why Model B Partially Fits

It fits because certified templates already behave like expression packages.
They are domain-derived and installable through their own activation path.

But `Template -> Finished Design` is too narrow for current repository truth.

The repo already contains templates that are:

- starters
- structural expression environments
- motion-capable template environments

Therefore the more accurate constitutional reading is:

`Creative Expressions -> Certified Template -> Instantiated Expression Environment`

Some of those environments may lead to finished design.
They are not constitutionally limited to finished outputs.

### Clarified Recommendation

The repository direction is best expressed like this:

- `Creative Blueprint` shapes systems, structures, and project bootstraps
- `Certified Template` instantiates domain-shaped expressions or expression environments

This preserves current truth without forcing a false one-to-one lifecycle.

---

## Question 5 — Workspace Evaluation

This section evaluates the examples against repository truth.

### Obvious Creative System-Oriented Modes

#### UIUX

Reason:

- domain: Digital Product Design
- world: Application
- language: Page / Section / Component / Element

Evidence:

- [CREATIVE_DOMAIN_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_DOMAIN_MODEL.md:223)

Evaluation:

`UIUX` naturally supports system-oriented creation, even though it still begins through first expression.

#### Application

Reason:

- canonical Build mode
- world: System

Evidence:

- [canonicalRegistry.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/workspaces/canonicalRegistry.js:38)
- [CREATIVE_DOMAIN_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_DOMAIN_MODEL.md:229)

Evaluation:

`Application` is clearly system-oriented.

#### Systems Engineering

Reason:

- build-facing
- system-oriented payload and engines

Evidence:

- [overlayRegistry.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/workspaces/overlayRegistry.js:109)
- [modeRegistry.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/workspaces/modeRegistry.js:432)

Evaluation:

`Systems Engineering` is conceptually system-oriented.
However, it is not part of the 15 canonical modes in [canonicalRegistry.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/workspaces/canonicalRegistry.js:29).
Its constitutional product position is therefore system-leaning but not fully frozen at the canonical layer.

### Obvious Creative Expression-Oriented Concepts

#### Website

Evaluation:

`Website` is not a canonical workspace or mode.
In current repository direction it reads more naturally as a template/scenario/expression inside `UIUX` / `Application` than as a sovereign workspace.

#### Presentation

Evaluation:

`Presentation` is not a canonical mode.
It appears today as an expression/example under Graphic and Knowledge Creation rather than a constitutional workspace truth.

Evidence:

- [CREATIVE_DOMAIN_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_DOMAIN_MODEL.md:464)
- [GRAPHIC_COMPOSITION_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/GRAPHIC_COMPOSITION_MODEL.md:282)

### Expression-Leaning but Not Constitutionally Final

#### Document / Print

Reason:

- canonical mode is `document`
- ownership map explicitly frames `Document / Print` as Design-owned reuse

Evidence:

- [canonicalRegistry.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/workspaces/canonicalRegistry.js:32)
- [WORKSPACE_MODE_OWNERSHIP_MAP.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/WORKSPACE_MODE_OWNERSHIP_MAP.md:82)

Evaluation:

`Document / Print` is expression-leaning, but the repository does not require it to remain only a single finished expression.
It can still support structured multi-part work.

### Intentionally Mixed / Not Yet Reducible

#### Graphic

Reason:

- world: Composition
- today strongly expression-facing
- but already modeled as capable of larger structured communication systems

Evidence:

- [CREATIVE_DOMAIN_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_DOMAIN_MODEL.md:224)
- [GRAPHIC_COMPOSITION_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/GRAPHIC_COMPOSITION_MODEL.md:63)

Evaluation:

`Graphic` should not yet be flattened into either side only.
It begins expression-first, but its composition model already supports system-level communication coherence.

### Not a Workspace Category

#### Motion

Reason:

The repository explicitly says Motion is a cross-mode capability, while
Animation is the motion-primary grammar.

Evidence:

- [MODE_OVERLAY_MATRIX.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/MODE_OVERLAY_MATRIX.md:112)
- [MODE_OVERLAY_MATRIX.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/MODE_OVERLAY_MATRIX.md:116)

Evaluation:

`Motion` should not be classified as its own creator-workspace bucket here.
It is a capability family that can appear across multiple domains.

---

## Question 6 — Terminology Audit

### Terminology That Is Already Sufficiently Clear

- `Creative Blueprint`
- `BlueprintV1`
- `Certified Template`
- `Creative Direction`

These already have meaningful constitutional usage.

### Terminology That Is Functionally Clear but Not Fully Normalized

#### `Certified Runtime Blueprint`

Current state:

- the repository clearly supports the concept
- the normalized contract name is still `BlueprintV1`

Evidence:

- [CREATIVE_BLUEPRINT_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_BLUEPRINT_MODEL.md:405)
- [CREATIVE_BLUEPRINT_MODEL.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/CREATIVE_BLUEPRINT_MODEL.md:415)

Clarification need:

- use `BlueprintV1` when referring to the contract
- use `certified runtime blueprint` as a descriptive phrase, not as a competing formal contract name

#### `Template`

Current state:

`Template` is the most overloaded term in the repository.

It currently refers to:

- a generic creator-facing concept
- an upstream producer of Creative Blueprint proposals
- a certified installable runtime package
- legacy template material

Clarification need:

- explicitly distinguish generic `Template` from `Certified Template`
- explicitly acknowledge that template-origin proposals and certified-template packages are different roles

#### Legacy / Overlay Mode Names

Examples:

- `motion-design`
- `systems-engineering`

Current state:

These appear in overlay and mode resolution layers but are not part of the 15 canonical modes.

Evidence:

- [modeRegistry.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/workspaces/modeRegistry.js:347)
- [modeRegistry.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/workspaces/modeRegistry.js:432)
- [canonicalRegistry.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/platform/workspaces/canonicalRegistry.js:29)

Clarification need:

- distinguish canonical modes from legacy/overlay exposure names when discussing workspace philosophy

---

## Recommendation

### Recommendation 1 — Adopt Clarification Documentation

`Yes.`

The repository does not need runtime redesign.
It does need one explicit constitutional clarification that says:

- blueprints and templates are both lawful
- they solve different product problems
- the current ambiguity is in terminology, not architecture

### Recommendation 2 — Preserve Separation Without Forcing Competition

Recommended constitutional reading:

- `Creative Blueprint` is the upstream semantic system proposal
- `BlueprintV1` is the certified runtime bootstrap package for system/project installation
- `Certified Template` is the certified runtime package for expression/environment installation

These should complement one another rather than compete.

### Recommendation 3 — Clarify the Template Dual Role Explicitly

This is the most important clarification to adopt.

The repository currently supports both:

1. `Template` as a producer origin for Creative Blueprint proposals
2. `Certified Template` as a directly installable expression package

Both are already present.
They should be documented as different constitutional roles rather than collapsed into one meaning.

### Recommendation 4 — Do Not Adopt `Template -> Finished Design` as the Sole Template Philosophy

That statement is too restrictive for current repository truth.

The repository already supports templates as:

- starters
- expression environments
- motion-capable runtime seeds

The lawful clarification is broader:

`Templates primarily instantiate creative expressions or expression environments.`

Some may represent finished design.
That is not their only constitutional role.

---

## Final Conclusion

### Repository Fact

The current repository already supports a lawful separation between:

- blueprint-driven system/project bootstrap
- template-driven expression/environment installation

### Repository Ambiguity

The unresolved issue is not runtime architecture.
It is the overloaded meaning of `Template`.

### Clarification Outcome

The proposed philosophy is directionally correct, with one important refinement:

- `Creative Blueprints` should be understood as system-shaping semantic proposals that may become runtime bootstrap packages
- `Certified Templates` should be understood as expression-oriented runtime packages that instantiate creative environments

This should be adopted as clarification, not as redesign.

No runtime contract changes are required.
