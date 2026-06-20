# Mode Classification Audit

## Purpose

This document classifies current Dropple workspace, mode, and feature concepts against the constitutional stack.

It answers:

- what a concept is today
- what it should become
- which layer owns it
- which canonical mode should own it

This document is seeded from:

- [WORKSPACE_MODE_POLICY_EXECUTIVE.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/WORKSPACE_MODE_POLICY_EXECUTIVE.md)
- [MODE_STATUS_MATRIX.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/MODE_STATUS_MATRIX.md)
- [MODE_COLLAPSE_OVERLAY_MIGRATION_MAP.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/MODE_COLLAPSE_OVERLAY_MIGRATION_MAP.md)
- [WORKSPACE_MODE_OWNERSHIP_MAP.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/WORKSPACE_MODE_OWNERSHIP_MAP.md)

## Classification Rule

Do not classify by current UI shape.

Classify by constitutional owner.

## Matrix

| Name | Current Type | Should Be | Owner Layer | Canonical Owner | Migration Notes |
| --- | --- | --- | --- | --- | --- |
| Design | Workspace | Workspace | 2 container | Design | Keep as intent/workspace family, not application |
| Media | Workspace | Workspace | 2 container | Media | Keep as intent/workspace family, not application |
| Build | Workspace | Workspace | 2 container | Build | Keep as intent/workspace family, not application |
| System | Workspace | Workspace | 2 container | System | Keep as intent/workspace family, not application |
| Collaborate | Workspace | Workspace | 2 container | Collaborate | Keep as intent/workspace family, not application |
| uiux | Canonical mode | Canonical mode | 2 | uiux | First active premium grammar |
| graphic | Canonical mode | Canonical mode | 2 | graphic | Design expansion grammar; motion optional |
| document | Canonical mode | Canonical mode | 2 | document | Design grammar, not separate editor; motion optional |
| animation | Canonical mode | Canonical mode | 2 | animation | Media grammar with timeline relevance; motion-primary, not motion-sovereign |
| video | Canonical mode | Canonical mode | 2 | video | Media grammar with strong timeline relevance |
| audio | Canonical mode | Canonical mode | 2 | audio | Media grammar; base owner for podcast |
| application | Canonical mode | Canonical mode | 2 | application | Build grammar, not sovereign shell |
| logic | Canonical mode | Canonical mode | 2 | logic | Build grammar; base owner for state-machine |
| automation | Canonical mode | Canonical mode | 2 | automation | Build grammar; base owner for conversion and ai-build |
| tokens | Canonical mode | Canonical mode | 2 | tokens | System grammar; base owner for themes |
| components | Canonical mode | Canonical mode | 2 | components | System grammar; base owner for variants |
| governance | Canonical mode | Canonical mode | 2 | governance | System grammar; base owner for versioning |
| review | Canonical mode | Canonical mode | 2 | review | Collaborate grammar; base owner for comments |
| knowledge | Canonical mode | Canonical mode | 2 | knowledge | Collaborate grammar; base owner for education/learning |
| production | Canonical mode | Canonical mode | 2 | production | Collaborate grammar for workflow/handoff |
| branding | Mode-like / hide | Domain overlay | 4 | graphic | Preserve as brand-systems overlay, not sovereign mode |
| icons | Mode-like / hide | Domain overlay | 4 | graphic | Preserve as icon-systems overlay, not sovereign mode |
| motion-design | Mode-like / later | Domain overlay | 4 | animation | Motion-graphics specialization under animation |
| podcast | Mode-like / hide | Domain overlay | 4 | audio | Audio specialization, not separate authority |
| conversion | Feature / payload overlay | Cross-mode capability or domain overlay | 3/4 | automation | Keep conversion/codegen specialization under automation |
| ai-build | Feature / hide | Cross-mode capability | 3 | automation | Shared AI capability with automation exposure |
| education | Feature / payload overlay | Domain overlay | 4 | knowledge | Learning overlay under knowledge |
| versioning | System mode / freeze | Cross-mode capability | 3 | governance | Governance-owned capability, not sovereign interaction authority |
| themes | System mode / freeze | Domain overlay | 4 | tokens | Token-derived theme overlay |
| variants | System mode / later | Domain overlay | 4 | components | Component-derived overlay |
| state-machine | Build feature / later | Domain overlay | 4 | logic | State-machine specialization inside logic |
| api | Build feature / hide | Domain overlay | 4 | automation | API/integration specialization under automation |
| comments | Collaborate feature / hide | Cross-mode capability | 3 | review | Review capability usable across modes |
| project-management | Collaborate feature / hide | Cross-mode capability | 3 | production | Production/workflow capability, not mode |
| learning | Knowledge-like overlay | Domain overlay | 4 | knowledge | Alias/expression of education overlay |
| motion | Capability concept | Cross-mode capability | 3 | world/shared | Motion may attach across modes when time becomes relevant; animation expands it into a full grammar |
| search | Shared feature | Cross-mode capability | 3 | world/shared | Shared capability across world and modes |
| publish | Surface / action | Cross-mode capability | 3 | production | Publishing should not become a separate editor |
| export | Shared feature | Cross-mode capability | 3 | production | Shared capability across multiple grammars |
| templates | Shared system | Cross-mode capability | 3 | world/shared | Shared substrate, not mode |
| inspector | Panel | View / panel | 5 | surface | Surface only; visibility derives from context |
| timeline | Panel | View / panel | 5 | surface | Surface only; visibility derives from time-authoring context |
| navigator | Panel | View / panel | 5 | surface | Surface only; never authority |
| minimap | Panel/control | View / panel | 5 | surface | Surface only; never authority |

## Canonical Notes

### Canonical Modes

The canonical set is:

- `uiux`
- `graphic`
- `document`
- `animation`
- `video`
- `audio`
- `application`
- `logic`
- `automation`
- `tokens`
- `components`
- `governance`
- `review`
- `knowledge`
- `production`

### Motion Law

Motion is a cross-mode capability.

Animation is a motion-primary grammar.

This means:

- `uiux` may stay primarily spatial while still attaching motion
- `graphic` may stay primarily spatial while still attaching motion
- `document` may stay primarily structural while still attaching motion
- `animation` specializes motion into advanced time authoring rather than owning motion platform-wide

### Non-Canonical Concepts

The following should default away from sovereign mode status:

- `branding`
- `icons`
- `motion-design`
- `podcast`
- `conversion`
- `ai-build`
- `education`
- `versioning`
- `themes`
- `variants`
- `state-machine`
- `api`
- `comments`

## Migration Rule

For every non-canonical concept, decide:

1. Cross-mode capability?
2. Domain overlay?
3. View/panel only?

Do not default to:

new workspace
new sovereign mode
new interaction authority
