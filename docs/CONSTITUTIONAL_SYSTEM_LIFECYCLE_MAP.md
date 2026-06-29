# Constitutional System Lifecycle Map

## Purpose

This document records the constitutional lifecycle state of Dropple's major
constitutional systems.

It is the working input for derived governance documents such as:

- era status
- milestone records
- future constitutional navigation surfaces

This document does not invent new lifecycle rules.
It applies [CONSTITUTIONAL_LIFECYCLE_MODEL.md](./CONSTITUTIONAL_LIFECYCLE_MODEL.md)
to current repository truth.

## Classification Rule

Use the earliest defensible lifecycle stage.

If repository evidence proves `Verified` but does not clearly prove `Frozen` or
`Certified`, classify the system at `Verified`.

If repository evidence proves `Frozen` but product or release proof is not yet
explicit, classify the system at `Frozen`.

This map prefers conservative truth over optimistic interpretation.

## Current Map

| System | Lifecycle State | Evidence | Next Transition |
| --- | --- | --- | --- |
| Constitutional Law | Frozen | [docs/DROPPLE_CONSTITUTIONAL_LAW.md](./DROPPLE_CONSTITUTIONAL_LAW.md), `npm run arch`, `npm run enforce:laws` in [docs/TEST_MATRIX.md](./TEST_MATRIX.md) | Certified |
| Constitutional Stack | Frozen | [docs/CONSTITUTIONAL_STACK_V1.md](./CONSTITUTIONAL_STACK_V1.md), [docs/WORLD_AUTHORITY_AUDIT.md](./WORLD_AUTHORITY_AUDIT.md), architecture enforcement in [docs/TEST_MATRIX.md](./TEST_MATRIX.md) | Certified |
| Constitutional Lifecycle Model | Implemented | [docs/CONSTITUTIONAL_LIFECYCLE_MODEL.md](./CONSTITUTIONAL_LIFECYCLE_MODEL.md) | Verified |
| Constitutional Runtime Substrate | Frozen | `foundation_freeze.status = complete` and `frozen = true` in [docs/ROADMAP_STATE.json](./ROADMAP_STATE.json), dispatcher/replay/projection law in [docs/DROPPLE_CONSTITUTIONAL_LAW.md](./DROPPLE_CONSTITUTIONAL_LAW.md) | Certified |
| Project World | Frozen | Layer 0 in [docs/CONSTITUTIONAL_STACK_V1.md](./CONSTITUTIONAL_STACK_V1.md), world authority path in [docs/WORLD_AUTHORITY_AUDIT.md](./WORLD_AUTHORITY_AUDIT.md), product proof target in [docs/CREATE_UI_REFERENCE_IMPLEMENTATION_V1_CERTIFICATION.md](./CREATE_UI_REFERENCE_IMPLEMENTATION_V1_CERTIFICATION.md) | Certified |
| Shared Interaction Authority | Frozen | Layer 1 in [docs/CONSTITUTIONAL_STACK_V1.md](./CONSTITUTIONAL_STACK_V1.md), authority audit in [docs/WORLD_AUTHORITY_AUDIT.md](./WORLD_AUTHORITY_AUDIT.md), rendered proof target in [docs/CREATE_UI_REFERENCE_IMPLEMENTATION_V1_CERTIFICATION.md](./CREATE_UI_REFERENCE_IMPLEMENTATION_V1_CERTIFICATION.md) | Certified |
| Motion Law | Frozen | [docs/MODE_OVERLAY_MATRIX.md](./MODE_OVERLAY_MATRIX.md), automated motion-law alignment in [docs/CREATE_UI_REFERENCE_IMPLEMENTATION_V1_CERTIFICATION.md](./CREATE_UI_REFERENCE_IMPLEMENTATION_V1_CERTIFICATION.md) | Certified |
| Grouping Law | Frozen | [docs/GROUPING_AND_MERGING_LAW.md](./GROUPING_AND_MERGING_LAW.md), grouping under Shared Interaction in [docs/CONSTITUTIONAL_STACK_V1.md](./CONSTITUTIONAL_STACK_V1.md), structure proof target in [docs/CREATE_UI_REFERENCE_IMPLEMENTATION_V1_CERTIFICATION.md](./CREATE_UI_REFERENCE_IMPLEMENTATION_V1_CERTIFICATION.md) | Certified |
| `architecture:drift` | Verified | command registered in [docs/TEST_MATRIX.md](./TEST_MATRIX.md), rule registry in [`scripts/architectureDriftRules.mjs`](../scripts/architectureDriftRules.mjs), output contract in [`tests/architecture/architectureDriftOutput.test.ts`](../tests/architecture/architectureDriftOutput.test.ts) | Frozen |
| `release:trust` | Frozen | release gate command surface in [docs/TEST_MATRIX.md](./TEST_MATRIX.md), operating procedure in [docs/RELEASE_TRUST_TRIAGE_RUNBOOK.md](./RELEASE_TRUST_TRIAGE_RUNBOOK.md), CLI summary contract in [`tests/release/releaseTrustSummaryCli.test.mjs`](../tests/release/releaseTrustSummaryCli.test.mjs) | Certified |
| Artifact Planner | Verified | planner implementation in [`domain/creativeBlueprint/planUIUXArtifactModel.js`](../domain/creativeBlueprint/planUIUXArtifactModel.js), runtime-independence and determinism proof in [`tests/kernel/creativeBlueprintModelLaw.test.ts`](../tests/kernel/creativeBlueprintModelLaw.test.ts), architecture proof via `npm run architecture:drift` and `npm run test:architecture` in [docs/TEST_MATRIX.md](./TEST_MATRIX.md) | Frozen |
| Artifact Model | Verified | structural truth contract in [docs/ARTIFACT_MODEL.md](./ARTIFACT_MODEL.md), planner output evidence in [`domain/creativeBlueprint/planUIUXArtifactModel.js`](../domain/creativeBlueprint/planUIUXArtifactModel.js), deterministic and runtime-independent proof in [`tests/kernel/creativeBlueprintModelLaw.test.ts`](../tests/kernel/creativeBlueprintModelLaw.test.ts) | Frozen |
| Artifact→Blueprint Compiler | Verified | compiler implementation in [`runtime/blueprints/compileArtifactModelToBlueprintV1.js`](../runtime/blueprints/compileArtifactModelToBlueprintV1.js), contract and downstream installer proof in [`tests/kernel/artifactModelBlueprintCompilerLaw.test.ts`](../tests/kernel/artifactModelBlueprintCompilerLaw.test.ts), architecture proof via `npm run architecture:drift` and `npm run test:architecture` in [docs/TEST_MATRIX.md](./TEST_MATRIX.md) | Frozen |
| Create/UI Reference Implementation v1 | Verified | automated verification board entries in [docs/CREATE_UI_REFERENCE_IMPLEMENTATION_V1_CERTIFICATION.md](./CREATE_UI_REFERENCE_IMPLEMENTATION_V1_CERTIFICATION.md), product certification board still open in the same document | Frozen |
| Graphic Inheritance Target | Proposed | inheritance target and constraints in [docs/CREATE_UI_REFERENCE_IMPLEMENTATION_V1_CERTIFICATION.md](./CREATE_UI_REFERENCE_IMPLEMENTATION_V1_CERTIFICATION.md), `Graphic` present as a canonical mode in [docs/CONSTITUTIONAL_STACK_V1.md](./CONSTITUTIONAL_STACK_V1.md) | Implemented |

## Notes

- `Frozen` means the constitutional model is accepted and the project depends on
  it. It does not imply all rendered product certification is complete.
- `Certified` is intentionally used sparingly in this map. It requires stronger
  product or release proof than mere implementation or verification.
- `Create/UI Reference Implementation v1` remains `Verified` because its
  automated verification section is complete while its product certification
  board remains open.
- `Artifact Planner`, `Artifact Model`, and `Artifact→Blueprint Compiler`
  are classified as `Verified` because repository evidence now proves:
  implementation, deterministic behavior, runtime-independence where required,
  downstream installer compatibility, and architecture/drift alignment.
- `architecture:drift` remains `Verified` even after the v1.1 evidence pass
  because the repository clearly proves implementation and deterministic output
  contracts, while a frozen constitutional charter for the tool is not yet
  recorded as repository truth.
