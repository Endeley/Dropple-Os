import {
    serializeWorld,
    buildWorldState,
    migrateWorld,
    computeRootIds,
    deepFreeze,
    DEFAULT_RUNTIME_STATE,
} from '@/runtime/persistence/worldState.js';
import { getRuntimeState } from '@/runtime/state/runtimeState';
import { applyViewportUpdate } from '@/runtime/state/workspaceRuntime.js';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';

export function hydrateWorld(worldState, { dispatcher } = {}) {
    if (!worldState) return null;
    const resolvedDispatcher = dispatcher ?? getRuntimeDispatcher?.();
    if (!resolvedDispatcher?.hydrateRuntimeState) {
        throw new Error('[WorldState] Missing dispatcher for hydrateWorld');
    }
    const migrated = migrateWorld(worldState);
    if (!migrated) return null;

    const nodesById = {};
    migrated.nodes?.forEach((node) => {
        if (!node?.id) return;
        nodesById[node.id] = node;
    });

    const rootIds = computeRootIds(nodesById);
    const baseState = getRuntimeState() ?? DEFAULT_RUNTIME_STATE;
    const nextState = {
        ...baseState,
        nodes: nodesById,
        rootIds,
        workspace: applyViewportUpdate(baseState?.workspace, migrated.camera),
    };

    if (process.env.NODE_ENV === 'development') {
        deepFreeze(migrated);
    }
    return resolvedDispatcher.hydrateRuntimeState(nextState, { animate: false });
}

export function roundTripWorldState({ nodesById, viewport, workspaceId, metadata, dispatcher }) {
    const first = serializeWorld({ nodesById, viewport, workspaceId, metadata });
    if (!first) return { ok: false, reason: 'serialize_failed' };
    hydrateWorld(first, { dispatcher });
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

export function buildWorldFromRuntime(workspaceSnapshot, metadata) {
    const runtimeSnapshot = getRuntimeState();
    return buildWorldState(runtimeSnapshot, workspaceSnapshot, metadata);
}

export { serializeWorld };
