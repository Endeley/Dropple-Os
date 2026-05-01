# CONSTITUTION_V2 Compatibility Matrix

Status: Draft governance artifact  
Authority level: Subordinate to `docs/LAW.md`  
Purpose: Reconcile proposed V2 direction against active constitutional law and current code ownership

## Purpose

This document maps:

- current active constitutional law in `docs/LAW.md`
- proposed constitutional direction in `docs/CONSTITUTION_V2.md`
- source-level file ownership
- real conflicts
- amendments required before adoption

This document exists to prevent dual sovereignty and constitutional drift.

## Active Law Rule

Until reconciliation is complete:

- `docs/LAW.md` remains sovereign
- `docs/CONSTITUTION_V2.md` is draft only
- no V2 article becomes active law unless reconciled with active law and code enforcement

## Compatibility Summary

### Strong compatibility

These areas already align well:

- single mutation funnel
- replay determinism
- projection-only UI
- fixed 5 workspaces
- workspace classification vs execution separation
- certified seeds as compiled replayable artifacts
- creative physics as evaluator-only derived behavior

### Real tensions

These require deliberate amendment:

1. layer axis wording
2. `25 -> 15` canonical mode collapse
3. recursive tool synthesis boundaries
4. overlay preservation / payload rehoming law

## Article Mapping Matrix

| Active Law / Source | V2 Article / Law | Compatibility | Current Owning Files | Amendment Required |
| --- | --- | --- | --- | --- |
| `LAW.md` Structural Axis | V2 Law 4 Constitutional Layer Order | Partial | `docs/LAW.md`, `enforceDroppleLaws.cjs`, `core/architecture/LAYER_CONTRACTS.md` | Yes. Keep current axis and treat `engine` as subsystem, not constitutional layer. |
| `LAW.md` Single Mutation Funnel | V2 Law 1 Event Sovereignty | Strong | `runtime/dispatcher/dispatch.js`, `core/events/`, `runtime/dispatcher/replayEvents.js` | No |
| `LAW.md` Canonical Replay Path | V2 Law 2 Replay Sovereignty | Strong | `runtime/dispatcher/`, replay tests, certification pipeline | No |
| `LAW.md` Canonical Projection Path | V2 Law 3 Projection Sovereignty | Strong | `runtime/projection/zustandBridge.js`, `runtime/projection/`, `ui/workspace/` | No |
| `LAW.md` Workspace Authority | V2 Law 5 Three-Layer Workspace Law | Strong | `workspaces/registry/`, `platform/workspaces/`, `runtime/workspaces/` | No |
| Active canonical registry | V2 Law 6 Fixed Constitutional Workspaces | Strong | `platform/workspaces/canonicalRegistry.js` | No |
| Active canonical mode registry (25) | V2 Law 7 Fifteen Canonical Modes | Conflict | `platform/workspaces/canonicalRegistry.js`, `platform/workspaces/modeRegistry.js`, `platform/workspaces/modeResolution.js` | Yes. Explicit constitutional mode-collapse amendment required. |
| No explicit active overlay law | V2 Law 8 Overlay Preservation Law | Partial | `platform/workspaces/modeResolution.js`, `platform/workspaces/legacyMapping.js`, `workspaces/registry/index.js`, `docs/MODE_COLLAPSE_OVERLAY_MIGRATION_MAP.md` | Yes. Overlay registry and payload rehoming must be introduced. |
| Certified template pipeline | V2 Law 9 Certified Seed Authority | Strong | `engine/templates/templateCompilerV1.js`, `engine/templates/templateSeed.js`, `engine/templates/certifyTemplateSeed.js`, `domain/templates/TemplateRegistry.js` | No |
| No explicit seed lineage law yet | V2 Law 10 Lineage Law | Partial | template seed and registry system | Yes. Seed lineage graph and legality checks required. |
| No explicit derived systems law yet | V2 Law 11 Derived Systems Law | Partial | capability/runtime/plugin/template seams | Yes. Needs wording adoption, but compatible. |
| Workspace activation resolves canonically today | V2 Law 12 Derived Environment Law | Partial | `platform/capabilities/workspaceActivation.js`, `platform/capabilities/capabilityRuntime.js`, `app/workspace/new/page.js` | Yes. Add bounded environment overlays from seeds. |
| Workspace activation order today | V2 Law 13 Activation Law | Strong | `platform/workspaces/resolveWorkspaceContext.js`, `platform/capabilities/workspaceActivation.js` | No, but environment overlay merge order must stay additive. |
| Tool handlers and capability gates exist | V2 Law 14 Tool Synthesis Law | Partial | `runtime/tools/`, `runtime/input/inputEngine.js`, `runtime/input/coreToolHandlers.js`, `core/contracts/intentCapabilities.v1.js` | Yes. Requires interpreted bounded tool specs. |
| Tool recursion not formalized | V2 Law 15 Recursive Tool Law | Partial | same tool/runtime areas | Yes. Must be bounded to approved handler families or interpreted specs. |
| Runtime evaluator stack exists | V2 Law 16 Creative Physics Law | Strong | `runtime/frame/runFramePipeline.js`, `runtime/scene/evaluateSceneIncremental.js`, `runtime/animation/graph/` | No |
| AI / semantic assistants not constitutionalized | V2 Law 17 Generated Knowledge Law | Partial | `workspaces/registry/educationWorkspace.js`, `workspaces/registry/aiWorkspace.js`, future knowledge surfaces | Yes. Governance wording only for now. |
| No explicit species law today | V2 Law 18 Species Law | Partial | seed/template lineage future work | Yes. Requires lineage substrate first. |
| No explicit self-extension law today | V2 Law 19 Open-Ended Lawful Evolution | Partial | plugin/capability/template/runtime seams | Yes. Governance wording only for now. |

