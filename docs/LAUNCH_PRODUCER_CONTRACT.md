# Launch Producer Contract

Status: Frozen constitutional contract  
Date: 2026-07-30  
Scope: Producer-side authority for workspace session launch  
Authority: Constitutional artifact, subordinate only to product truth and runtime law

## Purpose

This document formalizes the Launch Producer pattern proven by the frozen
Homepage, Template, Blueprint, and Recent Work producer slices.

It does not introduce a new subsystem.

It captures the architectural law that already emerged from implementation:

launch intent must be resolved upstream, emitted as canonical
`WorkspaceLaunchContext`, transported lawfully, and consumed by the frozen
workspace session pipeline without downstream reconstruction.

## Core Decision

Every Dropple entry point that begins a workspace session must behave as a
Launch Producer.

A Launch Producer owns:

- launch intent resolution
- producer-owned launch identity
- canonical `WorkspaceLaunchContext` construction
- lawful launch transport into `WorkspaceRoot`

A Launch Producer does not own:

- workspace boot
- workspace session creation
- runtime initialization
- downstream session consumption

## Canonical Authority Chain

The canonical chain is:

Producer Intent  
↓  
Launch Producer  
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

The producer boundary ends once a valid `WorkspaceLaunchContext` has been
handed to `WorkspaceRoot`.

The runtime boundary begins there.

## Producer Inputs

Each producer resolves only the inputs it legitimately owns.

Canonical input families include:

- launch intent
- domain identity
- workspace identity
- artifact lineage
- language identity
- category identity
- grammar identity
- certification or provenance truth
- continuation identity for resumed work

Not every producer owns every input.

### Homepage Producer

Owns:

- language-entry intent
- language identity
- authoring grammar for entry

Does not own:

- blueprint
- template
- certification
- continuation identity

### Template Producer

Owns:

- template-launch intent
- template identity
- template version identity
- canonical language/workspace ownership
- category when available
- certification truth when available

Does not own:

- template installation side effects
- marketplace discovery state

### Blueprint Producer

Owns:

- blueprint-launch intent
- blueprint identity
- blueprint version identity when available
- certification truth when available

Does not own:

- in-runtime blueprint installation
- downstream shell bootstrap reconstruction

### Recent Work Producer

Owns:

- continuation intent
- active document identity
- recent document ordering
- resumed language identity

Does not own:

- language-entry discovery
- catalog selection
- install semantics

## Producer Output Contract

Every Launch Producer must emit one immutable `WorkspaceLaunchContext` before
entering `WorkspaceRoot`.

The stable contract shape is defined in:

- `docs/WORKSPACE_LAUNCH_CONTEXT_SPEC.md`

Producer obligations are:

1. Emit canonical launch truth, not partial hints.
2. Emit the same truth deterministically for the same intent.
3. Omit fields the producer does not legitimately know.
4. Never depend on downstream inference to complete producer-owned truth.

### Mandatory Output Rule

If a producer-owned field is already known before navigation, it must be emitted
into `WorkspaceLaunchContext`.

If a field is not legitimately known upstream, the producer must not invent it.

## Transport Law

Transport exists only to carry already-resolved truth into `WorkspaceRoot`.

### Canonical Transport

Canonical transport is:

- deterministic
- lossless for producer-owned launch truth
- subordinate to `WorkspaceLaunchContext`
- acceptable to frozen runtime boot without reopening runtime authority

Canonical transport may currently use query serialization where required by the
frozen boot boundary.

That serialization is transport, not authority.

### Compatibility Transport

Compatibility transport is allowed only when:

- the frozen runtime boot path still requires legacy fields
- those fields do not replace `WorkspaceLaunchContext` as authority
- each retained field has a named downstream consumer
- each retained field is documented as transitional or non-authoritative

Compatibility transport must be reduced to the minimum required set.

### Prohibited Transport

The following are prohibited:

- inline query assembly inside producer UI
- multiple transport encodings for the same producer-owned truth
- hidden in-memory launch state that bypasses `WorkspaceLaunchContext`
- route-only launch identity without canonical context emission
- downstream reconstruction used as a substitute for producer output

