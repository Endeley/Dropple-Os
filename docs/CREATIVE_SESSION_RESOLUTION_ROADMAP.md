# Creative Session Resolution Roadmap

Status: CSR 1.1B frozen, CSR 1.1C-A frozen, CSR 1.1C-B frozen, CSR 1.1C-C frozen, Launch Producer Contract frozen, Creative Start 1.0 active  
Date: 2026-07-30  
Scope: Product-facing operating system entry sequence  
Authority: Product roadmap artifact, subordinate to constitutional and runtime truth

## Purpose

This document freezes the next major Dropple direction:

Dropple already contains much of the engine and runtime infrastructure required
for Blueprints, Templates, and workspace boot.

What is missing is the coherent operating system experience that exposes those
capabilities through one creator-facing flow.

This roadmap defines that flow and the next milestone order without introducing
another standalone application or replacing the existing runtime.

## Current Interpretation

The repository currently contains three practical layers:

1. Engine
   - workspace runtime
   - dispatcher and event authority
   - artifact model
   - blueprint compiler
   - blueprint installer
   - template registry
   - template publisher
   - template installer
   - workspace boot

2. Product Services
   - language entry
   - blueprint catalog
   - template catalog
   - workspace launch

3. Creator Experience
   - creative start
   - blueprint authoring
   - template authoring
   - creator workspace

The engine is relatively mature.

The missing layer is the creator experience.

## Canonical Intent Reference

Intent Architecture:

- `docs/INTENT_ARCHITECTURE.md`

This is the canonical definition of:

- Creative Intent
- Launch Truth
- Workspace Consumption
- Interaction Intent

All new creator-entry, launch-producer, workspace-boot, and runtime-intent work
must conform to that document.

## CSR 1.1C-A Freeze Record

Status: Frozen  
Date: 2026-07-29  
Scope: Homepage Entry-Point Convergence  

Homepage is now a canonical session producer for language-entry launches.

Frozen authority chain:

Homepage Intent  
↓  
`createHomepageLanguageLaunchContext(...)`  
↓  
`WorkspaceLaunchContext`  
↓  
Transport  
↓  
`WorkspaceRoot`  
↓  
`WorkspaceSession`  
↓  
Workspace Runtime

Protected files:

- `runtime/workspaces/homepageLaunch.js`
- `runtime/workspaces/__tests__/homepageLaunch.test.mjs`
- `tests/architecture/homepageLaunchAuthority.test.mjs`

Frozen law:

`ProjectHomeClient.jsx` must not reconstruct launch semantics inline. Homepage
language launches must delegate through the canonical homepage producer helper.

## CSR 1.1C-B Freeze Record

Status: Frozen  
Date: 2026-07-29  
Scope: Marketplace Template Detail Launch Producer and downstream convergence cleanup  

Marketplace template-detail launch is now a canonical producer slice, and the
active downstream convergence cleanup is complete.

Frozen authority chain:

Marketplace Template Detail  
↓  
`createTemplateDetailLaunchContext(...)`  
↓  
`WorkspaceLaunchContext`  
↓  
Compatibility transport  
↓  
`WorkspaceRoot`  
↓  
`WorkspaceSession`  
↓  
Workspace Runtime

Protected files:

- `runtime/workspaces/templateLaunch.js`
- `runtime/workspaces/__tests__/templateLaunch.test.mjs`
- `tests/architecture/templateLaunchAuthority.test.mjs`
- `docs/CSR_1_1C_B_STAGE2_FIELD_LINEAGE_MAP.md`

Frozen law:

`app/marketplace/template/[id]/page.js` must not reconstruct template launch
semantics inline. Marketplace template-detail launch must delegate through the
canonical template launch producer helper.

Stage 2 completed:

- removed active downstream producer-owned reconstruction for template-owned
  launch truth
- reduced compatibility transport to the documented minimal set required by the
  frozen runtime boot path
- preserved the frozen `WorkspaceRoot` → `WorkspaceSession` → runtime boot
  boundary unchanged

## Launch Producer Pattern Review

Status: Frozen constitutional contract  
Date: 2026-07-29  
Scope: Architectural review and governance freeze  

The launch-producer pattern is no longer under review.

Its constitutional artifact is now frozen:

- `docs/LAUNCH_PRODUCER_CONTRACT.md`

This contract captures the architectural law demonstrated by the frozen
Homepage, Template, Blueprint, and Recent Work producer families.

## CSR 1.1C-C Freeze Record

Status: Frozen  
Date: 2026-07-30  
Scope: Blueprint Launch Convergence  