## Conflict Register

### Conflict A — Layer Axis

Current active law:

`core -> infrastructure -> runtime -> workspace -> ui -> product`

Earlier V2 drafting attempted:

`core -> infrastructure -> engine -> runtime -> workspace -> ui -> product`

This is a real constitutional contradiction.

### Resolution

Recommended:

- keep current active layer axis
- treat `engine` as subsystem, not new constitutional layer

Files affected if amended:

- `docs/LAW.md`
- `enforceDroppleLaws.cjs`
- `core/architecture/LAYER_CONTRACTS.md`

Current recommendation:

- do not amend the active layer axis now

### Conflict B — Canonical Mode Count

Current active registry:

- 25 canonical modes

Proposed V2:

- 15 canonical modes

### Resolution

Use explicit constitutional migration:

1. alias migration
2. overlay registry
3. canonical registry collapse
4. mode registry collapse
5. capability reclassification
6. tests

Primary files:

- `platform/workspaces/canonicalRegistry.js`
- `platform/workspaces/modeRegistry.js`
- `platform/workspaces/modeResolution.js`
- `platform/workspaces/legacyMapping.js`

### Conflict C — Recursive Tool Scope

Current runtime:

- handler-based tool execution
- capability-gated intent/event funnel

Proposed V2:

- generated tools
- recursive tool generation

### Resolution

Generated tools must recurse only through:

- approved handler families
- interpreted bounded specs

No arbitrary code injection.

Primary files:

- `runtime/tools/toolController.js`
- `runtime/input/inputEngine.js`
- `runtime/input/coreToolHandlers.js`
- future `runtime/tools/interpretToolSpec.js`

### Conflict D — Overlay Preservation

Current active law does not yet formalize overlay preservation.

Collapse without overlay truth risks payload orphaning.

### Resolution

Add:

- overlay registry
- explicit payload rehoming map

Primary files:

- future `platform/workspaces/overlayRegistry.js`
- `docs/MODE_COLLAPSE_OVERLAY_MIGRATION_MAP.md`
- `workspaces/registry/index.js`

## Amendment Sequence Required

Before V2 can become active law:

1. constitutional navigator added
2. compatibility matrix completed
3. layer-axis contradiction resolved
4. `25 -> 15` mode amendment prepared
5. overlay preservation law operationalized
6. no dual-sovereignty conflict remains with `docs/LAW.md`

## Code Ownership Areas To Reconcile

### Constitutional law and enforcement

- `docs/LAW.md`
- `enforceDroppleLaws.cjs`
- `core/architecture/LAYER_CONTRACTS.md`

### Canonical taxonomy

- `platform/workspaces/canonicalRegistry.js`
- `platform/workspaces/modeRegistry.js`
- `platform/workspaces/modeResolution.js`
- `platform/workspaces/legacyMapping.js`

### Overlay migration / payload rehoming

- `docs/MODE_COLLAPSE_OVERLAY_MIGRATION_MAP.md`
- future `platform/workspaces/overlayRegistry.js`
- `workspaces/registry/index.js`

### Seed evolution

- `engine/templates/templateSeed.js`
- `engine/templates/certifyTemplateSeed.js`
- `domain/templates/TemplateRegistry.js`
- `domain/templates/TemplateCertification.js`

### Environment overlays

- `platform/capabilities/workspaceActivation.js`
- `platform/capabilities/capabilityRuntime.js`
- `app/workspace/new/page.js`

### Tool synthesis

- `runtime/tools/`
- `runtime/input/`
- `core/contracts/intentCapabilities.v1.js`

## Adoption Gate

`docs/CONSTITUTION_V2.md` may only be promoted from draft when:

- active-law contradictions are reconciled
- the compatibility matrix no longer reports unresolved constitutional conflicts
- roadmap state marks constitution reconciliation complete

## Final Statement

The V2 vision is structurally compatible with the Dropple repo.

It is not yet active constitutional law.

Adoption requires:

- reconciliation
- explicit amendment
- code ownership migration
- no dual sovereignty