## Authority Law

Launch Producers are the sole authority for producer-owned launch semantics.

Neither UI surfaces nor downstream runtime consumers may recreate:

- language identity already owned by the producer
- grammar identity already owned by the producer
- category identity already owned by the producer
- blueprint identity already owned by the producer
- template identity already owned by the producer
- certification or provenance truth already owned by the producer
- continuation identity already owned by the producer

### Corollaries

1. UI may express intent, but must not assemble launch truth inline.
2. `WorkspaceRoot` may receive launch truth, but must not reinterpret producer
   intent.
3. `WorkspaceSession` may expose launch truth, but must not reconstruct it.
4. Runtime consumers may read session truth, but must not derive alternate
   session identity from route or query state.

## Downstream Consumption Rule

Once the launch contract reaches `WorkspaceRoot`, the runtime must behave as if
the producer origin is irrelevant.

The runtime should not know whether the session began from:

- Homepage
- Template detail
- Recent Work
- Blueprint
- AI
- Import
- Marketplace
- future integrations

It should know only that it received a valid `WorkspaceLaunchContext`.

## Producer-Specific Responsibility

The Launch Producer contract does not erase producer-specific behavior.

The following remain intentionally local to each producer:

- discovery UI
- marketplace browsing
- recent-work ranking policy
- template provenance gathering
- homepage presentation language
- future producer-specific pre-resolution steps

These concerns must not leak into the shared launch contract unless they become
canonical launch truth.

## Architectural Guard Rule

Every canonical Launch Producer must have:

1. deterministic producer tests
2. deterministic transport verification
3. an authority guard that rejects inline reconstruction in the producer UI

Examples already frozen in the repository:

- `tests/architecture/homepageLaunchAuthority.test.mjs`
- `tests/architecture/templateLaunchAuthority.test.mjs`
- `tests/architecture/homepageRecentWorkLaunchAuthority.test.mjs`

These guards make producer authority enforceable rather than conventional.

## Canonical Producer Pattern

The current canonical pattern is:

1. UI surface expresses launch intent.
2. Producer helper resolves lawful launch truth.
3. Producer helper emits canonical `WorkspaceLaunchContext`.
4. Producer helper builds lawful transport.
5. `WorkspaceRoot` receives the context.
6. `WorkspaceSession` becomes sole runtime session authority.

Implementation examples:

- `runtime/workspaces/homepageLaunch.js`
- `runtime/workspaces/templateLaunch.js`
- `runtime/workspaces/recentWorkLaunch.js`

## Current Frozen Producers

### Homepage Producer

Frozen slice:

Homepage Intent  
↓  
`createHomepageLanguageLaunchContext(...)`  
↓  
`buildHomepageLanguageLaunchHref(...)`

### Template Producer

Frozen slice:

Marketplace Template Detail  
↓  
`createTemplateDetailLaunchContext(...)`  
↓  
`buildTemplateDetailLaunchHref(...)`

### Recent Work Producer

Frozen slice:

Continue Existing Work  
↓  
`createRecentWorkLaunchContext(...)`  
↓  
`buildRecentWorkLaunchHref(...)`

## Future Producer Rule

Any new entry point must be evaluated first as a Launch Producer candidate.

Before implementation, ask:

1. What launch intent does this producer own?
2. What launch truth does it already know before navigation?
3. What canonical `WorkspaceLaunchContext` can it emit?
4. What transport is lawful under the frozen runtime boundary?
5. What authority guard will prevent regression?

If an entry path cannot answer those questions, it is not ready to enter the
workspace boot pipeline.

## Non-Goals

This contract does not define:

- workspace rendering
- canvas behavior
- dispatcher/event authority
- template installation internals
- blueprint compilation internals
- marketplace UI design
- authoring grammar behavior

It governs only launch production.

## Exit Result

This document freezes the Launch Producer pattern as a constitutional contract.

From this point onward:

- future producer work must conform to this contract
- runtime boot must not be reopened by producer convergence
- producer slices should be added by composition, not by redesign

The next valid producer milestone is therefore not "invent another launch path"
but "implement another Launch Producer that obeys this contract."
