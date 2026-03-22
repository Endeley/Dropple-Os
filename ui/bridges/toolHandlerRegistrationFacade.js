import { createNodeCreateEvent } from '@/runtime/input/nodeCreateRuntimeBridge.js';
import { computeSelectionBounds } from '@/domain/geometry/selectionBounds.js';
import {
    registerToolHandler,
    unregisterToolHandler,
} from '@/runtime/tools/toolController.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import {
    applyAxisLock,
    computeRawDragDelta,
} from '@/runtime/interaction/dragEngine.js';
import { computeGroupBounds } from '@/runtime/interaction/groupBoundsEngine.js';
import { computeGroupMoveUpdates } from '@/runtime/interaction/groupMoveEngine.js';
import { buildGroupSnapContext } from '@/runtime/interaction/groupSnapContext.js';
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
import { selectBounds } from '@/runtime/selection/selectBounds.js';
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

function getNodeRect(node) {
    const props = node?.props || {};
    const layout = node?.layout || {};

    return {
        x: layout.x ?? node?.x ?? props.x ?? 0,
        y: layout.y ?? node?.y ?? props.y ?? 0,
        width: layout.width ?? node?.width ?? props.width ?? 0,
        height: layout.height ?? node?.height ?? props.height ?? 0,
    };
}

function deriveDraggedBounds(nodeIds, origin, nodesById, dx, dy) {
    const primaryNodeId = Array.isArray(nodeIds) ? nodeIds[0] : null;
    if (!primaryNodeId) return null;

    const node = nodesById?.[primaryNodeId];
    if (!node) return null;

    const rect = getNodeRect(node);
    const start = origin?.[primaryNodeId] ?? {
        x: rect.x,
        y: rect.y,
    };

    return buildGroupSnapContext({
        x: start.x + dx,
        y: start.y + dy,
        width: rect.width,
        height: rect.height,
    });
}

function buildGroupDragState(nodesById, nodeIds) {
    const sortedIds = Array.isArray(nodeIds) ? [...nodeIds].sort() : [];
    if (sortedIds.length <= 1) return null;

    const bounds = computeGroupBounds(nodesById, sortedIds);
    if (!bounds) return null;

    const members = Object.fromEntries(
        sortedIds.flatMap((nodeId) => {
            const node = nodesById?.[nodeId];
            if (!node) return [];

            const originBounds = getNodeRect(node);
            const centerX = originBounds.x + originBounds.width / 2;
            const centerY = originBounds.y + originBounds.height / 2;

            return [[
                nodeId,
                {
                    originBounds,
                    offsetFromGroupOrigin: {
                        x: originBounds.x - bounds.x,
                        y: originBounds.y - bounds.y,
                    },
                    centerOffsetFromGroupCenter: {
                        x: centerX - bounds.center.x,
                        y: centerY - bounds.center.y,
                    },
                    rotation: Number(node?.rotation ?? 0),
                },
            ]];
        }),
    );

    return {
        nodeIds: sortedIds,
        bounds,
        center: bounds.center,
        members,
    };
}

function resolvePrimaryHit(runtimeState, worldPoint, inputEvent = null, targetNodeId = null) {
    if (targetNodeId) {
        return runtimeState?.nodes?.[targetNodeId] ?? { id: targetNodeId };
    }

    const eventTargetNodeId =
        inputEvent?.target instanceof Element
            ? inputEvent.target.closest?.('[data-node-id]')?.dataset?.nodeId ?? null
            : null;

    if (eventTargetNodeId) {
        return runtimeState?.nodes?.[eventTargetNodeId] ?? { id: eventTargetNodeId };
    }

    const pointHit = hitTestPoint({
        runtime: runtimeState,
        x: worldPoint.x,
        y: worldPoint.y,
    });

    if (typeof pointHit === 'string') {
        return runtimeState?.nodes?.[pointHit] ?? { id: pointHit };
    }

    if (pointHit?.id) return pointHit;

    return null;
}

export function resolveNextMoveSelection({
    additive = false,
    currentSelection = [],
    hitNodeId = null,
}) {
    if (!hitNodeId) return Array.isArray(currentSelection) ? currentSelection : [];

    if (additive) {
        const exists = currentSelection.includes(hitNodeId);
        return exists
            ? currentSelection.filter((id) => id !== hitNodeId)
            : [...currentSelection, hitNodeId];
    }

    return currentSelection.includes(hitNodeId)
        ? currentSelection
        : [hitNodeId];
}

