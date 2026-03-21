import { createNodeCreateEvent } from '@/runtime/input/nodeCreateRuntimeBridge.js';
import { computeSelectionBounds } from '@/domain/geometry/selectionBounds.js';
import {
    registerToolHandler,
    unregisterToolHandler,
} from '@/runtime/tools/toolController.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import {
    applyAxisLock,
    computeDragDelta,
    computeRawDragDelta,
} from '@/runtime/interaction/dragEngine.js';
import { hitTestPoint } from '@/runtime/hitTest/hitTestPoint.js';
import {
    collectSnapTargets,
    resolveSnap,
} from '@/runtime/interaction/snapResolver.js';
import {
    applyMagneticSnap,
    computeVelocity,
} from '@/runtime/interaction/magneticSnap.js';
import { computeResizeDelta } from '@/runtime/interaction/resizeEngine.js';
import { computeRotationDelta as computeRuntimeRotationDelta } from '@/runtime/interaction/rotationEngine.js';
import { snapAngle } from '@/runtime/interaction/snapAngle.js';
import { applyMagneticRotation } from '@/runtime/interaction/magneticRotation.js';
import { clearSelection } from '@/runtime/selection/clearSelection.js';
import { selectNode } from '@/runtime/selection/selectNode.js';
import { toggleNode } from '@/runtime/selection/toggleNode.js';
import { computeRotateAnchor } from '@/runtime/transforms/computeRotateAnchor.js';
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

function resolveDraggedBounds(runtimeState, drag) {
    return deriveDraggedBounds(
        drag?.nodeIds ?? [],
        drag?.origin ?? {},
        runtimeState?.nodes ?? {},
        0,
        0,
    );
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

function radiansToDegrees(angle) {
    return Math.round((angle * 180) / Math.PI);
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
            const nextDragState = {
                ...drag,
                currentPointer: worldPoint,
            };
            const startBounds = resolveDraggedBounds(runtimeState, drag);
            const rawDelta = applyAxisLock(
                computeRawDragDelta(nextDragState),
                {
                    axisLock: input.event?.shiftKey === true,
                },
            );
            const resolved = computeDragDelta(nextDragState, {
                snapResolver: resolveSnap,
                snapContext: {
                    bounds: startBounds,
                    targets: collectSnapTargets(runtimeState, drag),
                    threshold: 8,
                    grid: 10,
                },
                axisLock: input.event?.shiftKey === true,
            });
            const velocity = computeVelocity(
                drag.previousPointer ?? drag.currentPointer,
                worldPoint,
            );
            const magnetic = applyMagneticSnap(
                rawDelta,
                resolved,
                {
                    threshold: 8,
                    minStrength: 0.2,
                    maxStrength: 1,
                    velocity,
                    velocityFalloff: 0.06,
                },
            );
            const { guides } = resolved;
            const { dx, dy } = magnetic;

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

            return { handled: true, magnetic };
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
                handle: resolveResizeHandle(bounds, worldPoint),
                originBounds: bounds,
                meta: {
                    parentBounds: nodeIds.length === 1 ? deriveParentBounds(nodeIds[0], nodesById) : null,
                },
            },
        });

        return { handled: true };
    }

    if (input.type === 'pointermove') {
        if (!drag?.active || drag.type !== 'resize') return null;

        const nextDragState = {
            ...drag,
            currentPointer: worldPoint,
        };
        const rawDelta = computeRawDragDelta(nextDragState);
        const resolved = computeDragDelta(nextDragState, {
            snapResolver: resolveSnap,
            snapContext: {
                mode: 'resize',
                handle: drag.resize?.handle ?? null,
                bounds: drag.resize?.originBounds ?? null,
                targets: collectSnapTargets(runtimeState, drag),
                threshold: 8,
                grid: 10,
            },
        });
        const velocity = computeVelocity(
            drag.previousPointer ?? drag.currentPointer,
            worldPoint,
        );
        const magnetic = applyMagneticSnap(
            rawDelta,
            resolved,
            {
                threshold: 8,
                minStrength: 0.2,
                maxStrength: 1,
                velocity,
                velocityFalloff: 0.06,
            },
        );
        const bounds = computeResizeDelta(drag, magnetic);
        if (!bounds) return null;

        dispatcher.dispatch({
            type: EventTypes.DRAG_UPDATE,
            payload: {
                pointer: worldPoint,
                guides: resolved.guides ?? [],
            },
        });

        dispatcher.dispatch({
            type: 'node.layout.resize',
            payload: {
                nodeId: drag.nodeIds?.[0],
                ...bounds,
            },
        });

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
                center: pivot,
                originAngle: Number(nodesById?.[hit.id]?.rotation ?? 0),
            },
        });

        return { handled: true };
    }

    if (input.type === 'pointermove') {
        if (!drag?.active || drag.type !== 'rotate') return null;

        const nextDragState = {
            ...drag,
            currentPointer: worldPoint,
        };
        const raw = computeRuntimeRotationDelta(nextDragState);
        const snapped = snapAngle(raw.angle, {
            step: 15,
            threshold: 6,
        });
        const velocity = computeVelocity(
            drag.previousPointer ?? drag.currentPointer,
            worldPoint,
        );
        const finalAngle = applyMagneticRotation(
            raw.angle,
            snapped.angle,
            {
                velocity,
                threshold: 6,
                velocityFalloff: 0.05,
            },
        );

        dispatcher.dispatch({
            type: EventTypes.DRAG_UPDATE,
            payload: {
                pointer: worldPoint,
                guides: snapped.snapped
                    ? [{
                        type: 'angle',
                        angle: snapped.angle,
                    }]
                    : [],
            },
        });

        if (Number.isFinite(finalAngle)) {
            dispatcher.dispatch({
                type: 'node.layout.rotate',
                payload: {
                    nodeId: drag.nodeIds?.[0],
                    rotation: normalizeAngle(finalAngle),
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
