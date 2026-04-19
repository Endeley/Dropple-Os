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

    // 🔥 REQUIRED for progressive resize
    bounds: null,

    // 🔑 interaction projection layer
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

        // 🔥 initialize live bounds for resize
        bounds: payload.type === 'resize' ? (payload.originBounds ?? null) : null,

        interactionTransforms: null,
    };
}

export function updateDrag(state, payload) {
    if (!state?.active) return state ?? initialDragState;

    const pointer = payload && typeof payload === 'object' && !Array.isArray(payload) && 'pointer' in payload ? payload.pointer : payload;

    const guides = payload && typeof payload === 'object' && !Array.isArray(payload) && 'guides' in payload ? payload.guides : state.guides;

    const interactionTransforms = payload && typeof payload === 'object' && !Array.isArray(payload) && 'interactionTransforms' in payload ? payload.interactionTransforms : state.interactionTransforms;

    return {
        ...state,
        previousPointer: state.currentPointer ?? state.startPointer ?? null,
        currentPointer: pointer ?? null,
        guides: Array.isArray(guides) ? [...guides] : [],

        // 🔥 CRITICAL: preserve bounds across frames
        bounds: state.bounds ?? null,

        interactionTransforms,
    };
}

export function endDrag() {
    return initialDragState;
}
