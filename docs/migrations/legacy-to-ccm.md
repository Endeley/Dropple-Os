# Legacy Templates → CCM v1 Mapping (Design-Only)

Status: Design-locked  
Implementation: ❌ Not yet  
Purpose: Prevent schema drift and unsafe migrations

## 1. Scope & Intent

This document defines how legacy template concepts map into CCM v1 Template
Artifacts.

It is not executable code. It is a contract that future migration code must
follow exactly.

Goals:

- Avoid ad-hoc conversions
- Preserve user trust
- Ensure deterministic, auditable migrations
- Allow legacy and CCM pipelines to coexist safely

## 2. Definitions

### Legacy Template (Current System)

A legacy template is composed of:

- baseSnapshot (node graph state)
- eventTimeline (mutation events)
- metadata (UI-facing info)
- mode (design, motion, etc.)

Legacy templates are stateful and procedural.

### CCM v1 Template Artifact

A CCM template is composed of:

- metadata (identity + engine contract)
- structure (immutable component tree)
- motion (immutable animation timelines)
- params (controlled variability)
- runtime (execution constraints)

CCM templates are declarative and immutable.

## 3. Core Migration Principle (Non-Negotiable)

Legacy templates are state + events. CCM templates are structure + rules.

Therefore:

- Legacy templates cannot be losslessly converted
- Migration is interpretive, not mechanical
- Some legacy data is intentionally discarded

## 4. Top-Level Mapping Overview

| Legacy Concept | CCM v1 Section | Notes |
| --- | --- | --- |
| baseSnapshot.nodes | structure | Flattened + normalized |
| baseSnapshot.rootIds | structure.root | Single root enforced |
| node hierarchy | structure.tree | Cycles forbidden |
| layout mutations | structure.layout | Static only |
| eventTimeline | motion | Only animation-safe events |
| metadata.title | metadata.name | Required |
| metadata.description | metadata.description | Optional |
| mode | metadata.engine | Engine-scoped |
| hardcoded values | params | Only if safe |
| preview/export flags | runtime | Whitelisted only |

## 5. Legacy → CCM: Metadata Mapping

Legacy:

```js
metadata: {
  title,
  description,
  tags,
  creator,
  pricing,
}
```

CCM:

```js
metadata: {
  id,              // generated at migration time
  version: "1.0.0",
  name: title,
  engine,          // derived from legacy mode
  author,          // optional
  license,         // defaulted
  description,
}
```

Rules:

- metadata.id is generated once
- Pricing, tags, thumbnails do not move into CCM
- Marketplace concerns live outside CCM

## 6. Structure Mapping

Legacy Snapshot:

- Nodes with mutable properties
- Arbitrary children arrays
- Possible cycles or orphan nodes

CCM Structure:

```js
structure: {
  root: string,
  nodes: [{ id, type }],
  tree: Record<string, string[]>,
  layout?: Record<string, string>
}
```

Rules:

- Exactly one root
- No cycles
- Node types must be mappable to CCM-known component types
- Layout must be static (no runtime layout mutation)
- Nodes relying on runtime mutation → non-convertible

## 7. Motion Mapping (Strict)

Legacy Events:

- node.create
- node.move
- node.resize
- animation.preview
- transition.preview
- arbitrary procedural effects

CCM Motion:

```js
motion: {
  timelines: {
    [name]: {
      duration,
      tracks: [{ target, property, keyframes }]
    }
  }
}
```

Rules:

- Only these legacy behaviors are convertible:
  - Property animations on:
    - opacity
    - translateX / translateY
    - scale
    - rotate
- Discarded during migration:
  - Interaction logic
  - Conditional transitions
  - Event-driven branching
  - Procedural animations
  - Preview-only effects
- If motion cannot be statically expressed → no migration

## 8. Params Mapping (Highly Conservative)

Legacy:

- Hardcoded text
- Inline colors
- Asset references
- Ad-hoc constants

CCM Params:

```js
params: {
  content,
  style,
  motion
}
```

Rules:

- Only safe, obvious variability becomes params
- Defaults must match legacy values
- No param may alter structure or motion topology
- No param inference if ambiguous

Example:

| Legacy Value | CCM Param |
| --- | --- |
| Title text | content.title.text |
| CTA label | content.cta.text |
| Accent color | style.accent.color |

If unsure → keep hardcoded

## 9. Runtime Mapping

Legacy:

- Preview flags
- Export settings
- Mode-specific toggles

CCM Runtime:

```js
runtime: {
  viewport,
  autoplay,
  loop,
  reducedMotionFallback,
  marketplaceSafe,
  export
}
```

Rules:

- Only whitelisted runtime flags allowed
- Defaults preferred over inference
- Legacy runtime behavior ≠ guaranteed parity

## 10. Non-Convertible Legacy Templates

A legacy template is explicitly non-convertible if it uses:

- Runtime layout mutation
- Conditional interactions
- Branching timelines
- Non-deterministic effects
- Editor-only constructs
- Procedural previews

These templates remain:

- Read-only
- Legacy-bound
- Excluded from CCM marketplace

## 11. Migration Strategy (Future)

When implemented, migration will be:

- Opt-in
- One-way
- Audited
- Validator-gated
- Non-destructive

No silent upgrades.

## 12. Invariants This Document Protects

- CCM immutability
- Replay determinism
- Marketplace trust
- AI / human parity
- No rewrite cycles

## 13. Final Note (Important)

This document exists so that future code is constrained, not empowered.

Migration code must obey this document, not reinterpret it.
