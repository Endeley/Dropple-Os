# Dropple AI System Context

## Snapshot
Total Modules: 799

Zones:
- timeline: 44
- core: 65
- ui: 258
- runtime: 112
- engine: 37
- infra: 231
- workspace: 50
- unknown: 2

## Central Modules
- ui/tokens.js (fanIn: 36)
- core/events/eventTypes.js (fanIn: 30)
- runtime/state/runtimeState.js (fanIn: 30)
- ui/canvasBus.js (fanIn: 24)
- convex/_generated/api.js (fanIn: 23)
- convex/_generated/server.js (fanIn: 19)
- runtime/stores/useAnimatedRuntimeStore.js (fanIn: 18)
- runtime/state/useWorkspaceState.js (fanIn: 15)
- ui/workspace/shared/SelectionContext.jsx (fanIn: 15)
- runtime/state/workspaceState.js (fanIn: 10)

## Recently Modified
- timeline/evaluateAnimationTimeline.js
- timeline/evaluateAnimationAtTime.js
- core/scene/node.js
- design/state/normalizeNodeShape.js
- core/nodes/createNode.js
- timeline/__tests__/evaluateAnimationTimeline.test.js
- runtime/timeline/scrubTimeline.js
- ui/animation/evaluateGhostFrames.js
- ui/animation/evaluateMotionTrails.js
- runtime/animation/runAnimationPreview.js

## Violations
Selection Authorities: 1
createNode Locations: 1
Reducer Conflicts: 0
Timeline Evaluators: 3
Cross-Zone Imports: 325
