# Media Workspace Plan

This document defines a safe plan for introducing a unified `Media Workspace` into Dropple without breaking layer law, truth boundaries, or reducer ownership.

Use it as an implementation plan, not as a speculative product pitch.

## Mission

Create one shared `Media Workspace` that can host:

- `animation`
- `video`
- `podcast`

through a common workspace shell and shared media infrastructure.

The goal is not to collapse all media workflows into one flat screen.

The goal is to unify shared media systems while preserving mode-specific tools and policies.

## Constitutional Constraints

This plan must obey the current repo law defined in:

- `core/architecture/LAYER_CONTRACTS.md`
- `architecture/TRUTH_BOUNDARIES.md`

Non-negotiable rules:

- only dispatcher-driven reducers may mutate canonical truth
- runtime may evaluate truth but must not bypass dispatcher
- projection/selectors are read-only
- UI must not import runtime internals directly outside approved bridge zones
- workspaces define policy and configuration, not engines
- plugins and AI must act through capability and event surfaces

Media features must fit the existing pipeline:

`intent -> event -> dispatcher -> reducers -> canonical truth -> runtime evaluation -> projection -> UI`

## Product Model

`Media Workspace` should be one workspace with multiple modes:

- `animation`
- `video`
- `podcast`

Each mode should share:

- project shell
- browser and inspector layout
- timeline transport
- export entry surface
- capability gating

Each mode may specialize:

- tools
- track types
- panels
- inspector sections
- export presets

## Why A Unified Media Workspace

The current codebase already has shared media-adjacent systems:

- `runtime/animation/**`
- `runtime/timeline/**`
- `runtime/export/**`
- `workspaces/registry/videoWorkspace.js`
- `workspaces/registry/podcastWorkspace.js`
- `workspaces/registry/animationWorkspace.js`

This means Dropple already has enough overlap in:

- time
- playback
- track-like editing
- export
- structured runtime evaluation

to justify one shared workspace surface.

Keeping separate top-level workspaces too early would duplicate:

- timeline shells
- playback controls
- asset browsers
- export flows
- workspace activation rules

## Core Philosophy

Media in Dropple should be modeled as structured systems, not loose editor state.

That means:

- scenes, clips, audio cues, camera state, and effects belong to canonical truth where appropriate
- playback state, previews, waveform caches, and render caches remain derived runtime state
- UI chooses tools and mode views, but does not own media truth
- media exports are products of canonical truth plus runtime evaluation, never a second truth source

The workspace should feel like one environment, but the architecture must remain layered.

## Scope Boundaries

### In Scope For V1

- unified `Media Workspace` shell
- media mode switcher
- shared timeline transport and playback surface
- shared project or asset browser surface
- shared export entrypoint
- animation mode wired to existing animation and timeline systems
- video mode as a timeline and export specialization
- podcast mode as an audio and marker specialization

### Explicitly Out Of Scope For V1

- full character rig runtime
- full camera runtime
- choreography runtime
- production-grade audio editing suite
- advanced effects runtime
- deep sequence production management
- major folder rewrites across the whole repo

These can come later only after the unified workspace shell is stable.

## Target Architecture Fit

The long-term target can support these media runtime domains:

- `runtime/scene`
- `runtime/timeline`
- `runtime/animation`
- `runtime/audio`
- `runtime/camera`
- `runtime/fx`
- `runtime/export`

Potential future domains:

- `runtime/rig`
- `runtime/choreography`
- `runtime/media`

But V1 should not introduce all of them at once.

V1 should reuse existing systems and add only the minimum new surfaces required to unify the workspace.

## Ownership Model

### Kernel Ownership

Media features that become canonical truth must flow through event reducers.

Likely truth slices over time:

- `document.motion`
- `timeline`
- mode-specific document media metadata if introduced later

Any new media truth slice must have:

- explicit reducer ownership
- dispatch-driven mutation only
- replay and determinism coverage

### Runtime Ownership

Runtime owns derived media execution state, such as:

- playback cursor
- preview state
- waveform caches
- render caches
- evaluated animation frames
- temporary export previews

These are derived and must not become persisted truth by accident.

### Projection Ownership

Projection and selectors expose read-only media views:

- active timeline state
- selected track summaries
- playback and mode state
- export-readiness indicators
- visible browser collections

UI must consume these through selectors and bridges, not runtime internals.

### Workspace Ownership

`Media Workspace` owns:

- mode selection policy
- capability set
- tool availability
- panel availability
- workspace-specific UI composition

It must not own:

- animation engine logic
- timeline engine logic
- reducer logic
- canonical runtime stores

## V1 Runtime Strategy

### Reuse Existing Systems

Use current systems first:

- `runtime/animation/**`
- `runtime/timeline/**`
- `runtime/export/**`
- `runtime/projection/**`
- `platform/workspaces/**`

Avoid building a new `runtime/media/**` domain until shared needs become concrete.

### Minimal New Runtime Additions

Allow only narrowly scoped additions in V1, for example:

- media-mode selectors
- transport selectors
- mode-aware export facades
- audio marker helpers if needed

