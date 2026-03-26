/**
 * NON-CANONICAL INTERACTION SYSTEM
 *
 * This bridge may translate session commits for preview-oriented or legacy flows,
 * but it must not become the primary execution authority for canvas move/resize/
 * rotate commits while the canonical canvas path is:
 * CanvasRoot -> useCanvasInteractions -> inputEngine -> toolHandlerRegistrationFacade
 */

import { EventTypes } from '../../core/events/eventTypes.js';
import { VIEWPORT_PAN, VIEWPORT_ZOOM } from '@/core/events/viewportEvents.js';
import { computeSelectionBounds } from '../../domain/geometry/selectionBounds.js';
import { createMoveNodeEvent } from '../commands/structure/moveNode.js';

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
        const moveEvent = createMoveNodeEvent({
            nodeIds: payload.nodeIds,
            parentId: payload.to,
            index: payload.index,
        });
        if (moveEvent) {
            actions.dispatchEvents.push(moveEvent);
        }
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

    if (payload.type === 'viewport-pan') {
        const dx = payload?.delta?.dx ?? 0;
        const dy = payload?.delta?.dy ?? 0;
        actions.dispatchEvents.push({
            type: VIEWPORT_PAN,
            payload: { dx, dy },
        });
        return actions;
    }

    if (payload.type === 'viewport-zoom') {
        actions.dispatchEvents.push({
            type: VIEWPORT_ZOOM,
            payload: {
                scale: payload.scale ?? 1,
                anchor: payload.anchor ?? null,
            },
        });
        return actions;
    }

    if (payload.type === 'selection-set') {
        actions.dispatchEvents.push({
            type: EventTypes.SELECTION_SET,
            payload: {
                ids: payload.ids ?? [],
                primary: payload.primary ?? null,
            },
        });
        return actions;
    }

    if (sessionType === 'move' && payload.type === 'move') {
        const { nodeIds, delta } = payload;
        const xDelta = delta?.x ?? delta?.dx ?? 0;
        const yDelta = delta?.y ?? delta?.dy ?? 0;

        (nodeIds || []).forEach((id) => {
            const node = nodesById[id];
            if (!node || isAutoLayoutChild(node, nodesById)) return;

            actions.dispatchEvents.push({
                type: EventTypes.NODE_MOVE,
                payload: {
                    id,
                    xDelta,
                    yDelta,
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
