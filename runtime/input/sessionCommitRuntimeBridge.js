import { canvasBus } from '@/infrastructure/eventBus/canvasBus.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { computeSelectionBounds } from '@/runtime/geometry/selectionBounds.js';
import { getRuntimeSnapshot } from '@/runtime/projection';
import { getActiveWorkspace } from '@/runtime/projection';
import { resolveWorkspacePolicy } from '@/workspaces/registry/resolveWorkspacePolicy.js';
import { useTimelineStore } from '@/runtime/stores/useTimelineStore.js';
import { useSelectionStore } from '@/runtime/stores/useSelectionStore.js';
import { useAutoKeyframeStore } from '@/runtime/stores/useAutoKeyframeStore.js';
import { commitTimelineKeyframe } from '@/runtime/timeline/commitTimelineKeyframe';
import { isAutoLayoutChild } from '@/engine/layout/isAutoLayoutChild';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';

let _unsub = null;
let warnedMissingDispatcher = false;

function safeDispatch(event) {
    try {
        const dispatcher = getRuntimeDispatcher();
        dispatcher.dispatch(event);
    } catch (err) {
        if (!warnedMissingDispatcher) {
            console.warn('[sessionCommitRuntimeBridge] Dispatcher not available; skipping dispatch.', err);
            warnedMissingDispatcher = true;
        }
    }
}

function canAuthorAnimationKeyframes() {
    const runtimeState = getRuntimeSnapshot();
    if (runtimeState?.isReplaying) return false;

    const workspaceId = getActiveWorkspace();
    const policy = resolveWorkspacePolicy(workspaceId);
    if (!policy?.capabilities?.timeline) return false;

    return true;
}

function emitKeyframesForNodes(nodeIds, { position, size, rotation } = {}) {
    if (!Array.isArray(nodeIds) || nodeIds.length === 0) return;
    if (!canAuthorAnimationKeyframes()) return;

    const policy = useAutoKeyframeStore.getState();
    if (!policy?.enabled) return;

    const selectedIds = useSelectionStore.getState().selectedIds || [];
    if (!selectedIds.length) return;

    const timeMs = useTimelineStore.getState().currentTime;
    if (!Number.isFinite(timeMs)) return;

    const runtimeState = getRuntimeSnapshot();
    const nodes = runtimeState?.nodes || {};

    const idsToAuthor = Array.from(
        new Set(selectedIds.length > 1 ? selectedIds : nodeIds)
    );

    idsToAuthor.forEach((nodeId) => {
        const node = nodes[nodeId];
        if (!node?.layout) return;

        const { x, y, width, height } = node.layout;

        if (position && Number.isFinite(x) && Number.isFinite(y)) {
            canvasBus.emit('intent.animation.keyframe.create', {
                nodeId,
                property: 'layout.x',
                timeMs,
                value: x,
                source: 'auto-keyframe',
            });
            canvasBus.emit('intent.animation.keyframe.create', {
                nodeId,
                property: 'layout.y',
                timeMs,
                value: y,
                source: 'auto-keyframe',
            });
        }

        if (size) {
            if (Number.isFinite(width)) {
                canvasBus.emit('intent.animation.keyframe.create', {
                    nodeId,
                    property: 'layout.width',
                    timeMs,
                    value: width,
                    source: 'auto-keyframe',
                });
            }
            if (Number.isFinite(height)) {
                canvasBus.emit('intent.animation.keyframe.create', {
                    nodeId,
                    property: 'layout.height',
                    timeMs,
                    value: height,
                    source: 'auto-keyframe',
                });
            }
        }

        if (rotation && Number.isFinite(node.rotation)) {
            canvasBus.emit('intent.animation.keyframe.create', {
                nodeId,
                property: 'rotation',
                timeMs,
                value: node.rotation,
                source: 'auto-keyframe',
            });
        }
    });
}

export function registerSessionCommitRuntimeBridge() {
    if (_unsub) return _unsub;

    const handler = (event) => {
        const { sessionType, payload } = event || {};
        if (!payload || payload.type === 'noop') return;

        if (payload.type === 'reorder') {
            safeDispatch({
                type: EventTypes.NODE_REORDER,
                payload,
            });
            return;
        }

        if (payload.type === 'reparent') {
            safeDispatch({
                type: EventTypes.NODE_DETACH,
                payload: { ids: payload.nodeIds },
            });

            safeDispatch({
                type: EventTypes.NODE_ATTACH,
                payload: {
                    parentId: payload.to,
                    childIds: payload.nodeIds,
                    index: payload.index,
                },
            });
            return;
        }

        if (payload.type === 'timeline-keyframe') {
            const { nodeIds, time, trackId, properties } = payload;
            try {
                const dispatcher = getRuntimeDispatcher();
                nodeIds.forEach((nodeId) => {
                    Object.entries(properties).forEach(([property, value]) => {
                        commitTimelineKeyframe({
                            dispatcher,
                            nodeId,
                            trackId,
                            time,
                            property,
                            value,
                        });
                    });
                });
            } catch (err) {
                if (!warnedMissingDispatcher) {
                    console.warn('[sessionCommitRuntimeBridge] Dispatcher not available; skipping timeline keyframe commit.', err);
                    warnedMissingDispatcher = true;
                }
            }
            return;
        }

        if (sessionType === 'move' && payload.type === 'move') {
            const { nodeIds, delta } = payload;
            const state = getRuntimeSnapshot();
            const nodes = state?.nodes || {};

            nodeIds.forEach((id) => {
                const node = nodes[id];
                if (!node || isAutoLayoutChild(node, nodes)) return;

                safeDispatch({
                    type: EventTypes.NODE_MOVE,
                    payload: {
                        id,
                        xDelta: delta.x,
                        yDelta: delta.y,
                    },
                });
            });

            canvasBus.emit('intent.edit.commit', {
                type: 'move',
                ids: nodeIds,
                source: 'canvas.move',
            });

            emitKeyframesForNodes(nodeIds, { position: true });
            return;
        }

        if (payload.type === 'resize') {
            const { nodeIds } = payload;
            const runtimeState = getRuntimeSnapshot();
            const nodesById = runtimeState?.nodes || {};
            const nodes = nodeIds.map((id) => nodesById[id]).filter(Boolean);
            if (!nodes.length) return;

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

                safeDispatch({
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

            canvasBus.emit('intent.edit.commit', {
                type: 'resize',
                ids: nodes.map((node) => node.id),
                source: 'canvas.resize',
            });

            emitKeyframesForNodes(nodes.map((node) => node.id), { size: true });
            return;
        }

        if (payload.type === 'rotate') {
            const { nodeIds } = payload;
            if (Array.isArray(nodeIds) && nodeIds.length) {
                emitKeyframesForNodes(nodeIds, { rotation: true });
            }
        }
    };

    _unsub = canvasBus.on('session.commit', handler);
    return _unsub;
}
