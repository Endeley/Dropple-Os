export const initialDragState = Object.freeze({
    active: false,
    type: null,
    nodeIds: [],
    startPointer: null,
    currentPointer: null,
    origin: null,
    meta: null,
    guides: [],
});

export function startDrag(state, payload = {}) {
    return {
        ...(state ?? initialDragState),
        active: true,
        type: payload.type ?? null,
        nodeIds: Array.isArray(payload.nodeIds) ? [...payload.nodeIds] : [],
        startPointer: payload.pointer ?? null,
        currentPointer: payload.pointer ?? null,
        origin: payload.origin ?? null,
        meta: payload.meta ?? null,
        guides: Array.isArray(payload.guides) ? [...payload.guides] : [],
    };
}

export function updateDrag(state, payload) {
    if (!state?.active) return state ?? initialDragState;

    const pointer =
        payload && typeof payload === 'object' && !Array.isArray(payload) && 'pointer' in payload
            ? payload.pointer
            : payload;
    const guides =
        payload && typeof payload === 'object' && !Array.isArray(payload) && 'guides' in payload
            ? payload.guides
            : state.guides;

    return {
        ...state,
        currentPointer: pointer ?? null,
        guides: Array.isArray(guides) ? [...guides] : [],
    };
}

export function endDrag() {
    return initialDragState;
}
