# Workspace Strategy

This document defines Dropple's workspace strategy at the current codebase stage.

It turns the repo from a collection of workspace definitions into a clear platform plan.

Use it as the product and architecture strategy for workspace growth.

It must remain compatible with:

- `core/architecture/LAYER_CONTRACTS.md`
- `architecture/TRUTH_BOUNDARIES.md`
- `architecture/MIGRATION_PLAN.md`
- `architecture/MEDIA_WORKSPACE_PLAN.md`

## Core Position

Dropple should not grow as many disconnected tools.

Dropple should grow as a deterministic creation platform with a small number of flagship workspace families built on one shared core.

That means:

- workspaces define policy, tools, panels, and capability routing
- runtimes define behavior
- reducers mutate canonical truth
- projection and selectors expose read-only views
- UI renders and emits intents

This is the non-negotiable law:

`intent -> event -> dispatcher -> reducers -> canonical truth -> runtime evaluation -> projection -> UI`

## Strategic Goal

Formalize Dropple-OS as a creation operating system with a few deep workspace families instead of many shallow top-level products.

The platform should ultimately support:

- visual product creation
- media creation
- application or system creation
- design system creation
- domain-focused creation environments such as education

## Workspace Family Model

Dropple should be organized into workspace families.

A workspace family may contain:

- one flagship workspace
- multiple modes
- multiple specializations

Families should share the same kernel, runtime, capability, projection, and UI laws.

## Flagship Workspace Families

### 1. Visual Product Family

Definition:

A visual environment for designing interfaces, layouts, interactions, and product structure.

What it serves:

- product designers
- UI and UX designers
- startups
- frontend-oriented teams
- creators building websites, dashboards, apps, and design systems

Core responsibilities:

- visual composition
- structural UI authoring
- layout and styling
- interaction and stateful design
- design-to-code pathways
- componentized product structure

Current codebase fit:

- `runtime/scene/**`
- `runtime/layout/**`
- `runtime/interactions/**`
- `runtime/projection/**`
- `engine/compiler/**`
- `engine/compiler/designSystem/**`
- `workspaces/registry/uiuxWorkspace.js`
- `workspaces/registry/graphicWorkspace.js`

Current status:

- strongest existing flagship family
- should remain the main front door to Dropple

Recommended workspace definitions under this family:

- `uiux`
- `graphic`
- later specializations for product prototyping, responsive layout, and structured interaction design

### 2. Media Family

Definition:

A unified workspace family for time-based storytelling and production.

This family should be introduced as one workspace with multiple modes, not as separate products with separate engines.

Primary umbrella:

- `Media Workspace`

Modes:

- `Animation Mode`
- `Video Mode`
- `Podcast Mode`

What it serves:

- motion designers
- animators
- video creators
- podcasters
- explainer creators
- educators
- narrative and content teams

Core responsibilities:

- timeline-based creation
- playback and transport
- media sequencing
- animation and motion
- audio and narrative timing
- export to distributable media outputs

Current codebase fit:

- `runtime/timeline/**`
- `runtime/animation/**`
- `runtime/export/**`
- `runtime/scene/**`
- `workspaces/registry/animationWorkspace.js`
- `workspaces/registry/videoWorkspace.js`
- `workspaces/registry/podcastWorkspace.js`

Current status:

- strong shared technical foundation exists
- product unification is not yet implemented

#### Media Workspace

Definition:

The shared workspace shell for all media creation in Dropple.

What it serves:

- users who need one environment for timeline-based storytelling
- creators who may move between animation, video, and podcast workflows in one project ecosystem

What it owns:

- mode policy
- tools and panels per mode
- browser and inspector composition
- shared transport surface
- shared export entry

What it must not own:

- timeline runtime logic
- animation runtime logic
- export runtime logic
- canonical truth stores

#### Animation Mode

Definition:

A media mode focused on scene-based motion, timing, and visual storytelling.

What it serves:

- animators
- motion designers
- explainer creators
- stylized storytellers

V1 focus:

- scene stage
- keyframes
- timeline playback
- simple motion systems
- media export

Future depth:

- rigs
- pose systems
- camera direction
- choreography
- FX emphasis

#### Video Mode

Definition:

A media mode focused on clip sequencing, overlays, transitions, and timeline-driven visual assembly.

What it serves:

- video creators
- editors
- social content teams
- educational and product marketing teams

V1 focus:

- shared timeline shell
- clip or segment organization
- overlays and markers
- export presets

Future depth:

- richer clip editing
- transitions
- layered compositions
- camera and shot workflows where needed

#### Podcast Mode

Definition:

A media mode focused on audio narrative timing, cue points, and sequence-based spoken or sound content.

What it serves:

- podcasters
- voice creators
- educational media teams
- dialogue-driven storytellers

