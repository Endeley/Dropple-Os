# Mode Collapse Overlay Migration Map

## Purpose

This document defines the exact migration map for the constitutional collapse from 25 sovereign modes to 14 canonical modes.

Its job is to prevent silent payload loss during taxonomy collapse.

This is not the collapse itself.

This document exists to answer:

- which old sovereign modes remain canonical
- which old sovereign modes become overlays
- which overlays are lightweight taxonomy overlays vs payload-bearing overlays
- which files currently own those payloads
- which files must be changed before registry collapse

## Constitutional Rule

No sovereign mode may be collapsed unless all owned payload contracts are explicitly rehomed.

Runtime capability orphaning risk is low.
Payload orphaning risk is moderate.

The mitigation is explicit overlay ownership.

## Overlay Classes

### Class A — Capability Overlays

These are mostly taxonomy and exposure overlays.

They may preserve:
- labels
- route aliases
- panel exposure
- tool visibility
- capability surface naming

They usually do not carry deep distinct runtime payloads.

Class A overlays:
- `branding`
- `icons`
- `motion-design`
- `state-machine`
- `themes`
- `variants`
- `comments`

### Class B — Payload Overlays

These carry distinct behavior contracts that must survive collapse.

They may preserve:
- engine lists
- export formats
- allowed event types
- timeline policy
- read-only policy
- tool lists
- panel lists
- guided workflow semantics
- governance semantics

Class B overlays:
- `podcast`
- `conversion`
- `ai-build`
- `education`
- `versioning`

## Final Canonical 14

### Design
- `uiux`
- `graphic`
- `document`

### Media
- `animation`
- `video`
- `audio`

### Build
- `application`
- `logic`
- `automation`

### System
- `tokens`
- `components`
- `governance`

### Collaborate
- `review`
- `knowledge`
- `production`

## Overlay Registry Target

Introduce:

- `platform/workspaces/overlayRegistry.js`

This should become the canonical overlay truth before registry collapse.

Suggested shape:

```js
export const OVERLAY_REGISTRY = Object.freeze({
  branding: Object.freeze({
    ownerModeId: 'graphic',
    overlayId: 'brand-systems',
    class: 'capability',
  }),
});
```

This registry must preserve:
- old sovereign id
- new canonical owner mode
- overlay id
- overlay class
- legacy aliases
- payload definition source

## Migration Order

Do not collapse registries first.

Correct order:

1. alias migration in `platform/workspaces/modeResolution.js`
2. add `platform/workspaces/overlayRegistry.js`
3. map payload ownership from legacy definitions
4. collapse `platform/workspaces/canonicalRegistry.js`
5. collapse `platform/workspaces/modeRegistry.js`
6. reclassify `runtime/workspaces/workspaceCapabilities.js`
7. update tests

## Overlay Migration Table

