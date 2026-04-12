export const initialDragState = Object.freeze({
    active: false,
    type: null,
    nodeIds: [],
    startPointer: null,
    previousPointer: null,
    currentPointer: null,
    origin: null,
    group: null,
    resize: null,
    rotation: null,
    meta: null,
    guides: [],

    // 🔑 NEW: interaction projection layer
    interactionTransforms: null,
});

export function startDrag(state, payload = {}) {
    return {
        ...initialDragState,
        active: true,
        type: payload.type ?? null,
        nodeIds: Array.isArray(payload.nodeIds) ? [...payload.nodeIds] : [],
        startPointer: payload.pointer ?? null,
        previousPointer: payload.pointer ?? null,
        currentPointer: payload.pointer ?? null,
        origin: payload.origin ?? null,
        group: payload.group ?? null,
        resize:
            payload.type === 'resize'
                ? {
                      handle: payload.handle ?? null,
                      originBounds: payload.originBounds ?? null,
                  }
                : null,
        rotation:
            payload.type === 'rotate'
                ? {
                      originAngle: payload.originAngle ?? 0,
                      center: payload.center ?? null,
                  }
                : null,
        meta: payload.meta ?? null,
        guides: Array.isArray(payload.guides) ? [...payload.guides] : [],

        // 🔑 INIT interaction layer
        interactionTransforms: null,
    };
}

export function updateDrag(state, payload) {
    if (!state?.active) return state ?? initialDragState;

    const pointer = payload && typeof payload === 'object' && !Array.isArray(payload) && 'pointer' in payload ? payload.pointer : payload;

    const guides = payload && typeof payload === 'object' && !Array.isArray(payload) && 'guides' in payload ? payload.guides : state.guides;

    // 🔑 NEW: interaction transforms from computeDragDelta
    const interactionTransforms = payload && typeof payload === 'object' && !Array.isArray(payload) && 'interactionTransforms' in payload ? payload.interactionTransforms : state.interactionTransforms;

    return {
        ...state,
        previousPointer: state.currentPointer ?? state.startPointer ?? null,
        currentPointer: pointer ?? null,
        guides: Array.isArray(guides) ? [...guides] : [],

        // 🔑 STORE interaction layer
        interactionTransforms,
    };
}

export function endDrag() {
    return initialDragState;
}
