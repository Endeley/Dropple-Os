# Constitutional Stack v1

## Purpose

This document freezes the constitutional stack for Dropple growth.

It answers:

- where a feature is allowed to live
- what layer may own behavior
- what must never become mode-owned or workspace-owned

This document sits above:

- [WORLD_AUTHORITY_AUDIT.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/WORLD_AUTHORITY_AUDIT.md)
- [MODE_CLASSIFICATION_AUDIT.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/MODE_CLASSIFICATION_AUDIT.md)
- [MODE_OVERLAY_MATRIX.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/MODE_OVERLAY_MATRIX.md)

See also:

- [GROUPING_AND_MERGING_LAW.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/GROUPING_AND_MERGING_LAW.md)

## Ordering Rule

Authority before taxonomy.

Taxonomy before implementation.

Implementation before optimization.

## Constitutional Laws

### Law 1

`5 Workspaces != 5 Applications`

Workspaces answer:

Why am I here?

They do not answer:

Which editor am I using?

### Law 2

`15 Modes != 15 Editors`

Modes answer:

What grammar am I working in?

They do not answer:

Which runtime owns behavior?

### Law 3

`Overlays != Authorities`

Overlays answer:

How is this grammar specialized?

They do not answer:

Who owns selection, drag, delete, history, or memory?

### Law 4

`Unique Interaction Authority? -> No`

For every canonical mode.

No canonical mode may own its own sovereign:

- selection system
- drag system
- resize system
- delete system
- navigation system
- history system
- memory system

### Law 5

`Motion is a cross-mode capability.`

`Animation is a motion-primary grammar.`

Motion may exist in any mode when time becomes relevant to the work.

Animation does not own motion as a platform capability.

Animation is the canonical mode that expands motion into a deeper grammar:

- sequencing
- timing
- choreography
- keyframes
- tracks
- motion systems

## Layer 0 — Project World

Owns:

- Home
- History
- Memory
- Navigation
- Artifacts
- Relationships
- Selection
- Focus

Rules:

- every mode inherits this layer
- nothing above this layer may redefine these truths
- modes may interpret artifacts, but may not own artifact truth

## Layer 1 — Shared Interaction Authorities

Owns:

- Select
- Multi-select
- Drag
- Resize
- Pan
- Zoom
- Delete
- Duplicate
- Group
- Ungroup
- Context Menu

Rules:

- universal across modes
- mode-specific surfaces may invoke these interactions
- mode-specific runtimes may not fork these authorities without explicit constitutional change

See also:

- [WORLD_AUTHORITY_AUDIT.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/WORLD_AUTHORITY_AUDIT.md)
- [GROUPING_AND_MERGING_LAW.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/GROUPING_AND_MERGING_LAW.md)

Notes:

- Group belongs to Shared Interaction Authority.
- Grouping is a platform structural relationship, not a mode-specific tool.

## Layer 2 — Canonical Modes

These define:

- grammar
- artifact meaning
- authoring vocabulary

They do not define:

- runtime authority
- selection truth
- drag truth
- delete truth
- history truth
- memory truth

See also:

- [GROUPING_AND_MERGING_LAW.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/GROUPING_AND_MERGING_LAW.md)

Notes:

- Merge behavior is grammar-owned.
- Merge may exist in a mode only when the grammar explicitly defines it.

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

## Layer 3 — Cross-Mode Capabilities

These work across multiple modes and should not become sovereign modes by default.

Examples:

- comments
- versioning
- ai-build
- motion
- search
- translate
- publish
- export
- review workflows

Rules:

- may attach to many modes
- may surface through inspectors, context menus, timelines, or panels
- may not own Layer 0 or Layer 1 behavior

## Layer 4 — Domain Overlays

These specialize one or more canonical modes.

Examples:

- branding
- icons
- podcast
- motion-design
- state-machine
- themes
- variants
- conversion
- education

Rules:

- overlays may change vocabulary, exposure, and specialization
- overlays may not become independent interaction authorities
- overlays belong under one or more canonical owners

## Layer 5 — Views & Panels

These are surfaces, not authorities.

Examples:

- Inspector
- Timeline
- Minimap
- Navigator
- Review Panel
- Knowledge Panel
- Comments Panel

Rules:

- views expose context
- views do not own behavior
- capability is not the same thing as surface

## Canonical Growth Rule

When a new feature is proposed, ask in order:

1. Is this Project World behavior?
2. Is this Shared Interaction behavior?
3. Is this a Canonical Mode grammar?
4. Is this a Cross-Mode Capability?
5. Is this a Domain Overlay?
6. Is this only a View or Panel?

Do not ask first:

- new workspace?
- new application?
- new sovereign mode?

## Examples

### `podcast`

Should be:

Domain Overlay

Canonical owner:

`audio`

### `comments`

Should be:

Cross-Mode Capability

Canonical owner:

`review`

### `themes`

Should be:

Domain Overlay or System capability

Canonical owner:

`tokens`

### `variants`

Should be:

Domain Overlay or System capability

Canonical owner:

`components`

### `branding`

Should be:

Domain Overlay

Canonical owner:

`graphic`

### `icons`

Should be:

Domain Overlay

Canonical owner:

`graphic`

## Frozen Principle

Dropple growth should converge toward:

`Project World -> Interaction Authorities -> Canonical Modes -> Capabilities/Overlays -> Views`

Not:

`Workspace -> Editor -> Canvas -> Separate Runtime`
