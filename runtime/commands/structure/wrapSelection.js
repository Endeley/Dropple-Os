import { getSceneGraph } from '@/runtime/document/documentAdapter';
import { computeGroupBounds } from '@/runtime/interaction/groupBoundsEngine.js';
import { EventTypes } from '@/core/events/eventTypes.js';

function buildWrapperLayout(runtimeState, nodeIds, wrapperNode) {
    const nodesById = getSceneGraph(runtimeState)?.nodes ?? {};
    const childNodes = nodeIds.map((id) => nodesById[id]).filter(Boolean);
    const maxChildZIndex = childNodes.reduce(
        (max, node) => Math.max(max, Number.isFinite(node?.zIndex) ? node.zIndex : 0),
        0,
    );

    if (wrapperNode?.layout) {
        return {
            ...wrapperNode,
            zIndex: Number.isFinite(wrapperNode?.zIndex)
                ? wrapperNode.zIndex
                : maxChildZIndex + 1,
        };
    }

    const bounds = computeGroupBounds(nodesById, nodeIds);
    if (!bounds) return wrapperNode;

    return {
        ...wrapperNode,
        zIndex: Number.isFinite(wrapperNode?.zIndex)
            ? wrapperNode.zIndex
            : maxChildZIndex + 1,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        layout: {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
        },
    };
}

export function createWrapSelectionEvent({ runtimeState, nodeIds, wrapperNode, parentId, index }) {
    const ids = Array.isArray(nodeIds) ? nodeIds.filter(Boolean) : [];
    const graph = getSceneGraph(runtimeState);
    if (!ids.length || !wrapperNode?.id) {
        return null;
    }
    if (
        runtimeState &&
        (!ids.every((id) => graph?.nodes?.[id]) ||
            (parentId != null && !graph?.nodes?.[parentId]))
    ) {
        return null;
    }

    return {
        type: EventTypes.NODE_WRAP,
        payload: {
            nodeIds: ids,
            wrapperNode: buildWrapperLayout(runtimeState, ids, wrapperNode),
            parentId,
            index,
        },
    };
}

export function wrapSelection({ runtimeState, nodeIds, wrapperNode, parentId, index, dispatch }) {
    if (typeof dispatch !== 'function') {
        return null;
    }

    const event = createWrapSelectionEvent({ runtimeState, nodeIds, wrapperNode, parentId, index });
    if (!event) {
        return null;
    }

    return dispatch(event);
}
