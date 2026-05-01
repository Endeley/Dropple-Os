# Implementation Navigator

Status: Governance document  
Authority level: Subordinate to `docs/LAW.md`  
Scope: Constitutional execution control

## Purpose

This document defines the Dropple implementation navigator.

The navigator exists to prevent:

- illegal phase ordering
- skipped invariants
- constitutional drift
- accidental reopening of frozen substrate

This is not sovereign law.

This document does not replace:

- `docs/LAW.md`
- constitutional registry truth
- architectural enforcement

It exists to guide execution under law.

## Authority Order

Execution governance must obey this hierarchy:

1. `docs/LAW.md`
2. `docs/CONSTITUTION_V2.md` (draft only until adopted)
3. `docs/IMPLEMENTATION_NAVIGATOR.md`
4. `docs/ROADMAP_STATE.json`

No execution document may override architectural law.

If any execution document disagrees with `docs/LAW.md`, `docs/LAW.md` wins.

## Core Principle

Dropple may evolve through many phases, but phases may not advance unlawfully.

Infinite derivation requires finite execution discipline.

The navigator is the constitutional compass for implementation order.

## Phase Order

The master phase sequence is frozen:

0. `Foundation Freeze`
0.5 `Constitutional Navigator`
1. `Constitution Reconciliation`
2. `Overlay / Taxonomy Migration`
3. `Seed Lineage`
4. `Derived Environments`
5. `Tool Synthesis`
6. `Creative Physics`
7. `OS Surface`

Do not skip ahead.

Do not reorder phases casually.

Each phase depends on lawful closure of the phase before it.

## What the Navigator Tracks

The navigator tracks only five things:

1. phase state
2. required invariants
3. dependency order
4. constitutional risk flags
5. proof artifacts

It must stay lightweight.

It must not become a project-management subsystem.

## Phase State Vocabulary

Every phase may be only one of:

- `not-started`
- `active`
- `blocked`
- `complete`

No percent estimates.

No “mostly done.”

Execution truth must stay simple and auditable.

## Required Invariants

Each phase must declare the invariants required for lawful completion.

Example:

```json
{
  "seed_lineage": {
    "requires": [
      "template_lineage_graph",
      "lineage_cert_hash",
      "ancestry_tests"
    ]
  }
}
```

A phase may not be marked complete unless all required invariants are satisfied and backed by proof artifacts.

## Dependency Order Guards

Each phase may declare dependencies on prior phases.

Example:

```json
{
  "tool_synthesis": {
    "depends_on": [
      "seed_lineage",
      "derived_environments"
    ]
  }
}
```

If a phase is activated before its dependencies are complete, navigator output should report:

- illegal phase progression
- blocked execution

## Constitutional Risk Flags

The navigator tracks only major execution risks.

Examples:

- law drift
- unresolved compatibility conflict
- orphan payload risk
- unverified alias migration
- frozen substrate reopening

This is not a todo list.

These flags exist to surface constitutional danger only.

## Proof Artifacts

Every invariant should point to one or more proofs.

Proofs may be:

- tests
- scripts
- docs
- canonical implementation files

Example:

```json
{
  "proofs": {
    "ancestry_tests": [
      "tests/templateLineage.test.mjs"
    ],
    "lineage_cert_hash": [
      "engine/templates/certifyTemplateSeed.js"
    ]
  }
}
```

Green means proven.

Not guessed.

## Frozen Substrate Register

These completed substrate areas are frozen and must not be casually reopened:

- certified template publish/install convergence
- marketplace -> registry -> install path
- legacy template path removal
- UIUX motion-preserving roundtrip
- lawful UIUX motion authoring through intent/bridge flow

If a future phase touches frozen substrate, the navigator should emit a risk flag unless the change is:

- bug-fix scoped
- constitutional migration scoped
- explicitly justified in roadmap state

## Navigator Output

Navigator output should stay terminal-readable and minimal.

Example:

```text
Dropple Implementation Navigator

Foundation Freeze .............. COMPLETE
Constitutional Navigator ....... ACTIVE
Constitution Reconciliation .... NOT-STARTED
Overlay Migration .............. BLOCKED

Missing invariants:
- overlay_registry

Dependency violations:
- none

Constitutional risks:
- 25_to_14_aliases_unverified
```

## What the Navigator Must Not Track

The navigator must not track:

- story points
- tickets
- deadlines
- people
- estimation systems
- feature wishlists
- delivery optimism

This is execution governance, not project bureaucracy.

## Relationship to Existing Scripts

The navigator should eventually align with the philosophy of:

- `enforceDroppleLaws.cjs`
- `scripts/architectureGuard.mjs`
- `scripts/architectureRadar.mjs`
- `scripts/architecturePhaseProgress.mjs`

But it should remain separate in purpose.

Architecture scripts answer:
- is the code lawful?

Navigator scripts answer:
- are we advancing lawfully through the roadmap?

## Minimal Initial Implementation

The navigator may begin with only:

- `docs/ROADMAP_STATE.json`
- this document

Later, if useful:

- `scripts/implementationNavigator.mjs`
- `scripts/implementationGuard.mjs`

The initial version should stay intentionally small.

## Constitutional Execution Rule

No implementation phase may advance unless:

- required invariants are satisfied
- required proof artifacts exist
- dependency order is lawful
- frozen substrate is not being reopened unlawfully

This is the execution discipline required for Dropple’s later phases:

- seed lineage
- derived environments
- tool synthesis
- creative physics
- OS surface

## Final Statement

Dropple does not scale through enthusiasm.

Dropple scales through lawful execution under deterministic architectural truth.

The implementation navigator exists to keep that execution lawful.
