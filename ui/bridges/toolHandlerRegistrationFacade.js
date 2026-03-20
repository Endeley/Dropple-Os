import { createNodeCreateEvent } from '@/runtime/input/nodeCreateRuntimeBridge.js';
import { computeSelectionBounds } from '@/domain/geometry/selectionBounds.js';
import {
    registerToolHandler,
    unregisterToolHandler,
} from '@/runtime/tools/toolController.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { computeDragDelta } from '@/runtime/interaction/dragEngine.js';
import { computeGuides } from '@/runtime/guides/computeGuides.js';
import { hitTestPoint } from '@/runtime/hitTest/hitTestPoint.js';
import { computeSnapTargets } from '@/runtime/snapping/computeSnapTargets.js';
import { clearSelection } from '@/runtime/selection/clearSelection.js';
import { selectNode } from '@/runtime/selection/selectNode.js';
import { toggleNode } from '@/runtime/selection/toggleNode.js';
import { computeResizeDelta } from '@/runtime/transforms/computeResizeDelta.js';
import { computeRotateAnchor } from '@/runtime/transforms/computeRotateAnchor.js';
import { computeRotationDelta } from '@/runtime/transforms/computeRotationDelta.js';
import { computeResizeAnchors } from '@/runtime/transforms/computeResizeAnchors.js';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import {
    endSession,
    getActiveSessionType,
    updatePointer,
} from '@/ui/bridges/inputSessionRuntimeFacade.js';
import { resolveSessionNodeIds } from '@/ui/interactions/toolController.js';

function getNodeRect(node) {
    const props = node?.props || {};
    const layout = node?.layout || {};

    return {
        x: node?.x ?? layout.x ?? props.x ?? 0,
        y: node?.y ?? layout.y ?? props.y ?? 0,
        width: node?.width ?? layout.width ?? props.width ?? 0,
        height: node?.height ?? layout.height ?? props.height ?? 0,
    };
}

function pointInRect(point, rect) {
    return (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
    );
}

function hitTestNode(runtimeState, worldPoint) {
    const nodes = Object.values(runtimeState?.nodes || {});
    const hits = [];

    for (const node of nodes) {
        const rect = getNodeRect(node);
        if (rect.width <= 0 || rect.height <= 0) continue;
        if (pointInRect(worldPoint, rect)) {
            hits.push({ node, rect });
        }
    }

    if (hits.length === 0) return null;

    hits.sort((a, b) => {
        const az = a.node?.zIndex ?? a.node?.props?.zIndex ?? 0;
        const bz = b.node?.zIndex ?? b.node?.props?.zIndex ?? 0;
        return az - bz;
    });

    return hits[hits.length - 1].node;
}

function resolvePrimaryHit(runtimeState, worldPoint) {
    const pointHit = hitTestPoint({
        runtime: runtimeState,
        x: worldPoint.x,
        y: worldPoint.y,
    });

    if (typeof pointHit === 'string') {
        return runtimeState?.nodes?.[pointHit] ?? { id: pointHit };
    }

    if (pointHit?.id) {
        return pointHit;
    }

    return hitTestNode(runtimeState, worldPoint);
}

