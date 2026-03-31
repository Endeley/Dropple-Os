import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { getNearestSnapshot } from '@/runtime/input/spatial/nearestSnapshot.js';
import { createNodeDragSessionIntent } from '@/runtime/input/nodeDragRuntimeBridge.js';
import {
    createGroupMoveSession,
    createGroupResizeSession,
} from '@/runtime/input/groupSessionRuntimeBridge.js';
import { createSessionFromIntent } from '@/runtime/input/sessionRuntimeBridge.js';

export function getInteractionBridgeState() {
    return {
        runtime: useRuntimeStore.getState(),
        animated: useAnimatedRuntimeStore.getState(),
        nearestSnapshot: getNearestSnapshot?.() ?? null,
    };
}

export function createNodeDragBridgeResult({ intent }) {
    const { runtime, animated, nearestSnapshot } = getInteractionBridgeState();
    const selectionIds = runtime?.selection?.ids || [];
    const nodesById =
        runtime?.nodes && Object.keys(runtime.nodes).length > 0
            ? runtime.nodes
            : animated?.nodes || {};

    return createNodeDragSessionIntent({
        intent,
        selectedIds: selectionIds,
        nodesById,
        nearestSnapshot,
        zoomTier: intent?.zoomTier ?? 'normal',
    });
}

export function createGroupMoveBridgeSession({
    nodeIds,
    pointer,
    modifiers,
    zoomTier = 'normal',
}) {
    const { runtime, animated, nearestSnapshot } = getInteractionBridgeState();

    return createGroupMoveSession({
        nodeIds,
        pointer,
        modifiers,
        nodesById: runtime?.nodes || {},
        animatedNodesById: animated?.nodes || {},
        nearestSnapshot,
        zoomTier,
    });
}

export function createGroupResizeBridgeSession({
    nodeIds,
    pointer,
    handle,
    modifiers,
}) {
    const { runtime } = getInteractionBridgeState();

    return createGroupResizeSession({
        nodeIds,
        pointer,
        handle,
        modifiers,
        nodesById: runtime?.nodes || {},
    });
}

export function createSessionBridgeSession({ sessionType, payload }) {
    const { runtime } = getInteractionBridgeState();

    return createSessionFromIntent({
        sessionType,
        payload,
        nodesById: runtime?.nodes || {},
    });
}
