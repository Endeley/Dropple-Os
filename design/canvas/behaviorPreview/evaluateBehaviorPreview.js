// design/canvas/behaviorPreview/evaluateBehaviorPreview.js
// Pure preview evaluation. No mutation.

export function evaluateBehaviorPreview({ graph, activeStateId }) {
    if (!graph || !activeStateId) return null;
    const state = graph.states?.[activeStateId] || null;
    return state ? { stateId: activeStateId, overrides: state.propertyOverrides || {} } : null;
}

