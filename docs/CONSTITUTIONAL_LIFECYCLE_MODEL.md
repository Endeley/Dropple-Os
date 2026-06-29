# Constitutional Lifecycle Model

## Purpose

The Constitutional Lifecycle defines how ideas, capabilities, laws, workspaces,
and governance systems become constitutional truth within Dropple.

It exists to separate:

- implementation from constitutional acceptance
- runtime verification from product proof
- product proof from architectural reuse

This model governs constitutional maturity, not implementation chronology.

That means:

- a feature may be Implemented long before it is Frozen
- a law may be Frozen before it is Certified
- a workspace may remain Certified for months before it becomes Inherited
- some proposals may remain Proposed forever and never progress

This document does not define project management workflow.
It defines how Dropple evolves constitutionally.

## Scope

This lifecycle applies to:

- constitutional laws
- runtime subsystems
- reference implementations
- governance infrastructure
- major capabilities
- workspaces
- experience models

This lifecycle does not apply to:

- individual bug fixes
- routine refactors
- temporary experiments
- daily development tasks

If a change does not alter constitutional truth, product proof, or inheritance
readiness, it does not require lifecycle classification.

## Governing Principles

### Truth, Not Time

The lifecycle governs constitutional truth, not sequence in calendar time.

Progress is measured by constitutional maturity.
It is not measured by how long code has existed or how recently work landed.

### Earliest Defensible Stage

A constitutional system shall always be recorded at the earliest lifecycle
stage that is fully supported by repository evidence and governance decisions.

Consequences:

- lifecycle stages shall never be skipped
- repository evidence establishes what is technically true
- governance decisions establish what is constitutionally accepted
- unverified assumptions shall not advance lifecycle state
- constitutional maturity is earned through evidence, not inferred from intent

### Monotonic Transitions

Lifecycle transitions are monotonic.

Once something becomes:

- Frozen
- Certified
- Inherited

it does not silently move backward.

If a contradiction is discovered after one of these stages, that is not a normal
regression.
It requires either:

- a constitutional amendment
- an explicit governance decision
- a replacement lifecycle for a new model

### Evidence Before Declaration

No lifecycle transition may be declared without the evidence required by that
transition.

Automation can verify implementation and behavior.
Automation alone does not declare constitutional acceptance, certification, or
inheritance.

## The Seven Stages

### 1. Proposed

Definition

An idea exists, but it is not yet part of Dropple's accepted constitutional
direction.

Required evidence

- problem statement or design intent
- constitutional fit discussion
- ownership hypothesis

Exit criteria

- a decision exists to implement
- ownership is considered lawful enough to begin work

### 2. Implemented

Definition

Code exists for the thing being introduced.

Required evidence

- repository implementation
- relevant file-backed integration point

Exit criteria

- the system exists in code
- the implementation can be exercised

### 3. Verified

Definition

The implementation has working evidence.

Required evidence

- automated tests, runtime verification, or equivalent deterministic proof
- repeatable evidence that behavior works as implemented

Exit criteria

- the implementation behaves correctly according to its current model
- verification artifacts are strong enough to support constitutional review

### 4. Frozen

Definition

The constitutional model is accepted.

Frozen does not mean "never edit."
It means:

`The project now depends on this model.`

Required evidence

- verified implementation
- constitutional review
- clear ownership and layering
- no temporary authority path required to justify the design

Exit criteria

- constitutional authority accepts the model
- future work must build above this model instead of casually redefining it

### 5. Certified

Definition

The frozen model is proven in the product and release evidence.

Required evidence

- rendered product proof, release proof, operator proof, or equivalent
- certification evidence that the frozen model is expressed correctly

Exit criteria

- the product demonstrates the model, not merely the codebase
- governance accepts the evidence as sufficient constitutional proof

### 6. Inherited

Definition

Another system reuses the certified model without introducing a new authority.

This is the strongest proof of architectural maturity in Dropple.

Required evidence

- a second implementation or system inherits the model
- reuse succeeds without constitutional exception or duplicate authority

Exit criteria

- reuse proves the model is not workspace-specific or one-off
- governance accepts the reuse as lawful inheritance

### 7. Historical

Definition

The lifecycle is complete and becomes part of project history.

Historical does not mean obsolete.
It means the lifecycle has reached a stable recordable outcome.

Required evidence

- lifecycle close-out
- successor state or enduring reference state is clear

Exit criteria

- the project records the lifecycle as completed history

## Transition Rules