Blueprint launch is now a canonical producer slice, and the active downstream
blueprint convergence cleanup is complete.

Frozen authority chain:

Blueprint Intent  
↓  
`createBlueprintLaunchContext(...)`  
↓  
`WorkspaceLaunchContext`  
↓  
Compatibility transport  
↓  
`WorkspaceRoot`  
↓  
`WorkspaceSession`  
↓  
Workspace Runtime

Protected files:

- `runtime/workspaces/blueprintLaunch.js`
- `runtime/workspaces/__tests__/blueprintLaunch.test.mjs`
- `tests/architecture/blueprintLaunchAuthority.test.mjs`
- `tests/architecture/blueprintLaunchDownstreamAuthority.test.ts`
- `docs/CSR_1_1C_C_BLUEPRINT_LAUNCH_AUDIT.md`
- `docs/CSR_1_1C_C_STAGE2_FIELD_LINEAGE_MAP.md`

Frozen law:

Blueprint launch must not reconstruct producer-owned blueprint identity
downstream once canonical launch truth exists in `WorkspaceLaunchContext`.
Legacy query transport may remain only as an explicitly bounded compatibility
fallback for the frozen shell bootstrap path.

Stage 1 completed:

- extracted a canonical Blueprint Launch Producer
- redirected legacy route-bootstrap launch through producer-owned launch truth
- emitted canonical blueprint identity, version, and certification into
  `WorkspaceLaunchContext`

Stage 2 completed:

- moved active shell bootstrap consumption to prefer canonical launch context
- reduced blueprint query ownership to compatibility-only fallback
- preserved the frozen `WorkspaceRoot` → `WorkspaceSession` → runtime boot
  boundary unchanged

Evidence:

- blueprint launch producer tests passing
- blueprint launch authority guard passing
- blueprint downstream authority guard passing
- architecture suite green
- `npm run validate:app` green

## Core Decision

Dropple should not build:

- a separate Blueprint Builder application
- a separate Template Builder application
- a second canvas
- a second runtime

Instead, Dropple should expose new authoring intent through the same universal
canvas.

The canvas remains invariant.

Only the grammar changes.

## Universal Canvas Rule

The universal canvas is the constant substrate for all creation modes.

It hosts multiple grammars:

- Create Grammar
- Blueprint Author Grammar
- Template Author Grammar

These grammars may change:

- what may be created
- what may be edited
- what properties are visible
- what publish action is available

They may not replace the runtime, dispatcher, or event model.

## Creative Start 1.0

Creative Start 1.0 is the next milestone.

Its responsibility is not to create new engine capability.

Its responsibility is to expose existing capability through one coherent creator
journey.

### Creator Journey

Dropple  
↓  
Creative Language  
↓  
Blueprint Category  
↓  
Blueprint  
↓  
Template (Optional)  
↓  
Workspace

This is the canonical operating system entry sequence.

## Internal Name

The user-facing product language may continue to say `Create`.

Internally, the system should treat this process as:

`Creative Session Resolution`

That makes the responsibility explicit.

The system is not opening a page.

It is resolving a creator session.

## Resolution-State Rule

Creative Session Resolution must be defined in terms of resolution states, not
screens.

The UI may evolve through:

- modal
- sidebar
- wizard
- split view
- full page
- conversational flow

Those are presentation choices.

The product contract is the state transition sequence.

### Resolution Flow

Start  
↓  
Language Selected  
↓  
Blueprint Category Selected  
↓  
Blueprint Selected  
↓  
Template Selected (optional)  
↓  
Workspace Launch Context Resolved  
↓  
Workspace Boot

This is the Milestone 1 behavioral contract.

## Workspace Launch Context

Creative Session Resolution should not pass only a language, blueprint, and
template into the workspace.

It should resolve a full Workspace Launch Context.

### Workspace Launch Context Fields

- Language
- Category
- Blueprint
- Template
- Authoring Grammar
- Certification State

### Example

- Language: `uiux`
- Category: `dashboard`
- Blueprint: `analytics-dashboard`
- Template: `enterprise-dark`
- Authoring Grammar: `create`
- Certification State: `dropple-certified`

This context should be available to the launched workspace as explicit truth,
not inferred later from partial route state.

The stable interface for this context is defined in:

- `docs/WORKSPACE_LAUNCH_CONTEXT_SPEC.md`

Workspace Launch Context is the sole authority for workspace session
initialization.

Creative Session Resolution may produce it.

Workspace Runtime must consume it.

Neither side should infer missing launch truth after handoff.

## Blueprint Author Grammar

Blueprint Author is structural.

It must never collapse into a visual editor.

