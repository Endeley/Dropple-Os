import {
    ensureDefaultTimeline,
    getRuntimeState,
    initialRuntimeState,
    setRuntimeState,
} from '@/runtime/state/runtimeState.js';
import { syncRuntimeToZustand } from '@/runtime/bridge/zustandBridge.js';
import { applyLayoutPass } from '@/runtime/layout/applyLayoutPass.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { setViewport } from '@/runtime/state/workspaceState.js';

export const WORLD_STATE_VERSION = 1;

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

export function hydrateWorld(worldState) {
    if (!worldState) return null;
    const migrated = migrateWorld(worldState);
    if (!migrated) return null;

    const nodesById = {};
    migrated.nodes?.forEach((node) => {
        if (!node?.id) return;
        nodesById[node.id] = node;
    });

    const rootIds = computeRootIds(nodesById);
    const baseState = getRuntimeState() ?? initialRuntimeState;
    const nextState = ensureDefaultTimeline({
        ...baseState,
        nodes: nodesById,
        rootIds,
    });

    setRuntimeState(nextState);
    syncRuntimeToZustand(nextState);

    const derived = applyLayoutPass(nextState);
    useAnimatedRuntimeStore.setState(derived, false);

    setViewport(migrated.camera);

    if (process.env.NODE_ENV === 'development') {
        deepFreeze(migrated);
    }
    return nextState;
}

export function roundTripWorldState({ nodesById, viewport, workspaceId, metadata }) {
    const first = serializeWorld({ nodesById, viewport, workspaceId, metadata });
    if (!first) return { ok: false, reason: 'serialize_failed' };
    hydrateWorld(first);
    const runtimeState = getRuntimeState();
    const second = serializeWorld({
        nodesById: runtimeState?.nodes ?? {},
        viewport,
        workspaceId,
        metadata,
    });
    const equal = JSON.stringify(first) === JSON.stringify(second);
    return { ok: equal, first, second };
}

function computeRootIds(nodesById) {
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

function migrateWorld(state) {
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

function cloneData(value) {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
    if (!value || typeof value !== 'object') return value;
    Object.freeze(value);
    Object.values(value).forEach((child) => deepFreeze(child));
    return value;
}