export function dispatchMoveDragStart({
    dispatcher,
    runtimeState,
    worldPoint,
    hitNodeId,
    additive = false,
}) {
    if (!dispatcher || !runtimeState || !worldPoint || !hitNodeId) {
        return false;
    }

    const nodesById = runtimeState?.nodes ?? {};
    const currentSelection = Array.from(runtimeState?.selection?.ids ?? []);
    const nextSelection = resolveNextMoveSelection({
        additive,
        currentSelection,
        hitNodeId,
    });
    const nodeIds = nextSelection.length > 0 ? nextSelection : [hitNodeId];

    const origin = Object.fromEntries(
        nodeIds.map((nodeId) => {
            const node = nodesById[nodeId];
            const layout = node?.layout ?? {};
            return [nodeId, {
                x: layout.x ?? 0,
                y: layout.y ?? 0,
            }];
        }),
    );

    const selectionEvent = additive
        ? toggleNode(hitNodeId)
        : selectNode(hitNodeId);

    dispatcher.dispatch(selectionEvent);

    dispatcher.dispatch({
        type: EventTypes.DRAG_START,
        payload: {
            type: 'move',
            nodeIds,
            pointer: worldPoint,
            origin,
            group: buildGroupDragState(nodesById, nodeIds),
            meta: {
                snapTargets: collectSnapTargets(runtimeState, { nodeIds }),
            },
        },
    });

    return true;
}

/* =========================
   SELECT TOOL HANDLER
========================= */

function selectToolHandler(input, context) {
    const runtimeState = context.state;
    const dispatcher = context.dispatcher;
    const worldPoint = input.worldPoint;

    if (!runtimeState || !dispatcher || !worldPoint) return null;

    const drag = runtimeState?.interaction?.drag ?? null;

    if (input.type === 'pointerdown') {
        const hit = resolvePrimaryHit(runtimeState, worldPoint, input.event, input.targetNodeId);
        const additive = input.event?.shiftKey ?? input.modifiers?.shift ?? false;

        if (hit?.id) {
            if (additive) {
                dispatcher.dispatch(toggleNode(hit.id));
                return { handled: true };
            }

            dispatchMoveDragStart({
                dispatcher,
                runtimeState,
                worldPoint,
                hitNodeId: hit.id,
                additive,
            });
            return { handled: true };
        }

        if (!additive) {
            dispatcher.dispatch(clearSelection());
        }

        dispatcher.dispatch({
            type: EventTypes.DRAG_START,
            payload: {
                type: 'select',
                nodeIds: [],
                pointer: worldPoint,
                meta: {
                    additive,
                },
            },
        });

        return { handled: true };
    }

    if (input.type === 'pointermove') {
        if (!drag?.active || drag.type !== 'select') return null;

        dispatcher.dispatch({
            type: EventTypes.DRAG_UPDATE,
            payload: {
                pointer: worldPoint,
                guides: [],
            },
        });

        return { handled: true };
    }

    if (input.type === 'pointerup') {
        if (!drag?.active || drag.type !== 'select') return null;

        const start = drag.startPointer ?? worldPoint;
        const current = drag.currentPointer ?? worldPoint;
        const bounds = {
            x: Math.min(start.x, current.x),
            y: Math.min(start.y, current.y),
            width: Math.abs(current.x - start.x),
            height: Math.abs(current.y - start.y),
        };

        if (bounds.width > 0 || bounds.height > 0) {
            const result = selectBounds(runtimeState, bounds);
            const additive = drag?.meta?.additive === true;

            if (additive) {
                const existing = Array.from(runtimeState.selection?.ids ?? []);
                const merged = Array.from(new Set([...existing, ...(result?.payload?.ids ?? [])]));
                dispatcher.dispatch({
                    type: EventTypes.SELECTION_SET,
                    payload: {
                        ids: merged,
                        primary: merged[0] ?? null,
                    },
                });
            } else {
                dispatcher.dispatch(result);
            }
        }

        dispatcher.dispatch({ type: EventTypes.DRAG_END });
        return { handled: true };
    }

    return null;
}

/* =========================
   FIXED MOVE TOOL HANDLER
========================= */

