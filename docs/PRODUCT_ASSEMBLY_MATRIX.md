# Product Assembly Matrix

Status: Active governance roadmap  
Date: 2026-07-30  
Scope: Assembly-phase roadmap for exposing existing Dropple engine capabilities through coherent creator-facing product surfaces  
Authority: Governance artifact subordinate to `INTENT_ARCHITECTURE.md`, `CREATIVE_START_1_0.md`, `CREATIVE_SESSION_RESOLUTION_ROADMAP.md`, and frozen runtime law

## Purpose

This document exists to distinguish:

- engine building
- product assembly
- future product maturity work

Dropple is no longer primarily blocked on missing engine capability.

It is primarily blocked on exposing existing capability through a coherent
creator experience.

## Assembly Decision Tree

Every proposed feature should pass through this classification before
implementation begins.

New Idea  
↓  
Does the engine already support this?  
↓  
If no → Engine Building  
If yes → Is it already exposed as a coherent creator experience?  
↓  
If no → Product Assembly  
If yes → Product Maturity

## Engineering Model

### Phase 1 — Engine Building

Question:

Can Dropple do this?

This phase produced capabilities such as:

- Blueprint Compiler
- Template Compiler
- Registries
- Certification
- Installation
- Launch Producers
- `WorkspaceLaunchContext`
- Workspace Boot

For most of these systems, the answer is now:

Yes.

### Phase 2 — Product Assembly

Question:

Can the creator discover, understand, and use this capability naturally?

This is the current phase.

The remaining work is increasingly about:

- discoverability
- distinction
- selection flow
- creator guidance
- coherent entry
- meaningful defaults

### Phase 3 — Product Maturity

Question:

What new engine capability is justified only after existing capability has been
fully expressed?

This phase should come after assembly is coherent.

It exists to prevent unnecessary engine expansion before current capability is
fully surfaced.

## Product Assembly Law

Before building a new subsystem, ask:

Is this genuinely new engine capability?

Or is this product assembly of an already-existing capability?

If it is assembly, it must map to a row in this matrix.

## Assembly Matrix

| System | Canonical Producer | Engine Capability | Product Surface | Runtime Integration | Governance Status | User Value | Current State | Next Assembly Work |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Blueprint | Blueprint Producer | Complete | Partial | Complete | Frozen | Gives creators structural starting points | Compiler, catalog, install, launch, and certification exist; creator-facing selection is still mixed with templates | Separate Blueprint selection from Template selection and make Blueprint a first-class Creative Start choice |
| Template | Template Producer | Complete | Partial | Complete | Frozen | Gives creators reusable expressive starting points | Compiler, registry, certification, publish, loader, install, and launch exist; browsing and differentiation remain incomplete | Productize Template browsing and clarify when Template is expression-first rather than structure-first |
| Blank Foundation | Blank Producer | Minimal | Missing | Complete | Partial | Gives experienced creators unrestricted creation | Empty workspace boot exists, but it is not yet surfaced as an intentional start mode | Promote Blank Foundation to a first-class Creative Start entry mode instead of leaving blankness as an implicit fallback |
| Creative Intent | Intent Producer | Partial | Partial | Complete | Active | Lets creators begin from meaning instead of from a blank editor | Creative Start exists as milestone and Marketplace has become the first resolution surface, but the full flow is incomplete | Complete the creator flow: Language → Blueprint Category → Blueprint → Template → Workspace |
| Homepage Entry | Homepage Producer | Complete | Partial | Complete | Frozen / Active | Gives creators the first orientation into Dropple | Homepage launch producer is frozen; homepage creator-start actions now point into Marketplace intent paths | Refine Home so creator entry strategies are explicit and discoverable without collapsing back into raw workspace launch |
| Marketplace Resolution | Intent Producer | Partial | Partial | Complete | Active | Helps creators narrow from broad intention into a valid starting point | Marketplace now exposes family/category filtering, but still behaves partly like a mixed catalog | Turn Marketplace into a true Creative Start environment with distinct Blueprint and Template stages |
| Launch Producers | Producer Family | Complete | Hidden | Complete | Frozen | Ensures every entry strategy becomes canonical launch truth | Homepage, Template, Blueprint, and Recent Work producers exist and are guarded | Keep hidden from creators; use them consistently as product assembly substrate rather than building alternate launch paths |
| Workspace Launch Context | Producer Output Contract | Complete | Hidden | Complete | Frozen | Guarantees the workspace opens with explicit purpose | Canonical contract exists and is consumed by WorkspaceRoot / WorkspaceSession | Preserve as invisible infrastructure; do not reopen unless evidence exposes contradiction |
| Workspace Boot | Workspace Root / Session Pipeline | Complete | Hidden | Complete | Frozen | Turns launch truth into a live editing session | Boot path already supports empty, template-derived, and launch-context-driven startup | Keep stable; assembly work should target upstream experience rather than boot architecture |
| Blueprint Author Grammar | Blueprint Author Producer | Partial | Missing | Partial | Governed | Allows Dropple to author its own structural starting points | Compiler and install substrate exist, but creator-facing authoring grammar is not yet productized | Defer until Creative Start assembly is coherent, then expose structural authoring on the universal canvas |
| Template Author Grammar | Template Author Producer | Partial | Missing | Partial | Governed | Allows Dropple to author expressive starting points natively | Publish/compiler substrate exists, but creator-facing authoring grammar is not yet productized | Defer until Creative Start assembly is coherent, then expose expressive authoring on the universal canvas |

## Current Interpretation

The project is no longer best described as:

build engine  
↓  
build product

It is better described as:

engine largely exists  
↓  
assemble creator-facing product surfaces  
↓  
extend maturity only when justified

## Prioritization Rule

During Creative Start 1.0, rows should be prioritized according to:

1. creator entry clarity
2. distinction between starting strategies
3. visibility of existing capability
4. preservation of frozen runtime and launch boundaries

Not according to:

- novelty of engine work
- number of new subsystems added
- depth of infrastructure already proven

## Creative Start 1.0 Assembly Order

The current assembly order is:

1. Separate Blueprint and Template as distinct creator decisions.
2. Complete Marketplace Resolution so it behaves as a true resolver rather than a mixed catalog.
3. Introduce Blank Foundation as a peer entry mode rather than a hidden fallback.
4. Complete full Intent Resolution only after the previous concepts are distinct.

These steps belong to one continuous creator journey, not four unrelated
features.

## Assembly Checklist

Before starting a new feature, answer:

1. Which row in this matrix does the work belong to?
2. Is this new engine work or product assembly?
3. What creator value becomes more visible if this row is completed?
4. Does the proposed work reuse an existing engine capability?
5. Does it preserve the frozen launch and runtime boundaries?

## Immediate Use

This matrix should act as the primary assembly roadmap for:

- Creative Start 1.0
- Homepage-to-Marketplace creator entry refinement
- Blueprint vs Template distinction
- Blank Foundation productization

## Final Direction

Dropple does not currently need another generation of compilers, registries,
installers, or launch contracts by default.

It needs the existing engine to become legible, usable, and coherent from the
creator's perspective.

The assembly phase succeeds when creators can naturally begin, choose the right
starting strategy, and enter the correct workspace without needing to understand
the engine underneath.
