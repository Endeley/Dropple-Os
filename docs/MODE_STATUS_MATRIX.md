# Mode Status Matrix

## Purpose

This document is the compact operational status matrix for all Dropple workspaces and modes.

It answers five questions for every mode:

- which workspace it belongs to
- what the mode is
- whether it is `do now`, `freeze`, `hide`, or `later`
- why it has that status
- which files or directories currently own it

This document is a build-policy companion to:
- `docs/WORKSPACE_MODE_BUILD_POLICY.md`
- `docs/WORKSPACE_MODE_POLICY_EXECUTIVE.md`
- `docs/WORKSPACE_MODE_OWNERSHIP_MAP.md`

## State Definitions

- `Do Now`: active build target
- `Freeze`: stable substrate or constitutional surface; build above it, not casually inside it
- `Hide`: not ready for broad product exposure
- `Later`: valid roadmap target, but blocked on substrate, flagship quality, or workflow closure

## Matrix

| Workspace | Mode | State | Reason | Owning Files / Directories |
| --- | --- | --- | --- | --- |
| Design | UI / UX Design | Do Now | First premium design workflow; closest to template pipeline closure and end-to-end productization | `ui/workspace/ux/`, `templates/`, `ui/workspace/editor/`, `app/workspace/new/`, `app/marketplace/template/[id]/` |
| Design | Graphic Design | Later | Valid design expansion, but should follow UIUX closure | `ui/workspace/ux/`, future Design-specific panels/surfaces under `ui/workspace/ux/` |
| Design | Branding | Hide | Too easy to expose as shell-only without real identity workflows | Design-owned future surface under `ui/workspace/ux/` |
| Design | Icon Design | Hide | Depends on stronger vector/system primitive workflows | Design-owned future surface under `ui/workspace/ux/` |
| Design | Document / Print | Later | Legitimate mode, but should come after UIUX and template/install closure | `ui/workspace/ux/`, export/template substrate |
| Design | Light Design System Authoring | Freeze | Light support may exist in Design, but deep reusable system truth belongs in System | `ui/workspace/ux/`, `ui/workspace/ux/panels/`, boundary with `ui/workspace/system/` |
| Media | Animation / Cartoon | Do Now | Strongest Media substrate; should remain motion-depth benchmark | `ui/workspace/media/animation/`, `ui/workspace/media/shared/`, `ui/workspace/media/`, `runtime/animation/` |
| Media | Motion Design | Later | Valid motion-heavy expansion, but should build on shared animation/timeline substrate after template motion roundtrip closure | `ui/workspace/media/`, `ui/workspace/media/shared/`, future motion-design surface |
| Media | Video Editing | Later | Important mode, but not before stronger reuse/template/install closure | `ui/workspace/media/shared/`, `ui/workspace/media/inspector/video/` |
| Media | Podcast / Audio | Hide | Weaker current substrate than animation; should not compete for focus yet | `ui/workspace/media/shared/`, `ui/workspace/media/inspector/podcast/` |
| Build | Application Builder | Later | Important workspace target, but should follow Design/UIUX closure and stronger reusable install/build flow | `engine/compiler/`, `platform/workspaces/`, future Build surfaces |
| Build | Data & Logic | Freeze | Keep infrastructure-first; do not over-productize before flagship builder flow exists | `engine/compiler/`, runtime/build substrate |
| Build | State Machines | Later | Strong substrate potential, but not yet the next flagship product surface | Build/runtime logic substrate, future Build surfaces |
| Build | API / Integration | Hide | Do not expose broadly until Build has a stronger product center | Future Build-owned API/integration surface |
| Build | AI-assisted Building | Hide | AI should remain a platform system first, not a premature pseudo-workspace mode | Shared AI/platform system, later Build exposure |
| System | Design Tokens | Freeze | One of the strongest completed constitutional subsystems | `runtime/tokens/`, `ui/workspace/system/`, `ui/hooks/useToken.js`, `ui/bridges/tokenCssBridge.js` |
| System | Component Libraries | Later | Next serious System target after Design/UIUX and template flow close | `ui/workspace/system/`, future component governance/runtime files |
| System | Variants | Later | Should rise together with components, not as a shallow separate feature | `ui/workspace/system/`, future variant governance/runtime files |
| System | Theming | Freeze | Stable on top of token truth; should not be casually reworked | `runtime/tokens/`, `runtime/stores/useRuntimeStore.js`, `ui/workspace/system/` |
| System | Versioning | Freeze | Governance stack is mature; build above it, not inside it casually | `runtime/tokens/`, `ui/workspace/system/TokenVersionGraphPanel.jsx`, `ui/workspace/system/TokenVersionDiffPanel.jsx`, `ui/workspace/system/TokenMergePreviewPanel.jsx`, `ui/workspace/system/TokenReviewPanel.jsx` |
| Collaborate | Review | Later | Real enough to build on, but not the immediate top product priority | Collaborate-facing review surfaces, existing review workflow substrate |
| Collaborate | Comments | Hide | Too easy to expose as weak collaboration chrome without strong truth/workflow | Future Collaborate-owned surface only |
| Collaborate | Project Management | Hide | Should not compete with core creation-system work until grounded in actual production truth | Future Collaborate-owned surface only |
| Collaborate | Production | Hide | Should appear only when asset/scene/workflow handoff is concrete | Future Collaborate-owned production/workflow surface |
| Collaborate | Knowledge | Hide | Keep lightweight until it has a dedicated truth model | Future Collaborate-owned knowledge surface |

## Cross-Workspace Notes

The following are not standalone workspaces and must remain shared systems:

| System | Status | Owning Files / Directories |
| --- | --- | --- |
| Templates | Active shared substrate | `templates/`, `engine/templates/`, `domain/templates/`, `app/api/templates/certified/`, `ui/registry/` |
| Motion Runtime | Active shared substrate | `runtime/animation/`, Media authoring surfaces, shared runtime/execution paths |
| Export / Compiler | Active shared substrate | `engine/compiler/`, `engine/export/` |
| Workspace Taxonomy | Freeze | `platform/workspaces/canonicalRegistry.js`, `platform/workspaces/modeResolution.js` |
| Capability Layer | Freeze | `runtime/workspaces/workspaceCapabilities.js`, `ui/workspace/capabilities/capabilityRegistry.js` |

## Immediate Execution Focus

Current repo focus should remain:

1. Close template pipeline end to end
2. Make `Design / UIUX` the first premium closed workflow
3. Keep `Media / Animation` as motion-depth benchmark
4. Preserve `System / Tokens + Theming + Versioning` as frozen infrastructure
5. Hide immature modes until they pass the readiness gate

## Promotion Rule

A mode must not move to `Do Now` unless it has:

- canonical taxonomy
- lawful routing
- capability exposure
- deterministic boot contract
- reducer-owned truth where needed
- projection selectors before UI logic
- one real primary workflow
- at least one architecture or kernel test
- at least one end-to-end test
- no duplicate legacy path

Modes that fail this rule must stay `Hide`, `Freeze`, or `Later`.