function moveToolHandler(input, context) {
    const runtimeState = context.state;
    const dispatcher = context.dispatcher;
    const worldPoint = input.worldPoint;

    if (!runtimeState || !dispatcher || !worldPoint) return null;

    const drag = runtimeState?.interaction?.drag ?? null;
    const nodesById = runtimeState?.nodes ?? {};

    if (input.type === 'pointerdown') {
        let hit = resolvePrimaryHit(runtimeState, worldPoint, input.event, input.targetNodeId);

        if (!hit?.id) {
            dispatcher.dispatch(clearSelection());
            return { handled: true };
        }

        const additive = input.event?.shiftKey ?? false;
        dispatchMoveDragStart({
            dispatcher,
            runtimeState,
            worldPoint,
            hitNodeId: hit.id,
            additive,
        });

        return { handled: true };
    }

    if (input.type === 'pointermove') {
        if (drag?.active && drag.type === 'move') {
            const dragNodeIds = Array.isArray(drag?.nodeIds) ? drag.nodeIds : [];
            const nextDragState = {
                ...drag,
                currentPointer: worldPoint,
            };

            const isGroup = dragNodeIds.length > 1;

            const rawDelta = applyAxisLock(
                computeRawDragDelta(nextDragState),
                { axisLock: input.event?.shiftKey === true }
            );

            const projectedBounds = isGroup
                ? buildGroupSnapContext({
                    x: drag.group.bounds.x + rawDelta.dx,
                    y: drag.group.bounds.y + rawDelta.dy,
                    width: drag.group.bounds.width,
                    height: drag.group.bounds.height,
                    center: {
                        x: drag.group.center.x + rawDelta.dx,
                        y: drag.group.center.y + rawDelta.dy,
                    },
                })
                : deriveDraggedBounds(
                    dragNodeIds,
                    drag?.origin ?? {},
                    nodesById,
                    rawDelta.dx,
                    rawDelta.dy,
                );

            const resolved = resolveSnap(rawDelta, {
                bounds: projectedBounds,
                targets: drag?.meta?.snapTargets ?? collectSnapTargets(runtimeState, drag),
                threshold: 8,
                grid: 10,
            });

            const velocity = computeVelocity(
                drag.previousPointer ?? drag.currentPointer,
                worldPoint,
            );

            const magnetic = applyMagneticSnap(rawDelta, resolved, {
                threshold: 8,
                minStrength: 0.2,
                maxStrength: 1,
                velocity,
                velocityFalloff: 0.06,
            });

            dispatcher.dispatch({
                type: EventTypes.DRAG_UPDATE,
                payload: {
                    pointer: worldPoint,
                    guides: resolved.guides ?? [],
                },
            });

            const updates = isGroup
                ? computeGroupMoveUpdates(drag.group, magnetic)
                : dragNodeIds.map((nodeId) => {
                    const origin = drag.origin[nodeId];
                    return {
                        nodeId,
                        x: origin.x + magnetic.dx,
                        y: origin.y + magnetic.dy,
                    };
                });

            dispatcher.dispatch({
                type: 'node.layout.bulk',
                payload: {
                    updates: updates.map((update) => ({
                        id: update.nodeId,
                        x: update.x,
                        y: update.y,
                    })),
                },
            });

            return { handled: true };
        }
    }

    if (input.type === 'pointerup') {
        if (drag?.active && drag.type === 'move') {
            dispatcher.dispatch({ type: EventTypes.DRAG_END });
            return { handled: true };
        }
    }

    return null;
}

/* =========================
   KEEP OTHER HANDLERS SAME
========================= */

function createToolCommitHandler(input, context) {
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

/* =========================
   REGISTRATION
========================= */

export function registerDefaultGraphToolHandlers() {
    registerToolHandler('select', selectToolHandler);
    registerToolHandler('move', moveToolHandler);
    registerToolHandler('frame', createToolCommitHandler);
    registerToolHandler('shape', createToolCommitHandler);
    registerToolHandler('text', createToolCommitHandler);
    registerToolHandler('image', createToolCommitHandler);
    registerToolHandler('layer', createToolCommitHandler);
    registerToolHandler('defaultCreate', createToolCommitHandler);
}

export function unregisterDefaultGraphToolHandlers() {
    unregisterToolHandler('select');
    unregisterToolHandler('move');
    unregisterToolHandler('frame');
    unregisterToolHandler('shape');
    unregisterToolHandler('text');
    unregisterToolHandler('image');
    unregisterToolHandler('layer');
    unregisterToolHandler('defaultCreate');
}