V1 focus:

- timeline markers
- cue points
- simple audio-oriented track views
- export flow

Future depth:

- waveform tooling
- richer audio runtime
- dialogue, music, and SFX layering

### 3. Developer Family

Definition:

A workspace family for building applications and systems visually and structurally.

What it serves:

- developers
- startups
- technical product teams
- no-code or low-code builders

Core responsibilities:

- navigation
- state modeling
- interaction logic
- app structure
- data and integration-oriented flows
- compile and deploy pathways

Current codebase fit:

- `runtime/navigation/**`
- `runtime/stateMachines/**`
- `engine/compiler/application/**`
- `engine/compiler/pipeline/**`
- `workspaces/registry/devWorkspace.js`

Current status:

- foundation exists
- deeper product workflow is still needed

Recommended workspace definitions under this family:

- `dev`
- later app-builder and system-builder specializations if needed

### 4. System Design Family

Definition:

A workspace family for creating reusable systems, component libraries, tokens, themes, and structured reusable assets.

What it serves:

- enterprise teams
- product system owners
- design system teams
- component library maintainers

Core responsibilities:

- component systems
- design tokens
- themes and variants
- reusable patterns
- system-level asset generation

Current codebase fit:

- `engine/compiler/designSystem/**`
- `engine/compiler/generators/**`
- `workspaces/registry/materialWorkspace.js`
- `workspaces/registry/brandingWorkspace.js`
- parts of `uiux`

Current status:

- strong technical compiler foundation
- product workspace identity still needs to be elevated

Recommended workspace definitions under this family:

- `design-system`
- `branding`
- `material`

Note:

This family may begin as a strong specialization inside the Visual Product Family before becoming its own flagship identity.

### 5. Education Family

Definition:

A domain-focused workspace family for learning content, lesson flows, explainers, and educational storytelling.

What it serves:

- educators
- course creators
- schools
- training teams
- instructional designers

Core responsibilities:

- educational narratives
- lesson structures
- explainers
- guided visual content
- reusable teaching assets

Current codebase fit:

- `workspaces/registry/educationWorkspace.js`
- `education/**`
- overlap with visual and media foundations

Current status:

- valid vertical opportunity
- should be treated as a domain specialization built on top of core visual and media systems

Recommended workspace definitions under this family:

- `education`
- later lesson-builder or explainer specializations if validated

## Specialization Workspaces

These should remain defined, but they should usually behave as specializations, policy profiles, or capability bundles rather than separate flagship product families.

Current candidates:

- `branding`
- `review`
- `translate`
- `conversion`
- `document`
- `icon`
- `material`
- `ai`

Guidance:

- keep them if they unlock concrete workflows
- do not treat each as a separate engine or product universe
- route them through shared platform/runtime systems

## What Merges

These should merge into a shared umbrella or family model.

### Merge Into Media Family

- `animation`
- `video`
- `podcast`

Reason:

- all are time-based media creation modes
- all should reuse one timeline runtime
- all should share transport, browser, export, and shell infrastructure

### Merge Into Visual Or System Design Family As Needed

- `branding`
- `material`
- parts of `graphic`

Reason:

- these are better treated as structured specializations over shared visual and design-system foundations

## What Stays Separate

These should remain distinct families or strong standalone workspace identities.

### Keep Distinct

- `uiux` or visual product creation
- `dev` or application and system creation
- `education` as a domain vertical if validated

### Keep Separate At The Runtime Level

Even when workspaces merge, these runtime domains must remain behavior-owning and separate:

- `runtime/scene`
- `runtime/layout`
- `runtime/timeline`
- `runtime/animation`
- `runtime/navigation`
- `runtime/stateMachines`
- `runtime/export`
- future:
  - `runtime/audio`
  - `runtime/camera`
  - `runtime/fx`
  - `runtime/rig`
  - `runtime/choreography`

## What Is Core

These are platform-level systems that should be deepened when multiple workspace families depend on them.

### Kernel Core

- event system
- dispatcher
- reducer ownership
- replay
- persistence

### Runtime Core

- scene runtime
- layout runtime
- timeline runtime
- animation runtime
- interaction runtime
- navigation runtime
- state machine runtime
- export runtime

### Platform Core

- capability system
- workspace registry and activation
- plugin host
- collaboration platform

### Projection Core

- selectors
- runtime projection surfaces
- read-only UI bridges

### Compiler Core

- application compiler
- layout compiler
- design system compiler
- export generation infrastructure

## What Is Subsystem

These should deepen only when a flagship family proves the need.

- `runtime/audio`
- `runtime/camera`
- `runtime/fx`
- `runtime/rig`
- `runtime/choreography`
- production hierarchy manager
- sequence or shot manager
- advanced clip management
- advanced waveform tooling