| Old Sovereign Mode | Canonical Owner | Overlay Id | Overlay Class | Payload Preservation | Files To Touch First |
| --- | --- | --- | --- | --- | --- |
| `branding` | `graphic` | `brand-systems` | Capability | Preserve label, brand engines, export identity (`brand-kit`, `tokens`, `pdf`) | `platform/workspaces/modeResolution.js`, `platform/workspaces/legacyMapping.js`, `platform/workspaces/overlayRegistry.js`, `workspaces/registry/brandingWorkspace.js`, `workspaces/registry/index.js` |
| `icons` | `graphic` | `icon-systems` | Capability | Preserve vector/icon tool identity and export identity (`svg`, `icon-font`) | `platform/workspaces/modeResolution.js`, `platform/workspaces/legacyMapping.js`, `platform/workspaces/overlayRegistry.js`, `workspaces/registry/iconWorkspace.js`, `workspaces/registry/index.js` |
| `motion-design` | `animation` | `motion-graphics` | Capability | Preserve motion-graphics identity as a distinct animation overlay; later preserve explicit motion-graphics engine family | `platform/workspaces/modeResolution.js`, `platform/workspaces/overlayRegistry.js`, `platform/workspaces/canonicalRegistry.js`, `platform/workspaces/modeRegistry.js` |
| `podcast` | `audio` | `podcast` | Payload | Preserve audio sequencing payload: tools (`cut`, `mute`, `chapter`), sequencer/audio flags, timeline properties (`volume`, `mute`), exports (`mp3`, `wav`) | `platform/workspaces/modeResolution.js`, `platform/workspaces/legacyMapping.js`, `platform/workspaces/overlayRegistry.js`, `platform/workspaces/mediaWorkspace.js`, `platform/workspaces/canonicalRegistry.js`, `platform/workspaces/modeRegistry.js`, `workspaces/registry/podcastWorkspace.js`, `workspaces/registry/index.js` |
| `state-machine` | `logic` | `state-machine` | Capability | Preserve state-machine specialization identity inside logic | `platform/workspaces/modeResolution.js`, `platform/workspaces/overlayRegistry.js`, `platform/workspaces/canonicalRegistry.js`, `platform/workspaces/modeRegistry.js` |
| `api` | `automation` | `api-integration` | Capability | Preserve API/integration specialization identity under automation | `platform/workspaces/modeResolution.js`, `platform/workspaces/overlayRegistry.js`, `platform/workspaces/canonicalRegistry.js`, `platform/workspaces/modeRegistry.js` |
| `conversion` | `automation` | `conversion` | Payload | Preserve codegen/export payload from design-to-code flow (`css`, `lottie`, `react`) | `platform/workspaces/modeResolution.js`, `platform/workspaces/legacyMapping.js`, `platform/workspaces/overlayRegistry.js`, `platform/workspaces/canonicalRegistry.js`, `platform/workspaces/modeRegistry.js`, `workspaces/registry/conversionWorkspace.js`, `workspaces/registry/index.js` |
| `ai-build` | `automation` | `ai-systems` | Payload | Preserve AI-assisted workflow identity and future generative/orchestration payloads; keep out of sovereign taxonomy | `platform/workspaces/modeResolution.js`, `platform/workspaces/legacyMapping.js`, `platform/workspaces/overlayRegistry.js`, `platform/workspaces/canonicalRegistry.js`, `platform/workspaces/modeRegistry.js`, `workspaces/registry/aiWorkspace.js`, `workspaces/registry/index.js` |
| `themes` | `tokens` | `themes` | Capability | Preserve theme-authoring surface as token-derived overlay | `platform/workspaces/modeResolution.js`, `platform/workspaces/overlayRegistry.js`, `runtime/workspaces/workspaceCapabilities.js`, `ui/workspace/capabilities/capabilityRegistry.js` |
| `variants` | `components` | `variants` | Capability | Preserve variant exposure as component-derived overlay | `platform/workspaces/modeResolution.js`, `platform/workspaces/overlayRegistry.js`, `platform/workspaces/canonicalRegistry.js`, `platform/workspaces/modeRegistry.js` |
| `versioning` | `governance` | `versioning` | Payload | Preserve version graph, diff, compare, merge preview, conflict resolution, review workflow, rollback, lineage projections; do not bury under `components` | `platform/workspaces/modeResolution.js`, `platform/workspaces/overlayRegistry.js`, `runtime/workspaces/workspaceCapabilities.js`, `ui/workspace/capabilities/capabilityRegistry.js`, `runtime/tokens/`, `ui/workspace/system/`, `platform/workspaces/canonicalRegistry.js`, `platform/workspaces/modeRegistry.js` |
| `comments` | `review` | `comments` | Capability | Preserve comments as review primitive, not sovereign mode | `platform/workspaces/modeResolution.js`, `platform/workspaces/overlayRegistry.js`, `platform/workspaces/canonicalRegistry.js`, `platform/workspaces/modeRegistry.js` |
| `education` | `knowledge` | `learning` | Payload | Preserve guided-learning payload: read-only editing policy, tutorial/replay/AI engines, `select/step/explain` tools | `platform/workspaces/modeResolution.js`, `platform/workspaces/legacyMapping.js`, `platform/workspaces/overlayRegistry.js`, `platform/workspaces/canonicalRegistry.js`, `platform/workspaces/modeRegistry.js`, `workspaces/registry/educationWorkspace.js`, `workspaces/registry/index.js` |

