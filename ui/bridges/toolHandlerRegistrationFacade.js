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
import { resolveBoundsSelection, selectBounds } from '@/runtime/selection/selectBounds.js';
import { selectNode } from '@/runtime/selection/selectNode.js';
import { toggleNode } from '@/runtime/selection/toggleNode.js';
import { resolveTargetNodeId } from '@/ui/interactions/resolveTargetNodeId.js';

const MOVE_DRAG_THRESHOLD = 3;

function normalizeAngle(angle) {
    const TAU = Math.PI * 2;
    let next = angle;
    while (next > Math.PI) next -= TAU;
    while (next < -Math.PI) next += TAU;
    return next;
}

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

    const eventTargetNodeId = resolveTargetNodeId(inputEvent?.target ?? null, {
        x: inputEvent?.clientX,
        y: inputEvent?.clientY,
    });

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

function resolveDirectTargetNodeId(element) {
    let current = element;

    while (current && !(current instanceof Element)) {
        current = current.parentNode;
    }

    while (current) {
        if (current.dataset?.nodeId) return current.dataset.nodeId;
        current = current.parentElement;
    }

    return null;
}

function isSelectionRectPastThreshold(bounds) {
    if (!bounds) return false;
    return Math.max(bounds.width ?? 0, bounds.height ?? 0) >= MOVE_DRAG_THRESHOLD;
}

function buildMarqueeBounds(startPoint, currentPoint) {
    const start = startPoint ?? currentPoint ?? { x: 0, y: 0 };
    const current = currentPoint ?? start;
    return {
        x: Math.min(start.x, current.x),
        y: Math.min(start.y, current.y),
        width: Math.abs(current.x - start.x),
        height: Math.abs(current.y - start.y),
    };
}

function startMarqueeDrag(dispatcher, worldPoint, meta = {}) {
    dispatcher.dispatch({
        type: EventTypes.DRAG_START,
        payload: {
            type: 'marquee',
            nodeIds: [],
            pointer: worldPoint,
            meta,
        },
    });
}

function startPendingSelectDrag(dispatcher, worldPoint, meta = {}) {
    dispatcher.dispatch({
        type: EventTypes.DRAG_START,
        payload: {
            type: 'pending-select',
            nodeIds: [],
            pointer: worldPoint,
            meta,
        },
    });
}