Do not create deep new runtimes unless a clear subsystem boundary already exists.

## V1 UI Strategy

V1 should introduce a workspace shell, not a giant feature surface.

Suggested shape:

- `ui/workspace/media/MediaWorkspaceShell.jsx`
- `ui/workspace/media/MediaModeSwitcher.jsx`
- `ui/workspace/media/shared/MediaTimelinePanel.jsx`
- `ui/workspace/media/shared/MediaBrowserPanel.jsx`
- `ui/workspace/media/shared/MediaInspectorPanel.jsx`
- `ui/workspace/media/animation/**`
- `ui/workspace/media/video/**`
- `ui/workspace/media/podcast/**`

Mode-specific UI should remain thin adapters over shared shell infrastructure.

## Mode Definition

### Animation Mode

V1 supports:

- scene stage access
- keyframe and playback workflows
- animation preview
- animation export entry

Should reuse:

- `runtime/animation/**`
- `runtime/timeline/**`

Must not assume:

- rig runtime
- choreography runtime
- camera runtime

### Video Mode

V1 supports:

- timeline-oriented sequencing shell
- clip or track organization surface
- shared export path
- marker and transport workflow

Should reuse:

- timeline
- export
- playback

Should not initially promise:

- advanced non-linear editing parity
- full compositing stack

### Podcast Mode

V1 supports:

- audio-oriented timeline view
- markers and cue points
- basic track organization
- export surface

Should not initially promise:

- DAW-grade editing
- full waveform editing pipeline

## Phased Implementation

### Phase 1: Workspace Unification

Goal:

- create one canonical media workspace entry

Deliverables:

- media workspace definition
- mode switcher
- shared shell
- shared timeline transport UI
- shared export entrypoint
- platform workspace registration

Rules:

- no new truth slices unless absolutely necessary
- prefer policy and projection composition over new engines

### Phase 2: Shared Media UX

Goal:

- make the workspace usable across the three modes

Deliverables:

- shared browser
- shared inspector structure
- mode-aware panels
- projection selectors for media mode, playback, and export state

Rules:

- UI reads through selectors and bridges only
- mode-specific local UI state must remain local

### Phase 3: Media-Specific Depth

Goal:

- deepen each mode without splitting architecture

Possible additions:

- podcast cue model
- video clip model
- richer animation track controls
- export presets per mode

Rules:

- each new truth slice requires reducer ownership and tests
- each new runtime cache requires derived-cache discipline

### Phase 4: Advanced Media Domains

Only after proven need:

- `runtime/audio`
- `runtime/camera`
- `runtime/fx`
- `runtime/rig`
- possibly `runtime/choreography`

Rules:

- introduce one runtime domain at a time
- enforce import boundaries before broad adoption

## File Strategy

### Recommended First Additions

- `platform/workspaces/mediaWorkspace.js`
- `ui/workspace/media/MediaWorkspaceShell.jsx`
- `ui/workspace/media/MediaModeSwitcher.jsx`
- `ui/workspace/media/shared/**`

### Compatibility Strategy

Keep existing workspace definitions during migration:

- `animationWorkspace`
- `videoWorkspace`
- `podcastWorkspace`

Then either:

- re-route them into `Media Workspace` modes
- or preserve them as compatibility aliases

Do not delete old workspace entrypoints until:

- mode routing is stable
- tests are updated
- workspace activation law still passes

## Required Guardrails

Before and during implementation, keep these gates green:

- `npm run arch`
- `npm run test:architecture`
- `npm run architecture:ci`
- `npm run architecture:drift`

When implementation begins, add targeted tests for:

- media workspace activation and mode routing
- non-workspace modules not importing workspace registry internals
- non-bridge UI modules not importing media runtime internals directly
- projection-only media reads from UI surfaces

If new canonical truth is added, also add:

- reducer ownership tests
- replay equivalence or determinism tests

## Anti-Patterns To Avoid

- do not create a monolithic `mediaRuntime` that owns unrelated concerns
- do not let workspace files become engine owners
- do not let UI panels import deep runtime internals directly
- do not store previews or caches in persisted document truth
- do not build rig, camera, audio, fx, and choreography runtimes in one wave
- do not duplicate timeline logic across animation, video, and podcast modes

## Recommended V1 Success Criteria

V1 is successful if all of the following are true:

- Dropple has one canonical `Media Workspace`
- users can switch between `animation`, `video`, and `podcast` modes inside it
- shared playback and timeline transport are unified
- export entry is unified
- current architecture law remains green
- no new illegal truth or import boundaries are introduced

V1 is not required to deliver:

- full animation production parity
- full video editor parity
- full podcast production parity

## Final Recommendation

Build `Media Workspace` as an umbrella workspace with specialized modes.

Do not build three isolated media products.
Do not build a giant all-in-one runtime.

Use the current Dropple strengths:

- deterministic runtime
- scene and timeline foundations
- export infrastructure
- platform-owned workspace activation
- architecture law enforcement

The correct order is:

1. unify workspace shell
2. unify mode routing
3. unify shared transport and export surfaces
4. deepen individual media modes
5. only then introduce advanced runtime domains