Its responsibility is:

- semantic structure
- slots
- hierarchy
- layout rules
- constraints
- compatibility
- editable regions

Blueprint Author defines what exists.

Publishing should reuse the existing blueprint compiler and install contract.

## Template Author Grammar

Template Author is expressive.

It must never redefine structure.

Its responsibility is:

- colors
- typography
- spacing
- iconography
- imagery
- effects
- motion
- design tokens

Template Author defines how something looks and feels.

Publishing should reuse the existing template pipeline.

## Infrastructure Freeze

The following subsystems are considered infrastructure for this roadmap and
should be orchestrated rather than replaced:

- Blueprint Compiler
- Blueprint Installer
- Template Registry
- Template Publisher
- Template Installer
- Workspace Boot

Creative Session Resolution depends on these systems.

It does not supersede them.

## Certification Model

Every Blueprint and every Template should carry a certification state.

Initial states:

- Dropple Certified
- Community
- Experimental
- Private

These states should become part of the Workspace Launch Context and of catalog
presentation.

## Milestone Order

## CSR 1.1B Freeze Record

Status: Frozen  
Date: 2026-07-29  
Authority: Runtime/session boundary record

CSR 1.1B is now considered constitutionally complete.

The frozen law is:

- WorkspaceRoot is the sole session composition root.
- WorkspaceSession is the sole runtime authority for session identity.
- Runtime boot must not be reopened by entry-point convergence work.

### Evidence

- session authority guard passing
- runtime audit passing
- WorkspaceLaunchContext tests passing
- WorkspaceSession tests passing
- deterministic launch-context and session initialization tests passing
- architecture suite passing for the session-authority audit layer
- authority audit clean

### Frozen Boundary

CSR 1.1C and later work may not modify:

- `WorkspaceRoot`
- `WorkspaceSession`
- session creation
- runtime boot authority

Later milestones may only produce a valid Workspace Launch Context and hand it
to the existing pipeline.

### Milestone 1 — Creative Start 1.0

Build the first coherent creator-facing entry flow:

Language → Blueprint Category → Blueprint → Template → Workspace

Requirements:

- reuse the existing blueprint and template infrastructure
- preserve the frozen launch producer and workspace session boundaries
- resolve creator intent explicitly before workspace boot
- pass one complete launch context into the workspace

Implementation framing:

- define resolution states, not UI screens
- begin from existing surfaces before adding new ones
- treat Creative Start as a producer of creator intent, not a replacement for
  workspace launch infrastructure

### Milestone 2 — Blueprint Author Grammar

Add blueprint authoring to the existing universal canvas.

Requirements:

- semantic structural authoring
- reusable structural publication
- publish through the existing blueprint compiler path

### Milestone 3 — Template Author Grammar

Add template authoring to the same universal canvas.

Requirements:

- expressive visual authoring
- no structural redefinition
- publish through the existing template pipeline

### Milestone 4 — Certified Creative Library

Populate the system with trusted content and relationships.

Requirements:

- Dropple Certified Blueprints
- Dropple Certified Templates
- per-language categories
- compatibility relationships
- certification and trust states

## Non-Goals For Creative Session Resolution

This milestone does not require:

- replacing the workspace runtime
- replacing the dispatcher
- rewriting blueprint installation
- rewriting template publishing
- building all community systems
- building a separate builder product

## Reuse / Do Not Build

### Reuse

- Blueprint Catalog
- Blueprint Installer
- Blueprint Compiler
- Template Registry
- Template Installer
- Template Publisher
- Workspace Boot
- Workspace Root

### Do Not Build

- new blueprint runtime
- new template runtime
- new workspace runtime
- separate blueprint application
- separate template application

## Milestone 1 Success Criteria

Creative Session Resolution is complete only if the following end-to-end journey
works without hidden state reconstruction:

Creator opens Dropple  
↓  
Chooses Language  
↓  
Chooses Blueprint  
↓  
Chooses Template or skips  
↓  
Workspace launches  
↓  
Workspace knows:

- Language
- Blueprint
- Template
- Grammar
- Certification

↓  
Creator starts creating immediately

If any step depends on manual intervention or inference of missing launch state,
Milestone 1 is incomplete.

## Product Law

Blueprints and Templates are not optional marketplace assets.

They are first-class operating system services.

Every creator should be able to begin through them before entering the
workspace.

## Final Direction

Dropple should evolve from:

disconnected internal capabilities

to:

a coherent Creative Operating System where a creator can resolve a session,
enter the universal canvas with the correct grammar, and begin work with the
right structural and expressive context already established.