function deriveDraggedBounds(nodeIds, origin, nodesById, dx, dy) {
    if (!Array.isArray(nodeIds) || nodeIds.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const nodeId of nodeIds) {
        const node = nodesById?.[nodeId];
        const start = origin?.[nodeId];
        if (!node || !start) continue;

        const layout = node.layout ?? {};
        const x = (start.x ?? 0) + dx;
        const y = (start.y ?? 0) + dy;
        const width = layout.width ?? node.width ?? 0;
        const height = layout.height ?? node.height ?? 0;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
    }

    if (!Number.isFinite(minX)) return null;

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

function deriveSelectionBounds(nodeIds, nodesById) {
    const nodes = (nodeIds ?? [])
        .map((nodeId) => nodesById?.[nodeId])
        .filter(Boolean)
        .map((node) => {
            const layout = node.layout ?? {};
            return {
                id: node.id,
                x: layout.x ?? node.x ?? 0,
                y: layout.y ?? node.y ?? 0,
                width: layout.width ?? node.width ?? 0,
                height: layout.height ?? node.height ?? 0,
            };
        });

    if (!nodes.length) return null;

    const bounds = computeSelectionBounds(nodes);
    return {
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.width,
        height: bounds.height,
    };
}

function deriveParentBounds(nodeId, nodesById) {
    const node = nodeId ? nodesById?.[nodeId] : null;
    const parent = node?.parentId ? nodesById?.[node.parentId] : null;
    if (!parent) return null;
    return getNodeRect(parent);
}

function resolveResizeHandle(bounds, worldPoint) {
    const anchors = computeResizeAnchors(bounds);
    if (!anchors || !worldPoint) return 'se';

    let closestHandle = 'se';
    let closestDistance = Infinity;

    for (const [handle, anchor] of Object.entries(anchors)) {
        const dx = anchor.x - worldPoint.x;
        const dy = anchor.y - worldPoint.y;
        const distance = dx * dx + dy * dy;
        if (distance < closestDistance) {
            closestDistance = distance;
            closestHandle = handle;
        }
    }

    return closestHandle;
}

function normalizeAngle(angle) {
    const tau = Math.PI * 2;
    let next = angle;
    while (next > Math.PI) next -= tau;
    while (next < -Math.PI) next += tau;
    return next;
}

function buildResizedLayoutUpdates(nodeIds, origin, startBounds, resizeResult) {
    if (!Array.isArray(nodeIds) || !nodeIds.length || !startBounds || !resizeResult) {
        return [];
    }

    const resizeDelta = resizeResult.resize ?? { width: 0, height: 0 };
    const offset = resizeResult.delta ?? { x: 0, y: 0 };
    const nextWidth = Math.max(1, startBounds.width + resizeDelta.width);
    const nextHeight = Math.max(1, startBounds.height + resizeDelta.height);
    const scaleX = startBounds.width === 0 ? 1 : nextWidth / startBounds.width;
    const scaleY = startBounds.height === 0 ? 1 : nextHeight / startBounds.height;
    const originX = startBounds.x + offset.x;
    const originY = startBounds.y + offset.y;

    return nodeIds.flatMap((nodeId) => {
        const start = origin?.[nodeId];
        if (!start) return [];

        const relX = startBounds.width === 0 ? 0 : (start.x - startBounds.x) / startBounds.width;
        const relY = startBounds.height === 0 ? 0 : (start.y - startBounds.y) / startBounds.height;

        return [{
            id: nodeId,
            layout: {
                x: originX + relX * nextWidth,
                y: originY + relY * nextHeight,
                width: start.width * scaleX,
                height: start.height * scaleY,
            },
        }];
    });
}

function selectToolHandler(input, context) {
    if (input.type !== 'pointerdown') return null;

    const runtimeState = context.state;
    const worldPoint = input.worldPoint;
    if (!runtimeState || !worldPoint) return null;

    const hit = resolvePrimaryHit(runtimeState, worldPoint);
    if (!hit?.id) {
        return null;
    }

    const additive = input.event?.shiftKey ?? input.modifiers?.shift ?? false;
    const event = additive ? toggleNode(hit.id) : selectNode(hit.id);
    context.dispatcher?.dispatch?.(event);
    return { handled: true };
}

function moveToolHandler(input, context) {
    const runtimeState = context.state;
    const dispatcher = context.dispatcher;
    const worldPoint = input.worldPoint;
    if (!runtimeState || !dispatcher || !worldPoint) return null;
    const drag = runtimeState?.interaction?.drag ?? null;

    if (input.type === 'pointerdown') {
        let hit = resolvePrimaryHit(runtimeState, worldPoint);
        if (!hit?.id) {
            dispatcher.dispatch(clearSelection());
            return { handled: true };
        }

        const nodesById = runtimeState?.nodes || {};
        const hitParent = hit.parentId ? nodesById[hit.parentId] : null;
        if (hitParent?.layout?.autoLayout) {
            const parentRect = getNodeRect(hitParent);
            const edge = 6;
            const innerRect = {
                x: parentRect.x + edge,
                y: parentRect.y + edge,
                width: Math.max(0, parentRect.width - edge * 2),
                height: Math.max(0, parentRect.height - edge * 2),
            };
            const onBoundary =
                pointInRect(worldPoint, parentRect) && !pointInRect(worldPoint, innerRect);
            if (onBoundary) {
                hit = hitParent;
            }
        }

        const selectionIds = Array.from(runtimeState?.selection?.ids ?? []);
        const nodeIds = resolveSessionNodeIds(selectionIds, hit.id);

        if (!selectionIds.includes(hit.id)) {
            dispatcher.dispatch(selectNode(hit.id));
        }

        const origin = Object.fromEntries(
            nodeIds.map((nodeId) => {
                const node = runtimeState?.nodes?.[nodeId];
                const layout = node?.layout ?? {};
                return [
                    nodeId,
                    {
                        x: layout.x ?? 0,
                        y: layout.y ?? 0,
                    },
                ];
            }),
        );

        dispatcher.dispatch({
            type: EventTypes.DRAG_START,
            payload: {
                type: 'move',
                nodeIds,
                pointer: worldPoint,
                origin,
            },
        });

        return { handled: true };
    }

    if (input.type === 'pointermove') {
        if (drag?.active && drag.type === 'move') {
            const { dx, dy } = computeDragDelta({
                ...drag,
                currentPointer: worldPoint,
            }, {
                snap: true,
                snapOptions: { grid: 10 },
                axisLock: input.event?.shiftKey === true,
            });
            const guides = computeGuides(
                deriveDraggedBounds(
                    drag.nodeIds ?? [],
                    drag.origin ?? {},
                    runtimeState?.nodes ?? {},
                    dx,
                    dy,
                ),
                computeSnapTargets(runtimeState?.scene?.computed ?? {}, drag.nodeIds ?? []),
            );

            dispatcher.dispatch({
                type: EventTypes.DRAG_UPDATE,
                payload: {
                    pointer: worldPoint,
                    guides,
                },
            });

            for (const nodeId of drag.nodeIds ?? []) {
                const origin = drag.origin?.[nodeId];
                if (!origin) continue;

                dispatcher.dispatch({
                    type: 'node.layout.move',
                    payload: {
                        nodeId,
                        x: origin.x + dx,
                        y: origin.y + dy,
                    },
                });
            }

            return { handled: true };
        }

        const active = getActiveSessionType();
        if (active === 'resize' || active === 'rotate') {
            updatePointer({ pointer: worldPoint });
            return null;
        }
        return null;
    }

    if (input.type === 'pointerup') {
        if (drag?.active && drag.type === 'move') {
            dispatcher.dispatch({
                type: EventTypes.DRAG_END,
            });
            return { handled: true };
        }

        const active = getActiveSessionType();
        if (active === 'resize' || active === 'rotate') {
            const event = endSession({ reason: 'pointerUp' });
            if (event) canvasBus.emit('session.commit', event);
            return null;
        }
        return null;
    }

    return null;
}

function resizeToolHandler(input, context) {
    const runtimeState = context.state;
    const dispatcher = context.dispatcher;
    const worldPoint = input.worldPoint;
    if (!runtimeState || !dispatcher || !worldPoint) return null;

    const drag = runtimeState?.interaction?.drag ?? null;
    const nodesById = runtimeState?.nodes ?? {};

    if (input.type === 'pointerdown') {
        const hit = resolvePrimaryHit(runtimeState, worldPoint);
        if (!hit?.id) return null;

        const selectionIds = Array.from(runtimeState?.selection?.ids ?? []);
        const nodeIds = resolveSessionNodeIds(selectionIds, hit.id);
        const bounds = deriveSelectionBounds(nodeIds, nodesById);
        if (!bounds) return null;

        if (!selectionIds.includes(hit.id)) {
            dispatcher.dispatch(selectNode(hit.id));
        }

        const origin = Object.fromEntries(
            nodeIds.map((nodeId) => {
                const node = nodesById?.[nodeId];
                const layout = node?.layout ?? {};
                return [nodeId, {
                    x: layout.x ?? node?.x ?? 0,
                    y: layout.y ?? node?.y ?? 0,
                    width: layout.width ?? node?.width ?? 0,
                    height: layout.height ?? node?.height ?? 0,
                }];
            }),
        );

        dispatcher.dispatch({
            type: EventTypes.DRAG_START,
            payload: {
                type: 'resize',
                nodeIds,
                pointer: worldPoint,
                origin,
                meta: {
                    handle: resolveResizeHandle(bounds, worldPoint),
                    bounds,
                    parentBounds: nodeIds.length === 1 ? deriveParentBounds(nodeIds[0], nodesById) : null,
                },
            },
        });

        return { handled: true };
    }

    if (input.type === 'pointermove') {
        if (!drag?.active || drag.type !== 'resize') return null;

        const nextDrag = {
            ...drag,
            currentPointer: worldPoint,
        };
        const resizeResult = computeResizeDelta(
            nextDrag.startPointer,
            nextDrag.currentPointer,
            drag.meta?.bounds ?? null,
            drag.meta?.handle ?? 'se',
            computeSnapTargets(runtimeState?.scene?.computed ?? {}, drag.nodeIds ?? []),
        );

        dispatcher.dispatch({
            type: EventTypes.DRAG_UPDATE,
            payload: {
                pointer: worldPoint,
                guides: resizeResult.guides ?? [],
            },
        });

        const updates = buildResizedLayoutUpdates(
            drag.nodeIds ?? [],
            drag.origin ?? {},
            drag.meta?.bounds ?? null,
            resizeResult,
        );

        if (updates.length > 0) {
            dispatcher.dispatch({
                type: 'node.layout.bulk',
                payload: { updates },
            });
        }

        return { handled: true };
    }

    if (input.type === 'pointerup') {
        if (!drag?.active || drag.type !== 'resize') return null;
        dispatcher.dispatch({
            type: EventTypes.DRAG_END,
        });
        return { handled: true };
    }

    return null;
}

function rotateToolHandler(input, context) {
    const runtimeState = context.state;
    const dispatcher = context.dispatcher;
    const worldPoint = input.worldPoint;
    if (!runtimeState || !dispatcher || !worldPoint) return null;

    const drag = runtimeState?.interaction?.drag ?? null;
    const nodesById = runtimeState?.nodes ?? {};

    if (input.type === 'pointerdown') {
        const hit = resolvePrimaryHit(runtimeState, worldPoint);
        if (!hit?.id) return null;

        const selectionIds = Array.from(runtimeState?.selection?.ids ?? []);
        const nodeIds = resolveSessionNodeIds(selectionIds, hit.id);
        const bounds = deriveSelectionBounds(nodeIds, nodesById);
        const pivot = computeRotateAnchor(bounds);
        if (!bounds || !pivot) return null;

        if (!selectionIds.includes(hit.id)) {
            dispatcher.dispatch(selectNode(hit.id));
        }

        dispatcher.dispatch({
            type: EventTypes.DRAG_START,
            payload: {
                type: 'rotate',
                nodeIds,
                pointer: worldPoint,
                meta: {
                    pivot,
                },
            },
        });

        return { handled: true };
    }

    if (input.type === 'pointermove') {
        if (!drag?.active || drag.type !== 'rotate') return null;

        const pivot = drag.meta?.pivot ?? null;
        const previousRotation = computeRotationDelta(
            drag.startPointer,
            drag.currentPointer,
            pivot,
        ).rotation;
        const nextRotation = computeRotationDelta(
            drag.startPointer,
            worldPoint,
            pivot,
        ).rotation;
        const deltaRotation = normalizeAngle(nextRotation - previousRotation);

        dispatcher.dispatch({
            type: EventTypes.DRAG_UPDATE,
            payload: {
                pointer: worldPoint,
                guides: [],
            },
        });

        if (deltaRotation !== 0) {
            dispatcher.dispatch({
                type: EventTypes.NODE_ROTATE,
                payload: {
                    nodeIds: drag.nodeIds ?? [],
                    rotation: deltaRotation,
                },
            });
        }

        return { handled: true };
    }

    if (input.type === 'pointerup') {
        if (!drag?.active || drag.type !== 'rotate') return null;
        dispatcher.dispatch({
            type: EventTypes.DRAG_END,
        });
        return { handled: true };
    }

    return null;
}

function shapeToolHandler(input, context) {
    if (input.type !== EventTypes.INPUT_CREATE_COMMIT) return null;

    const eventEnvelope = createNodeCreateEvent({
        type: input.nodeType || 'shape',
        bounds: input.bounds,
        parentId: input.parentId ?? null,
    });

    if (!eventEnvelope?.event) return null;

    context.dispatcher?.dispatch?.(eventEnvelope.event);
    return { handled: true };
}

export function registerDefaultGraphToolHandlers() {
    registerToolHandler('select', selectToolHandler);
    registerToolHandler('move', moveToolHandler);
    registerToolHandler('resize', resizeToolHandler);
    registerToolHandler('rotate', rotateToolHandler);
    registerToolHandler('shape', shapeToolHandler);
}

export function unregisterDefaultGraphToolHandlers() {
    unregisterToolHandler('select');
    unregisterToolHandler('move');
    unregisterToolHandler('resize');
    unregisterToolHandler('rotate');
    unregisterToolHandler('shape');
}