function buildPendingMovePayload(runtimeState, startPointer, hitNodeId, additive = false) {
    const nodesById = runtimeState?.nodes ?? {};
    const currentSelection = Array.from(runtimeState?.selection?.ids ?? []);
    const nextSelection = resolveNextMoveSelection({
        additive,
        currentSelection,
        hitNodeId,
    });
    const nodeIds = nextSelection.length > 0 ? nextSelection : [hitNodeId];

    return {
        type: 'pending-move',
        nodeIds,
        pointer: startPointer,
        origin: Object.fromEntries(
            nodeIds.map((nodeId) => {
                const node = nodesById[nodeId];
                const layout = node?.layout ?? {};
                return [nodeId, {
                    x: layout.x ?? 0,
                    y: layout.y ?? 0,
                }];
            }),
        ),
        group: buildGroupDragState(nodesById, nodeIds),
        meta: {
            snapTargets: collectSnapTargets(runtimeState, { nodeIds }),
            additive,
            hitNodeId,
        },
    };
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
            type: 'pending-move',
            nodeIds,
            pointer: worldPoint,
            origin,
            group: buildGroupDragState(nodesById, nodeIds),
            meta: {
                snapTargets: collectSnapTargets(runtimeState, { nodeIds }),
                additive,
                hitNodeId,
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

    // Selection clicks can promote directly into a move drag. Once that happens,
    // continue routing move updates/end through the move handler even if the
    // active tool is still "select".
    if ((input.type === 'pointermove' || input.type === 'pointerup' || input.type === 'pointercancel') && drag?.active && (drag.type === 'move' || drag.type === 'pending-move')) {
        return moveToolHandler(input, context);
    }
    if ((input.type === 'pointermove' || input.type === 'pointerup' || input.type === 'pointercancel') && drag?.active && drag.type === 'resize') {
        return resizeToolHandler(input, context);
    }
    if ((input.type === 'pointermove' || input.type === 'pointerup' || input.type === 'pointercancel') && drag?.active && drag.type === 'rotate') {
        return rotateToolHandler(input, context);
    }

    if (input.type === 'pointerdown') {
        const hit = resolvePrimaryHit(runtimeState, worldPoint, input.event, input.targetNodeId);
        const directHitNodeId = resolveDirectTargetNodeId(input.event?.target ?? null);
        const additive = input.event?.shiftKey ?? input.modifiers?.shift ?? false;
        const currentSelection = Array.from(runtimeState?.selection?.ids ?? []);
        startPendingSelectDrag(dispatcher, worldPoint, {
            additive,
            hitNodeId: hit?.id ?? null,
            directHitNodeId,
            wasHitSelected: hit?.id ? currentSelection.includes(hit.id) : false,
            pendingToggleId: additive ? hit?.id ?? null : null,
        });

        return { handled: true };
    }

    if (input.type === 'pointermove') {
        if (!drag?.active) return null;

        if (drag.type === 'pending-select') {
            const bounds = buildMarqueeBounds(drag.startPointer ?? worldPoint, worldPoint);
            if (!isSelectionRectPastThreshold(bounds)) {
                return { handled: true };
            }

            const additive = drag?.meta?.additive === true;
            const hitNodeId = drag?.meta?.hitNodeId ?? null;
            const directHitNodeId = drag?.meta?.directHitNodeId ?? null;
            const wasHitSelected = drag?.meta?.wasHitSelected === true;
            const startPointer = drag.startPointer ?? worldPoint;

            if (directHitNodeId && hitNodeId && wasHitSelected && !additive) {
                const selectionEvent = selectNode(hitNodeId);
                const pendingMovePayload = buildPendingMovePayload(
                    runtimeState,
                    startPointer,
                    hitNodeId,
                    additive,
                );

                dispatcher.dispatch(selectionEvent);
                dispatcher.dispatch({
                    type: EventTypes.DRAG_START,
                    payload: pendingMovePayload,
                });

                return moveToolHandler(input, {
                    ...context,
                    state: {
                        ...runtimeState,
                        selection: {
                            ...(runtimeState?.selection ?? {}),
                            ids: pendingMovePayload.nodeIds,
                            primary: pendingMovePayload.nodeIds[0] ?? null,
                        },
                        interaction: {
                            ...(runtimeState?.interaction ?? {}),
                            drag: {
                                active: true,
                                ...pendingMovePayload,
                                startPointer,
                                previousPointer: startPointer,
                                currentPointer: startPointer,
                                guides: [],
                            },
                        },
                    },
                });
            }

            startMarqueeDrag(dispatcher, startPointer, {
                additive,
                pendingToggleId: drag?.meta?.pendingToggleId ?? null,
                hitNodeId,
            });

            dispatcher.dispatch({
                type: EventTypes.DRAG_UPDATE,
                payload: {
                    pointer: worldPoint,
                    guides: [],
                },
            });

            return { handled: true };
        }

        if (drag.type !== 'marquee') return null;

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
        if (!drag?.active) return null;

        if (drag.type === 'pending-select') {
            const additive = drag?.meta?.additive === true;
            const hitNodeId = drag?.meta?.hitNodeId ?? null;
            const pendingToggleId = drag?.meta?.pendingToggleId ?? null;

            if (additive && pendingToggleId) {
                dispatcher.dispatch(toggleNode(pendingToggleId));
            } else if (hitNodeId) {
                dispatcher.dispatch(selectNode(hitNodeId));
            } else if (!additive) {
                dispatcher.dispatch(clearSelection());
            }

            dispatcher.dispatch({ type: EventTypes.DRAG_END });
            return { handled: true };
        }

        if (drag.type !== 'marquee') return null;

        const bounds = buildMarqueeBounds(drag.startPointer ?? worldPoint, drag.currentPointer ?? worldPoint);
        const additive = drag?.meta?.additive === true;
        const pendingToggleId = drag?.meta?.pendingToggleId ?? null;
        const hasMarqueeArea = isSelectionRectPastThreshold(bounds);

        if (hasMarqueeArea) {
            const selection = resolveBoundsSelection(runtimeState, bounds, {
                additive,
                existingIds: Array.from(runtimeState.selection?.ids ?? []),
            });
            dispatcher.dispatch(selectBounds(runtimeState, bounds, {
                additive,
                existingIds: Array.from(runtimeState.selection?.ids ?? []),
            }));
        } else if (additive && pendingToggleId) {
            dispatcher.dispatch(toggleNode(pendingToggleId));
        }

        dispatcher.dispatch({ type: EventTypes.DRAG_END });
        return { handled: true };
    }

    if (input.type === 'pointercancel') {
        if (!drag?.active) return null;
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
        let activeDrag = drag;

        if (drag?.active && drag.type === 'pending-move') {
            const promotedDrag = {
                ...drag,
                type: 'move',
                currentPointer: worldPoint,
            };
            const rawDelta = computeRawDragDelta(promotedDrag);
            const distance = Math.max(Math.abs(rawDelta.dx ?? 0), Math.abs(rawDelta.dy ?? 0));

            if (distance < MOVE_DRAG_THRESHOLD) {
                return { handled: true };
            }

            dispatcher.dispatch({
                type: EventTypes.DRAG_START,
                payload: {
                    type: 'move',
                    nodeIds: Array.isArray(drag.nodeIds) ? drag.nodeIds : [],
                    pointer: drag.startPointer ?? worldPoint,
                    origin: drag.origin ?? {},
                    group: drag.group ?? null,
                    meta: drag.meta ?? null,
                },
            });
            activeDrag = promotedDrag;
        }

        if (activeDrag?.active && activeDrag.type === 'move') {
            const dragNodeIds = Array.isArray(activeDrag?.nodeIds) ? activeDrag.nodeIds : [];
            const nextDragState = {
                ...activeDrag,
                currentPointer: worldPoint,
            };

            const isGroup = dragNodeIds.length > 1;

            const rawDelta = applyAxisLock(
                computeRawDragDelta(nextDragState),
                { axisLock: input.event?.shiftKey === true }
            );

            const projectedBounds = isGroup
                ? buildGroupSnapContext({
                    x: activeDrag.group.bounds.x + rawDelta.dx,
                    y: activeDrag.group.bounds.y + rawDelta.dy,
                    width: activeDrag.group.bounds.width,
                    height: activeDrag.group.bounds.height,
                    center: {
                        x: activeDrag.group.center.x + rawDelta.dx,
                        y: activeDrag.group.center.y + rawDelta.dy,
                    },
                })
                : deriveDraggedBounds(
                    dragNodeIds,
                    activeDrag?.origin ?? {},
                    nodesById,
                    rawDelta.dx,
                    rawDelta.dy,
                );

            const resolved = resolveSnap(rawDelta, {
                bounds: projectedBounds,
                targets: activeDrag?.meta?.snapTargets ?? collectSnapTargets(runtimeState, activeDrag),
                threshold: 8,
                grid: 10,
            });

            const velocity = computeVelocity(
                activeDrag.previousPointer ?? activeDrag.currentPointer,
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
                ? computeGroupMoveUpdates(activeDrag.group, magnetic)
                : dragNodeIds.map((nodeId) => {
                    const origin = activeDrag.origin[nodeId];
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
        if (drag?.active && drag.type === 'pending-move') {
            dispatcher.dispatch({ type: EventTypes.DRAG_END });
            return { handled: true };
        }

        if (drag?.active && drag.type === 'move') {
            dispatcher.dispatch({ type: EventTypes.DRAG_END });
            return { handled: true };
        }
    }

    if (input.type === 'pointercancel') {
        if (drag?.active && drag.type === 'pending-move') {
            dispatcher.dispatch({ type: EventTypes.DRAG_END });
            return { handled: true };
        }

        if (drag?.active && drag.type === 'move') {
            dispatcher.dispatch({ type: EventTypes.DRAG_END });
            return { handled: true };
        }
    }

    return null;
}

function resizeToolHandler(input, context) {
    const runtimeState = context.state;
    const dispatcher = context.dispatcher;
    const worldPoint = input.worldPoint;

    if (!runtimeState || !dispatcher || !worldPoint) return null;

    const drag = runtimeState?.interaction?.drag ?? null;
    const selectedIds = Array.from(runtimeState?.selection?.ids ?? []);

    if (input.type === 'pointerdown') {
        if (selectedIds.length > 1) return null;

        const handle = input.resizeHandle ?? null;
        const nodeId = input.targetNodeId ?? null;
        if (!handle || !nodeId) return null;

        const node = runtimeState?.nodes?.[nodeId];
        if (!node) return null;

        const originBounds = getNodeRect(node);

        dispatcher.dispatch({
            type: EventTypes.DRAG_START,
            payload: {
                type: 'resize',
                nodeIds: [nodeId],
                pointer: worldPoint,
                origin: {
                    [nodeId]: originBounds,
                },
                handle,
                originBounds,
            },
        });

        return { handled: true };
    }

    if (input.type === 'pointermove') {
        if (!drag?.active || drag.type !== 'resize') return null;

        const nodeId = Array.isArray(drag.nodeIds) ? drag.nodeIds[0] : null;
        if (!nodeId) return null;

        const nextDragState = {
            ...drag,
            currentPointer: worldPoint,
        };
        const rawDelta = computeRawDragDelta(nextDragState);
        const nextBounds = computeResizeDelta(drag, rawDelta);
        if (!nextBounds) return null;

        dispatcher.dispatch({
            type: EventTypes.DRAG_UPDATE,
            payload: {
                pointer: worldPoint,
                guides: [],
            },
        });

        dispatcher.dispatch({
            type: 'node.layout.bulk',
            payload: {
                updates: [{
                    id: nodeId,
                    x: nextBounds.x,
                    y: nextBounds.y,
                    width: nextBounds.width,
                    height: nextBounds.height,
                }],
            },
        });

        return { handled: true };
    }

    if (input.type === 'pointerup' || input.type === 'pointercancel') {
        if (!drag?.active || drag.type !== 'resize') return null;
        dispatcher.dispatch({ type: EventTypes.DRAG_END });
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
    const selectedIds = Array.from(runtimeState?.selection?.ids ?? []);

    if (input.type === 'pointerdown') {
        if (selectedIds.length > 1) return null;

        const nodeId = input.targetNodeId ?? null;
        if (!nodeId) return null;

        const node = runtimeState?.nodes?.[nodeId];
        if (!node) return null;

        const bounds = getNodeRect(node);
        const center = {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2,
        };

        dispatcher.dispatch({
            type: EventTypes.DRAG_START,
            payload: {
                type: 'rotate',
                nodeIds: [nodeId],
                pointer: worldPoint,
                origin: {
                    [nodeId]: { rotation: Number(node?.rotation ?? 0) },
                },
                originAngle: Number(node?.rotation ?? 0),
                center,
            },
        });

        return { handled: true };
    }

    if (input.type === 'pointermove') {
        if (!drag?.active || drag.type !== 'rotate') return null;

        const nodeId = Array.isArray(drag.nodeIds) ? drag.nodeIds[0] : null;
        if (!nodeId) return null;
        const node = runtimeState?.nodes?.[nodeId];
        if (!node) return null;

        const nextDragState = {
            ...drag,
            currentPointer: worldPoint,
        };
        const rawAngle = computeRuntimeRotationDelta(nextDragState).angle;
        const snappedAngle = snapAngle(rawAngle, 15);
        const resolvedAngle = applyMagneticRotation(rawAngle, snappedAngle, {
            threshold: 6,
        });
        const currentRotation = Number(node?.rotation ?? 0);
        const rotationDelta = normalizeAngle(resolvedAngle - currentRotation);

        dispatcher.dispatch({
            type: EventTypes.DRAG_UPDATE,
            payload: {
                pointer: worldPoint,
                guides: [],
            },
        });

        dispatcher.dispatch({
            type: EventTypes.NODE_ROTATE,
            payload: {
                nodeIds: [nodeId],
                rotation: rotationDelta,
            },
        });

        return { handled: true };
    }

    if (input.type === 'pointerup' || input.type === 'pointercancel') {
        if (!drag?.active || drag.type !== 'rotate') return null;
        dispatcher.dispatch({ type: EventTypes.DRAG_END });
        return { handled: true };
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
    registerToolHandler('resize', resizeToolHandler);
    registerToolHandler('rotate', rotateToolHandler);
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
    unregisterToolHandler('resize');
    unregisterToolHandler('rotate');
    unregisterToolHandler('frame');
    unregisterToolHandler('shape');
    unregisterToolHandler('text');
    unregisterToolHandler('image');
    unregisterToolHandler('layer');
    unregisterToolHandler('defaultCreate');
}

export const __TESTING__ = Object.freeze({
    buildGroupDragState,
    dispatchMoveDragStart,
    moveToolHandler,
    resizeToolHandler,
    rotateToolHandler,
    resolvePrimaryHit,
    selectToolHandler,
});