The lifecycle advances through evidence-backed transitions:

| Transition | Required Evidence | Decision Authority |
| --- | --- | --- |
| Proposed -> Implemented | Code exists | Engineering |
| Implemented -> Verified | Tests, runtime verification, or equivalent deterministic proof | Engineering |
| Verified -> Frozen | Constitutional review and accepted ownership model | Governance |
| Frozen -> Certified | Product proof, release proof, or operator proof | Governance |
| Certified -> Inherited | Reuse without new authority | Governance |
| Inherited -> Historical | Lifecycle close-out and enduring record | Governance |

## Evidence Hierarchy

The farther a system progresses, the less automation alone is sufficient.

The default evidence hierarchy is:

1. Repository artifacts
2. Automated verification
3. Rendered product or release certification
4. Governance decision

This means:

- code can prove Implemented
- tests can prove Verified
- product and release evidence support Certified
- only governance can declare Frozen, Certified, Inherited, or Historical

## Authority to Declare Transitions

Not every transition has the same declaring authority.

### Engineering-declared transitions

Engineering may determine:

- Proposed -> Implemented
- Implemented -> Verified

provided the required repository and verification evidence exists.

### Governance-declared transitions

Governance must determine:

- Verified -> Frozen
- Frozen -> Certified
- Certified -> Inherited
- Inherited -> Historical

because these transitions change constitutional truth, not just implementation
status.

Tools may supply evidence.
Tools may not silently declare governance states.

## Examples

### Example 1 — Constitutional Law

`CONSTITUTIONAL_STACK_V1.md`

- Proposed: the stack model is being designed
- Implemented: the document exists
- Verified: codebase enforcement and audits align with the law
- Frozen: the stack is accepted as the constitutional ordering model
- Certified: release and architecture evidence prove the law is actively upheld
- Inherited: future workspaces and capabilities adopt the same stack without amendment
- Historical: the lifecycle of `v1` is complete and remains part of project history

### Example 2 — Runtime Subsystem

Shared interaction authority for grouping

- Proposed: grouping is being discussed as authority vs tool behavior
- Implemented: runtime grouping path exists
- Verified: grouping behavior passes deterministic tests
- Frozen: Group is accepted as Shared Interaction Authority
- Certified: rendered certification proves grouping behaves correctly in product
- Inherited: another workspace reuses grouping without introducing a workspace-owned group authority
- Historical: the grouping law and implementation lifecycle are complete

### Example 3 — Reference Implementation

`Create/UI Reference Implementation v1`

- Proposed: Create/UI is selected as first proof surface
- Implemented: shell, motion, grouping, and world behaviors exist
- Verified: runtime and end-to-end evidence prove the implementation works
- Frozen: Create/UI is accepted as the reference implementation target
- Certified: the certification board passes
- Inherited: Graphic or another workspace reuses the same constitutional model without new authority
- Historical: `v1` becomes a recorded reference milestone after inheritance proof

### Example 4 — Governance Infrastructure

`architecture:drift`

- Proposed: need for early architectural drift detection is identified
- Implemented: drift script exists
- Verified: the script catches real violations deterministically
- Frozen: its role as the Constitution's Early Warning System is accepted
- Certified: release and developer workflow evidence prove it is trusted infrastructure
- Inherited: the same constitutional rule model is reused by future governance surfaces without redefining ownership
- Historical: a given major drift-guard model becomes part of project history when superseded lawfully

### Example 5 — Release Governance

`release:trust`

- Proposed: release integrity needs constitutional evidence, not only pass/fail checks
- Implemented: report and comparators exist
- Verified: the report executes deterministically with file-backed evidence
- Frozen: its role in constitutional release governance is accepted
- Certified: release use proves it protects real constitutional boundaries
- Inherited: future release surfaces or navigators consume the same release truth without introducing parallel authority
- Historical: a completed release-trust model remains part of the governance record

## What This Model Enables

This lifecycle provides one universal maturity language for:

- laws
- capabilities
- workspaces
- runtime systems
- governance tools

It also clarifies the meaning of project eras.

For example:

- Era I primarily moved systems from Proposed to Frozen
- Era II primarily moves systems from Frozen to Certified to Inherited

That makes eras a collection of lifecycle transitions, not a substitute for the
lifecycle itself.

## Final Rule

After this model, status documents, milestones, navigators, and certification
boards should derive from the lifecycle instead of redefining it.

Dropple should not create parallel maturity taxonomies when this model already
answers the question:

`How does something become constitutional truth?`
