export const initialDragState = Object.freeze({
    active: false,
    type: null,
    nodeIds: [],
    startPointer: null,
    currentPointer: null,
    origin: null,
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
    };
}

export function updateDrag(state, pointer) {
    if (!state?.active) return state ?? initialDragState;

    return {
        ...state,
        currentPointer: pointer ?? null,
    };
}

export function endDrag() {
    return initialDragState;
}
