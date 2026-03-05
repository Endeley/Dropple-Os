import { EventTypes } from '../../core/events/eventTypes.js';
import { computeSelectionBounds } from '../../domain/geometry/selectionBounds.js';

function buildKeyframeIntentsForNodes(nodeIds, { position, size, rotation } = {}, context) {
    if (!Array.isArray(nodeIds) || nodeIds.length === 0) return [];
    if (!context?.canAuthorAnimationKeyframes) return [];
    if (!context?.autoKeyframeEnabled) return [];

    const selectedIds = Array.isArray(context?.selectedIds) ? context.selectedIds : [];
    if (!selectedIds.length) return [];

    const timeMs = context?.frameTime;
    if (!Number.isFinite(timeMs)) return [];

    const nodes = context?.nodesById || {};
    const idsToAuthor = Array.from(
        new Set(selectedIds.length > 1 ? selectedIds : nodeIds)
    );

    const intents = [];

    idsToAuthor.forEach((nodeId) => {
        const node = nodes[nodeId];
        if (!node?.layout) return;

        const { x, y, width, height } = node.layout;

        if (position && Number.isFinite(x) && Number.isFinite(y)) {
            intents.push({
                nodeId,
                property: 'layout.x',
                timeMs,
                value: x,
                source: 'auto-keyframe',
            });
            intents.push({
                nodeId,
                property: 'layout.y',
                timeMs,
                value: y,
                source: 'auto-keyframe',
            });
        }

        if (size) {
            if (Number.isFinite(width)) {
                intents.push({
                    nodeId,
                    property: 'layout.width',
                    timeMs,
                    value: width,
                    source: 'auto-keyframe',
                });
            }
            if (Number.isFinite(height)) {
                intents.push({
                    nodeId,
                    property: 'layout.height',
                    timeMs,
                    value: height,
                    source: 'auto-keyframe',
                });
            }
        }

        if (rotation && Number.isFinite(node.rotation)) {
            intents.push({
                nodeId,
                property: 'rotation',
                timeMs,
                value: node.rotation,
                source: 'auto-keyframe',
            });
        }
    });

    return intents;
}

export function createSessionCommitActions({ event, context }) {
    const { sessionType, payload } = event || {};
    if (!payload || payload.type === 'noop') return null;

    const actions = {
        dispatchEvents: [],
        timelineKeyframes: [],
        editCommitIntents: [],
        keyframeIntents: [],
    };

    const nodesById = context?.nodesById || {};
    const isAutoLayoutChild =
        typeof context?.isAutoLayoutChild === 'function'
            ? context.isAutoLayoutChild
            : () => false;

    if (payload.type === 'reorder') {
        actions.dispatchEvents.push({
            type: EventTypes.NODE_REORDER,
            payload,
        });
        return actions;
    }

    if (payload.type === 'reparent') {
        actions.dispatchEvents.push({
            type: EventTypes.NODE_DETACH,
            payload: { ids: payload.nodeIds },
        });
        actions.dispatchEvents.push({
            type: EventTypes.NODE_ATTACH,
            payload: {
                parentId: payload.to,
                childIds: payload.nodeIds,
                index: payload.index,
            },
        });
        return actions;
    }

    if (payload.type === 'timeline-keyframe') {
        const { nodeIds, time, trackId, properties } = payload;
        (nodeIds || []).forEach((nodeId) => {
            Object.entries(properties || {}).forEach(([property, value]) => {
                actions.timelineKeyframes.push({
                    nodeId,
                    trackId,
                    time,
                    property,
                    value,
                });
            });
        });
        return actions;
    }

    if (sessionType === 'move' && payload.type === 'move') {
        const { nodeIds, delta } = payload;

        (nodeIds || []).forEach((id) => {
            const node = nodesById[id];
            if (!node || isAutoLayoutChild(node, nodesById)) return;

            actions.dispatchEvents.push({
                type: EventTypes.NODE_MOVE,
                payload: {
                    id,
                    xDelta: delta.x,
                    yDelta: delta.y,
                },
            });
        });

        actions.editCommitIntents.push({
            type: 'move',
            ids: nodeIds,
            source: 'canvas.move',
        });

        actions.keyframeIntents.push(
            ...buildKeyframeIntentsForNodes(nodeIds, { position: true }, context)
        );

        return actions;
    }

    if (payload.type === 'resize') {
        const { nodeIds } = payload;
        const nodes = (nodeIds || []).map((id) => nodesById[id]).filter(Boolean);
        if (!nodes.length) return actions;

        const bounds = computeSelectionBounds(nodes);
        const resizeDelta = payload.resize || { width: 0, height: 0 };
        const offset = payload.delta || { x: 0, y: 0 };

        const nextWidth = Math.max(1, bounds.width + resizeDelta.width);
        const nextHeight = Math.max(1, bounds.height + resizeDelta.height);

        const scaleX = bounds.width === 0 ? 1 : nextWidth / bounds.width;
        const scaleY = bounds.height === 0 ? 1 : nextHeight / bounds.height;

        const originX = bounds.minX + offset.x;
        const originY = bounds.minY + offset.y;

        nodes.forEach((node) => {
            const relX = bounds.width === 0 ? 0 : (node.x - bounds.minX) / bounds.width;
            const relY = bounds.height === 0 ? 0 : (node.y - bounds.minY) / bounds.height;

            actions.dispatchEvents.push({
                type: EventTypes.NODE_UPDATE,
                payload: {
                    id: node.id,
                    patch: {
                        x: originX + relX * nextWidth,
                        y: originY + relY * nextHeight,
                        width: (node.width ?? 0) * scaleX,
                        height: (node.height ?? 0) * scaleY,
                    },
                },
            });
        });

        actions.editCommitIntents.push({
            type: 'resize',
            ids: nodes.map((node) => node.id),
            source: 'canvas.resize',
        });

        actions.keyframeIntents.push(
            ...buildKeyframeIntentsForNodes(nodes.map((node) => node.id), { size: true }, context)
        );

        return actions;
    }

    if (payload.type === 'rotate') {
        const { nodeIds, rotationDelta } = payload;
        if (!Array.isArray(nodeIds) || nodeIds.length === 0) return actions;

        actions.dispatchEvents.push({
            type: EventTypes.NODE_ROTATE,
            payload: {
                nodeIds,
                rotation: rotationDelta,
            },
        });

        actions.editCommitIntents.push({
            type: 'rotate',
            ids: nodeIds,
            source: 'canvas.rotate',
        });

        return actions;
    }

    if (payload.type === 'rotate') {
        const { nodeIds } = payload;
        if (Array.isArray(nodeIds) && nodeIds.length) {
            actions.keyframeIntents.push(
                ...buildKeyframeIntentsForNodes(nodeIds, { rotation: true }, context)
            );
        }
        return actions;
    }

    return actions;
}
