# Truth Boundaries

Dropple maintains one canonical truth pipeline:

`intent -> event -> dispatcher -> reducers -> canonical truth -> runtime evaluation -> projection -> UI`

## Canonical Truth

- `document` is persisted authoring truth.
- `runtime` is evaluated execution truth.
- `projection` and `UI` are derived read-only views.

Only dispatcher-driven reducers may mutate canonical truth.

Import and layer boundaries are defined in [LAYER_CONTRACTS.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/core/architecture/LAYER_CONTRACTS.md).

## Reducer Ownership

Reducers may only mutate their owned slices.

Current enforced ownership:

- `componentStateReducers`
  - `document.components`
  - `activeComponentId`
- `motionReducers`
  - `document.motion`
- `navigationReducers`
  - `navigation`
- `collaborationReducers`
  - `collaboration`
- `vectorReducers`
  - `document.vectors`
  - `vectors`
- `selectionReducer`
  - `selection`
- `viewportReducer`
  - `workspace`
- `nodeReducers`
  - `document.sceneGraph`
  - `document.layout`
  - `nodes`
  - `rootIds`
- `nodeStructureReducers`
  - `document.sceneGraph`
  - `document.layout`
  - `nodes`
  - `rootIds`
- `layoutReducers`
  - `document.layout`
  - `nodes`
- `styleReducers`
  - `nodes`
- `timelineReducers`
  - `timeline`
- `stateReducers`
  - `activeStateId`

## Derived Caches

Derived caches must obey:

- `cache = f(canonical truth)`
- never `canonical truth = f(cache)`

Registered derived caches live in [derivedCacheRegistry.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/derivedCacheRegistry.js).

## Boundary Rules

- `plugins/**` may not import runtime or reducer internals.
- `workspaces/**` may not import reducers.
- UI must not own authoring truth.
- AI must act through intents and dispatcher events.

## Implementation Checklist

- `done` Central reducer ownership guard in [core/events/reducers/index.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/core/events/reducers/index.js)
- `done` Derived cache registry in [runtime/derivedCacheRegistry.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/derivedCacheRegistry.js)
- `done` Boundary architecture test in [truthBoundaryImports.test.ts](/Users/endeleykonboye/Desktop/dropple-os/dropple/tests/architecture/truthBoundaryImports.test.ts)
- `next` Extend reducer ownership coverage to remaining reducers with mixed legacy/runtime responsibilities
- `next` Route architecture CI through truth-boundary checks explicitly
- `next` Add replay-equivalence truth tests for canonical document hashing
- `next` Audit UI local state against projection-only rules
- `next` Restrict AI modules to intent-only mutation paths
