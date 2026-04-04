import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { getNearestSnapshot } from '@/runtime/input/spatial/nearestSnapshot.js';
import { createNodeDragSessionIntent } from '@/runtime/input/nodeDragRuntimeBridge.js';
import {
    createGroupMoveSession,
    createGroupResizeSession,
} from '@/runtime/input/groupSessionRuntimeBridge.js';
import { createSessionFromIntent } from '@/runtime/input/sessionRuntimeBridge.js';
import { selectNodes } from '@/runtime/projection/selectors/runtimeSelectors.js';

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
    const projectedNodes = selectNodes();
    const nodesById =
        projectedNodes && Object.keys(projectedNodes).length > 0
            ? projectedNodes
            : animated?.previewNodes || {};

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
    const projectedNodes = selectNodes();

    return createGroupMoveSession({
        nodeIds,
        pointer,
        modifiers,
        nodesById: projectedNodes || {},
        animatedNodesById: animated?.previewNodes || {},
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
    const projectedNodes = selectNodes();

    return createGroupResizeSession({
        nodeIds,
        pointer,
        handle,
        modifiers,
        nodesById: projectedNodes || {},
    });
}

export function createSessionBridgeSession({ sessionType, payload }) {
    const projectedNodes = selectNodes();

    return createSessionFromIntent({
        sessionType,
        payload,
        nodesById: projectedNodes || {},
    });
}