Guiding rule:

build a subsystem deeply only when at least one flagship family has a clear product reason for it.

## Exact Build Order Across The Repo

This is the recommended implementation order from the current repo state.

### Phase 0: Preserve Platform Integrity

Do first:

- keep `npm run arch` green
- keep architecture tests green
- keep determinism and validation green
- avoid broad structural churn without a product payoff

Purpose:

- protect the hardened platform before adding new workspace depth

### Phase 1: Workspace Rationalization

Define the workspace map clearly in code and docs.

Do:

- classify current workspaces into families, specializations, and compatibility entries
- keep current registry entries working while introducing the new family model
- update workspace strategy docs as the canonical plan

Purpose:

- reduce future workspace sprawl
- prevent duplicate product directions

### Phase 2: Media Family Unification

This is the next major implementation move.

Do:

- add `platform/workspaces/mediaWorkspace.js`
- create `ui/workspace/media/MediaWorkspaceShell.jsx`
- create `ui/workspace/media/MediaModeSwitcher.jsx`
- create shared panels for:
  - transport
  - timeline
  - browser
  - inspector
- keep `animation`, `video`, and `podcast` as compatibility aliases or routed entries during migration

Purpose:

- unify media creation without duplicating engines

### Phase 3: Animation Mode First

Animation should be the first deep mode under Media Workspace.

Do:

- wire current animation and timeline foundations into the shared media shell
- expose animation mode tools and projections
- support:
  - scene stage
  - playback
  - keyframes
  - export

Purpose:

- deliver the first real media workflow using current strengths

### Phase 4: Video Mode

Do:

- create video-oriented projections over the shared media shell
- add clip or segment-oriented panels
- add mode-specific export and markers

Purpose:

- expand media family without introducing a second timeline engine

### Phase 5: Podcast Mode

Do:

- add audio-oriented timeline views
- add markers and cue-point workflows
- add mode-specific export behavior

Purpose:

- complete the first unified media family without fragmenting architecture

### Phase 6: Developer Family Deepening

Do:

- deepen app-building flows
- expose stronger navigation and state-machine authoring
- connect compile and deploy flows more directly to the workspace experience

Purpose:

- turn Dropple into a stronger application and system builder

### Phase 7: System Design Family Elevation

Do:

- formalize design-system workspace identity
- deepen component, token, theme, and variant workflows
- align visual and system-design families where beneficial

Purpose:

- grow enterprise and reuse value on top of existing compiler strengths

### Phase 8: Shared Collaboration Depth

Do:

- deepen review, presence, comments, sync, and project coordination across families

Purpose:

- amplify all flagship families instead of creating isolated collaboration behavior

### Phase 9: New Subsystems Only When Proven

Only after the above:

- add `runtime/audio`
- add `runtime/camera`
- add `runtime/fx`
- add `runtime/rig`
- later consider `runtime/choreography`

Purpose:

- add complexity only when real workspace depth justifies it

## Media Family Build Order

The media-specific order must remain disciplined.

Do not build all media subsystems at once.

Build in this order:

1. Media Workspace Shell
2. Shared transport and shared timeline UI
3. Animation Mode
4. Video Mode
5. Podcast Mode
6. canonical channel-based motion truth hardening
7. advanced media runtimes one by one

## Channel-Based Motion Direction

For long-term media and animation scale, Dropple should move toward this rule:

- channels are canonical animation truth
- tracks are editor projections over channels

This means:

- `document.motion.channels` holds canonical animatable property truth
- timeline panels organize and visualize channels through track schemas
- new animatable domains should not require separate animation engines

This is a strategic direction, not a requirement to rewrite all media code immediately.

## Rules That Must Never Break

### Rule 1

Only reducers mutate canonical truth.

### Rule 2

Workspaces configure policy and experience, not engine behavior.

### Rule 3

UI reads through selectors, projection, and bridges; it does not own truth.

### Rule 4

Timeline runtime remains shared across media modes.

### Rule 5

New subsystems are introduced one at a time with ownership, replay, and determinism coverage.

## What Not To Do

- do not build every workspace family deeply at once
- do not create separate media engines for animation, video, and podcast
- do not let workspace files own runtime logic
- do not build advanced media domains in one wave
- do not turn every specialization into a flagship family
- do not keep refactoring architecture once product work should begin

## Final Recommendation

Dropple should commit to this platform identity:

Dropple-OS is a deterministic creation operating system with a few deep workspace families built on one shared core.

The immediate strategic priorities are:

1. preserve the hardened platform
2. unify the Media Family under one workspace
3. deepen Visual Product and Media as flagship families
4. deepen Developer and System Design next
5. add advanced subsystems only when the product depth proves the need

This is the cleanest way to scale Dropple without fragmenting the architecture or the product strategy.
