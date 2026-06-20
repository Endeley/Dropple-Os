# Mode Overlay Matrix

## Purpose

This matrix is the operating reference for canonical modes and their overlay relationships.

It answers:

- which workspace a mode belongs to
- what grammar it represents
- which overlays specialize it
- whether Inspector or Timeline are normally relevant
- whether the mode owns unique interaction authority

## Governing Rule

For every canonical mode:

`Unique Interaction Authority? -> No`

Modes may change grammar.
They may not own their own sovereign selection, drag, resize, delete, history, or memory systems.

## Capability Authority Reference

| Capability | Authority | Grammar Specific? |
| --- | --- | --- |
| Group | Shared Interaction | No |
| Merge | Mode Grammar | Yes |

See:

- [GROUPING_AND_MERGING_LAW.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/GROUPING_AND_MERGING_LAW.md)

## Matrix

| Workspace | Mode | Primary Grammar | Overlays | Inspector? | Timeline? | Unique Interaction Authority? | Canonical Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Design | uiux | Interface composition, layout, frame/text/image authoring | branding, themes, variants, icons, motion | Yes | Sometimes | No | uiux |
| Design | graphic | Visual composition, vector/image authoring | branding, icons, motion | Yes | Sometimes | No | graphic |
| Design | document | Structured document/page authoring | comments, review, motion | Yes | Sometimes | No | document |
| Media | animation | Motion, keyframes, transitions, sequences | motion-design, motion | Yes | Yes | No | animation |
| Media | video | Time-based clip/story editing | comments, review | Yes | Yes | No | video |
| Media | audio | Audio sequencing and waveform-oriented work | podcast | Yes | Yes | No | audio |
| Build | application | Application/service/module composition | ai-build, api | Yes | Sometimes | No | application |
| Build | logic | Logic graphs, workflows, state reasoning | state-machine | Yes | Sometimes | No | logic |
| Build | automation | Orchestration, integrations, codegen, automation flows | conversion, ai-build, api | Yes | Sometimes | No | automation |
| System | tokens | Variables, tokens, references, theming primitives | themes | Yes | Rarely | No | tokens |
| System | components | Reusable component systems and libraries | variants | Yes | Rarely | No | components |
| System | governance | Review, policy, version graph, approval, lineage | versioning | Yes | Rarely | No | governance |
| Collaborate | review | Review, comments, approvals, discussion | comments | Yes | Rarely | No | review |
| Collaborate | knowledge | Knowledge capture, explanation, guided learning | education, learning | Yes | Rarely | No | knowledge |
| Collaborate | production | Delivery, handoff, release, workflow coordination | publish, export, project-management | Yes | Sometimes | No | production |

## Overlay Notes

### Design overlays

- `branding` -> `graphic`
- `icons` -> `graphic`
- `themes` -> `tokens`, with Design-facing exposure in `uiux`
- `variants` -> `components`, with Design-facing exposure in `uiux`

### Media overlays

- `motion-design` -> `animation`
- `podcast` -> `audio`

### Build overlays

- `conversion` -> `automation`
- `ai-build` -> `automation`
- `api` -> `automation`
- `state-machine` -> `logic`

### System overlays

- `themes` -> `tokens`
- `variants` -> `components`
- `versioning` -> `governance`

### Collaborate overlays

- `comments` -> `review`
- `education` / `learning` -> `knowledge`
- `publish` / `export` / `project-management` -> `production`

## Surface Relevance Notes

### Inspector

`Inspector?` means:

This mode regularly produces inspectable artifact context.

It does not mean:

The inspector is always visible.

### Timeline

`Timeline?` means:

The grammar regularly creates time-authoring context.

It does not mean:

The timeline is always visible.

Timeline visibility still derives from context.

## Motion Law

Motion is a cross-mode capability.

Animation is the motion-primary grammar.

Therefore:

- a static `graphic` artifact may have no timeline
- an animated `graphic` artifact may become timeline-eligible
- a static `uiux` artifact may have no timeline
- an animated `uiux` artifact may become timeline-eligible
- `animation` remains the canonical deep motion grammar because time is fundamental to that mode

Timeline eligibility derives from time-authoring context, not from mode identity alone.

## Freeze Rule

If a future proposal adds a mode or overlay, this matrix must answer:

- canonical mode owner
- overlay or capability status
- whether it changes grammar
- whether it requires timeline relevance
- whether it attempts to introduce unique interaction authority

If the last answer is anything other than `No`, the proposal requires constitutional review first.