## Payload Notes By Overlay

### `branding -> graphic:brand-systems`

Preserve from:
- `workspaces/registry/brandingWorkspace.js`

Must survive:
- `engines: ["brand", "tokens", "rules", "vector"]`
- export formats:
  - `brand-kit`
  - `tokens`
  - `pdf`

### `icons -> graphic:icon-systems`

Preserve from:
- `workspaces/registry/iconWorkspace.js`

Must survive:
- icon/vector tools:
  - `select`
  - `path`
  - `stroke`
- export formats:
  - `svg`
  - `icon-font`

### `motion-design -> animation:motion-graphics`

Preserve as explicit overlay identity even if current payload is shallow.

Must not disappear into generic animation naming.

### `podcast -> audio:podcast`

Preserve from:
- `workspaces/registry/podcastWorkspace.js`

Must survive:
- `engines: ["timeline", "audio"]`
- tools:
  - `cut`
  - `mute`
  - `chapter`
- sequencer/audio policy
- timeline allowed properties:
  - `volume`
  - `mute`
- export formats:
  - `mp3`
  - `wav`

### `conversion -> automation:conversion`

Preserve from:
- `workspaces/registry/conversionWorkspace.js`

Must survive:
- codegen-oriented posture
- export formats:
  - `css`
  - `lottie`
  - `react`

### `ai-build -> automation:ai-systems`

Preserve from:
- `workspaces/registry/aiWorkspace.js`

Must survive:
- AI-assisted system identity
- future-safe generated workflow posture
- no sovereign AI mode

### `versioning -> governance:versioning`

Preserve from:
- `runtime/tokens/`
- `ui/workspace/system/`
- `runtime/workspaces/workspaceCapabilities.js`
- `ui/workspace/capabilities/capabilityRegistry.js`

Must survive:
- version graph
- diff
- compare
- merge preview
- conflict resolution
- review workflow
- rollback

This overlay is broader than component authoring.

Do not bury it inside `components`.

### `education -> knowledge:learning`

Preserve from:
- `workspaces/registry/educationWorkspace.js`

Must survive:
- read-only guided posture
- engines:
  - `ai`
  - `tutorial`
  - `replay`
- tools:
  - `select`
  - `step`
  - `explain`

## Files Most Likely To Change During Migration

### Alias and routing
- `platform/workspaces/modeResolution.js`
- `platform/workspaces/legacyMapping.js`
- `platform/workspaces/mediaWorkspace.js`
- `platform/__tests__/workspaceContext.test.mjs`

### Canonical taxonomy
- `platform/workspaces/canonicalRegistry.js`
- `platform/workspaces/modeRegistry.js`

### Overlay authority
- `platform/workspaces/overlayRegistry.js`

### Legacy workspace payload sources
- `workspaces/registry/index.js`
- `workspaces/registry/brandingWorkspace.js`
- `workspaces/registry/iconWorkspace.js`
- `workspaces/registry/podcastWorkspace.js`
- `workspaces/registry/conversionWorkspace.js`
- `workspaces/registry/aiWorkspace.js`
- `workspaces/registry/educationWorkspace.js`

### Capability and UI rehoming
- `runtime/workspaces/workspaceCapabilities.js`
- `ui/workspace/capabilities/capabilityRegistry.js`
- `ui/workspace/shared/ModeSwitcher.jsx`

### Tests
- `platform/__tests__/workspaceContext.test.mjs`
- `platform/__tests__/capabilityEngine.test.mjs`
- route/mode smoke tests under `tests/e2e/`

## Recommended Implementation Rule

Do not delete old payload sources when overlays are first introduced.

Migration should happen in two steps:

1. introduce overlay ownership and aliases
2. rehome or retire legacy payload sources after tests pass

## Final Verdict

The 25 -> 14 collapse is structurally safe.

Runtime capability orphaning risk:
- low

Payload orphaning risk:
- moderate

Mitigation:
- explicit overlay registry
- explicit payload preservation
- alias migration before registry collapse
