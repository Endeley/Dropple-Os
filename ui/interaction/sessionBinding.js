import { canvasBus } from '@/ui/canvasBus.js';
import { InputSessionManager } from '@/input/InputSessionManager.js';
import { dispatcher } from './dispatcher.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { computeSelectionBounds } from '@/engine/constraints/selectionBounds.js';
import { getRuntimeState } from '@/runtime/state/runtimeState.js';
import { getWorkspaceState } from '@/runtime/state/workspaceState.js';
import { screenToWorld } from '@/canvas/transform/screenToWorld.js';
import { setAimTarget } from '@/runtime/characters/characterRegistry.js';
import { getActiveWorkspace } from '@/runtime/state/workspaceState.js';
import { resolveWorkspacePolicy } from '@/workspaces/registry/resolveWorkspacePolicy.js';
import { useTimelineStore } from '@/ui/timeline/useTimelineStore.js';
import { useSelectionStore } from '@/selection/useSelectionStore.js';
import { registerEditEventBridge } from '@/ui/timeline/editEventBridge.js';
import { registerNodeDragResolver } from '@/ui/interaction/nodeDragResolver.js';
import { registerNodeCreateResolver } from '@/ui/interaction/nodeCreateResolver';
import { registerAnimationKeyframeResolver } from '@/ui/interaction/animationKeyframeResolver.js';
import { useAutoKeyframeStore } from '@/ui/animation/autoKeyframeStore.js';

registerEditEventBridge();
registerNodeDragResolver();
registerNodeCreateResolver();
registerAnimationKeyframeResolver();

let warnedMissingDispatcher = false;

function safeDispatch(event) {
    try {
        dispatcher.dispatch(event);
    } catch (err) {
        if (!warnedMissingDispatcher) {
            console.warn('[sessionBinding] Dispatcher not attached; skipping canvas dispatch.', err);
            warnedMissingDispatcher = true;
        }
    }
}

function canAuthorAnimationKeyframes() {
    const runtimeState = getRuntimeState();
    if (runtimeState?.__isReplaying) return false;

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

    const runtimeState = getRuntimeState();
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

const sessionManager = new InputSessionManager(canvasBus);

// pointer down
canvasBus.on('pointer.down', ({ session, event }) => {
    sessionManager.startSession(session, event);
});

// pointer move
canvasBus.on('pointer.move', (event) => {
    if (event?.clientX != null && event?.clientY != null && event?.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect?.();
        if (rect) {
            const viewport = getWorkspaceState()?.viewport;
            if (viewport && Number.isFinite(viewport.scale)) {
                const screenPoint = {
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top,
                };
                const worldPoint = screenToWorld(screenPoint, viewport);
                setAimTarget(worldPoint);
            }
        }
    }
    sessionManager.updateSession(event);
});

// pointer up
canvasBus.on('pointer.up', () => {
    const session = sessionManager.state.activeSession;
    const result = sessionManager.commitSession();

    if (result?.type === 'move') {
        const { nodeIds, delta } = result;

        nodeIds.forEach((id) => {
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
    }

    if (result?.type === 'resize') {
        const nodes = session?.nodes || [];
        if (!nodes.length) return;

        const bounds = computeSelectionBounds(nodes);
        const resizeDelta = result.resize || { width: 0, height: 0 };
        const offset = result.delta || { x: 0, y: 0 };

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
    }

    if (result?.type === 'rotate') {
        const { nodeIds } = result;
        if (Array.isArray(nodeIds) && nodeIds.length) {
            emitKeyframesForNodes(nodeIds, { rotation: true });
        }
    }
});

// pointer cancel
canvasBus.on('pointer.cancel', () => {
    sessionManager.cancelSession();
});

export { sessionManager };
