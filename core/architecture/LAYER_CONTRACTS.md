# Layer Contracts

This document defines Dropple's architectural import and mutation law.

## Canonical Law

`intent -> event -> dispatcher -> reducers -> canonical truth -> runtime evaluation -> projection -> UI`

Only dispatcher-driven reducers may mutate canonical truth.

## Layers

### Kernel

Scope:

- `core/events/**`
- `runtime/dispatcher/**`

Responsibilities:

- assign event identity
- route events through guards
- execute reducers
- protect canonical truth mutation

May import:

- `core/**`
- `runtime/dispatcher/**`

May mutate:

- canonical document truth
- canonical runtime truth

### Runtime

Scope:

- `runtime/**` except dispatcher internals already classified as kernel
- `engine/**` when used for evaluation

Responsibilities:

- evaluate canonical truth
- build derived execution state
- maintain derived caches

May import:

- `core/**`
- `engine/**`
- runtime utility modules

Must not:

- bypass dispatcher to mutate canonical truth

### Projection

Scope:

- `runtime/projection/**`
- selector-facing store bridges

Responsibilities:

- expose read-only derived state to UI and plugins

May import:

- `runtime/**`
- `core/**`

Must not:

- mutate canonical truth

### Selectors

Scope:

- selector-facing read-model helpers
- runtime-facing query helpers exposed to UI/plugins

Responsibilities:

- derive read-only views from canonical truth
- hide runtime structure behind query surfaces

May import:

- `runtime/**`
- `core/**`

Must not:

- mutate state
- perform side effects

### UI

Scope:

- `ui/**`
- visual editor surfaces

Responsibilities:

- render projection
- emit intents/events
- hold presentational local state only

May import:

- projection selectors
- public event constants
- public intent helpers
- `ui/bridges/**` facades when runtime coupling is required

Must not import:

- reducer modules
- runtime state internals
- dispatcher internals

Approved runtime-coupling zone:

- `ui/bridges/**`
- legacy nested `ui/**/bridges/**` while they are being migrated into the canonical bridge layer

Non-bridge UI files must use:

- projection
- selectors
- boundary hooks
- UI-owned bridge/facade modules

Non-bridge UI files must not import runtime implementation paths directly:

- input/session internals
- selection mutation helpers
- structure commands
- persistence bridges
- frame/instrumentation internals
- dispatcher buses

Must not own:

- selection truth
- document truth
- layout truth

### Platform

Scope:

- `platform/**`

Responsibilities:

- capabilities
- plugin host
- collaboration platform surfaces
- extension registration

May import:

- public runtime/dispatcher handles
- capability registries
- projection selectors

Must not:

- mutate canonical truth directly

### Plugins

Scope:

- `plugins/**`

Responsibilities:

- extend tools, panels, export targets, compiler hooks, data providers

May import:

- plugin-local helpers
- plugin API surfaces

Must not import:

- `runtime/**`
- `runtime/state/**`
- `core/events/reducers/**`

Must act through:

- `pluginApi.dispatch`
- `pluginApi.select`
- capability-restricted APIs

### Workspaces

Scope:

- `workspaces/**`

Responsibilities:

- define policies
- define available tools/panels/capabilities
- activate workspace-specific configuration

May import:

- workspace registry helpers
- capability/policy definitions
- event constants

Must not import:

- reducer modules
- runtime internals

Must not define:

- reducers
- canonical truth stores

### AI

Scope:

- `ai/**`

Responsibilities:

- generate suggestions
- create intents
- assist authoring and compilation

May import:

- public intents
- compiler-facing APIs
- projection/selectors

Must not import:

- runtime state internals
- reducer modules

Must act through:

- intents
- dispatcher events

### Compiler

Scope:

- `engine/compiler/**`
- compiler-adjacent generators

Responsibilities:

- transform IR/document semantics into target outputs

May import:

- engine/compiler modules
- normalized engine helpers

Must not:

- mutate runtime truth during compilation

## Event Mutation Law

- Dispatcher is the only legal entry point for reducer execution.
- Reducers are the only legal mutation surface for canonical truth.
- Projection, UI, plugins, workspaces, and AI must never mutate canonical truth directly.
- Reducers must be pure functions of `(state, event) -> nextState`.
- Reducers must not perform IO, DOM work, network access, or external mutation.

## Capability Law

Features must be accessed through capability APIs, not direct cross-layer imports.

- Workspaces, plugins, UI, and AI must not import engine or runtime internals to activate features.
- Capabilities define the allowed public surface area of the system.
- Capability descriptors may expose:
  - runtime services
  - selectors
  - compiler services
  - export services
- Capability descriptors must not expose unrestricted internal modules.

## Import Enforcement Targets

Current test-enforced boundaries:

- `workspaces/**` cannot import reducers
- `workspaces/**` cannot import runtime or engine internals
- `plugins/**` cannot import runtime, engine, or reducer internals
- `ai/**` cannot import runtime-state, dispatcher, engine, or reducer internals

Next enforcement targets:

- `ui/**` cannot import reducer or runtime-state internals
- `ui/**` capability access should move behind selectors and public surfaces
