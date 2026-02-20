export const WORLD_STATE_VERSION = 1;
export const DEFAULT_RUNTIME_STATE = {
    nodes: {},
    rootIds: [],
    timeline: null,
    activeStateId: null,
    activeComponentId: null,
    __isReplaying: false,
};

export function serializeWorld({ nodesById, viewport, workspaceId, metadata }) {
    if (!nodesById || !viewport) return null;

    const nodes = Object.values(nodesById).map((node) => cloneData(node));

    return {
        version: WORLD_STATE_VERSION,
        camera: {
            x: viewport.x ?? 0,
            y: viewport.y ?? 0,
            scale: viewport.scale ?? 1,
        },
        nodes,
        metadata: {
            workspaceId: workspaceId || 'default',
            createdAt: metadata?.createdAt ?? Date.now(),
            updatedAt: metadata?.updatedAt ?? Date.now(),
        },
    };
}

export function buildWorldState(runtimeSnapshot, workspaceSnapshot, metadata) {
    const nodesById = runtimeSnapshot?.nodes ?? DEFAULT_RUNTIME_STATE.nodes;
    const viewport = workspaceSnapshot?.viewport ?? null;
    const workspaceId = workspaceSnapshot?.id ?? 'default';

    return serializeWorld({
        nodesById,
        viewport,
        workspaceId,
        metadata,
    });
}

export function computeRootIds(nodesById) {
    const ids = Object.keys(nodesById || {});
    const roots = [];
    ids.forEach((id) => {
        const node = nodesById[id];
        const parentId = node?.parentId;
        if (!parentId || !nodesById[parentId]) {
            roots.push(id);
        }
    });
    return roots;
}

export function migrateWorld(state) {
    if (!state.version) {
        throw new Error('[WorldState] Missing version');
    }

    switch (state.version) {
        case WORLD_STATE_VERSION:
            return state;
        default:
            throw new Error(`[WorldState] Unsupported version ${state.version}`);
    }
}

export function cloneData(value) {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
}

export function deepFreeze(value) {
    if (!value || typeof value !== 'object') return value;
    Object.freeze(value);
    Object.values(value).forEach((child) => deepFreeze(child));
    return value;
}
