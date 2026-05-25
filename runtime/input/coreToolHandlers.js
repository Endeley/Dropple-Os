import { EventTypes } from '@/core/events/eventTypes.js';
import { getNodes } from '@/runtime/document/documentAdapter.js';
import { hitTestPoint } from '@/runtime/hitTest/index.js';
import { computeDragDelta } from '@/runtime/interaction/dragEngine.js';
import { computeRotationDelta } from '@/runtime/interaction/rotationEngine.js';
import { resolveBoundsSelection } from '@/runtime/selection/selectBounds.js';
import { registerToolHandler, unregisterToolHandler } from '@/runtime/tools/toolController.js';
import { createNodeCreateEvent } from '@/runtime/input/nodeCreateRuntimeBridge.js';
import { computeResizeDelta as computeResizeSessionDelta } from '@/runtime/transforms/computeResizeDelta.js';
import { assertCreateSessionInvariant } from '@/runtime/input/createSessionInvariant.js';
import { copySelection } from '@/runtime/clipboard/copySelection.js';
import { generateNodeId } from '@/runtime/nodes/generateNodeId.js';

const DRAG_THRESHOLD = 4;

function getToolNodes(runtimeState) {
    if (runtimeState?.viewNodes && typeof runtimeState.viewNodes === 'object') {
        return runtimeState.viewNodes;
    }

    if (runtimeState?.nodes && typeof runtimeState.nodes === 'object') {
        return runtimeState.nodes;
    }

    return getNodes(runtimeState) ?? {};
}

function isFiniteBounds(b) {
    return (
        Number.isFinite(b?.x) &&
        Number.isFinite(b?.y) &&
        Number.isFinite(b?.width) &&
        Number.isFinite(b?.height)
    );
}

function isRenderableBounds(b) {
    return isFiniteBounds(b) && b.width > 0 && b.height > 0;
}

function getNodeRect(node, runtimeState) {
    if (!node) return null;

    const computed = runtimeState?.scene?.computed?.[node.id] ?? null;
    const layout = node.layout ?? {};
    const transform = node.transform ?? {};

    const worldBounds = computed?.worldBounds
        ? {
              x: computed.worldBounds.x,
              y: computed.worldBounds.y,
              width: computed.worldBounds.width,
              height: computed.worldBounds.height,
          }
        : null;

    const computedBounds = computed
        ? {
              x: computed.x,
              y: computed.y,
              width: computed.width,
              height: computed.height,
          }
        : null;

    const authoredBounds = {
        x: layout.x ?? node.x ?? transform.x ?? null,
        y: layout.y ?? node.y ?? transform.y ?? null,
        width: layout.width ?? node.width ?? transform.width ?? null,
        height: layout.height ?? node.height ?? transform.height ?? null,
    };

    if (isRenderableBounds(worldBounds)) return worldBounds;
    if (isRenderableBounds(computedBounds)) return computedBounds;
    if (isRenderableBounds(authoredBounds)) return authoredBounds;

    if (isFiniteBounds(worldBounds)) return worldBounds;
    if (isFiniteBounds(computedBounds)) return computedBounds;
    if (isFiniteBounds(authoredBounds)) return authoredBounds;

    return null;
}

function resolvePrimaryHit(runtimeState, worldPoint, _event, targetNodeId) {
    const nodesById = getToolNodes(runtimeState);
    if (targetNodeId && nodesById[targetNodeId]) {
        return nodesById[targetNodeId];
    }

    if (!worldPoint) return null;

    const hit = hitTestPoint({
        runtime: runtimeState,
        x: worldPoint.x,
        y: worldPoint.y,
    });

    return hit?.id ? nodesById[hit.id] ?? hit : null;
}

function dispatchLayoutBulk(dispatcher, updates) {
    if (!dispatcher?.dispatch || !Array.isArray(updates) || updates.length === 0) return;

    dispatcher.dispatch({
        type: 'node.layout.bulk',
        payload: {
            updates,
        },
    });
}

function resolveCurrentSelection(runtimeState) {
    const ids = runtimeState?.selection?.ids;
    if (ids instanceof Set) {
        return Array.from(ids);
    }
    return Array.isArray(ids) ? ids : [];
}

function resolveNextMoveSelection({ additive, currentSelection, hitNodeId }) {
    if (!hitNodeId) return [];
    const current = Array.isArray(currentSelection) ? currentSelection : [];

    if (additive) {
        return Array.from(new Set([...current, hitNodeId]));
    }

    if (current.includes(hitNodeId)) {
        return [...current];
    }

    return [hitNodeId];
}

function buildOriginMap(nodeIds, nodesById, runtimeState) {
    const origin = {};

    nodeIds.forEach((nodeId) => {
        const rect = getNodeRect(nodesById[nodeId], runtimeState);
        if (!rect) return;
        origin[nodeId] = {
            x: rect.x,
            y: rect.y,
        };
    });

    return origin;
}

function remapCopiedNode(node, idMap) {
    const nextId = idMap.get(node.id);
    const mappedParentId = node.parentId ? idMap.get(node.parentId) ?? null : null;
    const mappedChildren = Array.isArray(node.children)
        ? node.children.map((id) => idMap.get(id)).filter(Boolean)
        : [];

    return {
        ...structuredClone(node),
        id: nextId,
        parentId: mappedParentId,
        children: mappedChildren,
    };
}

function duplicateMoveSelection({ dispatcher, runtimeState, nodeIds }) {
    if (!dispatcher?.dispatch || !runtimeState?.document || !Array.isArray(nodeIds) || nodeIds.length === 0) {
        return null;
    }

    const clipboard = copySelection(nodeIds, runtimeState.document);
    if (!clipboard?.nodes?.length) {
        return null;
    }

    const existingIds = new Set(Object.keys(getNodes(runtimeState)).sort());
    const idMap = new Map();

    clipboard.nodes.forEach((node) => {
        let nextId = generateNodeId(node.type || 'node');
        while (existingIds.has(nextId)) {
            nextId = generateNodeId(node.type || 'node');
        }
        existingIds.add(nextId);
        idMap.set(node.id, nextId);
    });

    const createdNodes = clipboard.nodes.map((node) => remapCopiedNode(node, idMap));
    createdNodes.forEach((node) => {
        dispatcher.dispatch({
            type: EventTypes.NODE_CREATE,
            payload: { node },
        });
    });

    createdNodes.forEach((node) => {
        if (!node.parentId) return;
        dispatcher.dispatch({
            type: EventTypes.NODE_ATTACH,
            payload: {
                parentId: node.parentId,
                childId: node.id,
            },
        });
    });

    const duplicatedRootIds = (clipboard.rootIds ?? [])
        .map((id) => idMap.get(id))
        .filter(Boolean);
    if (!duplicatedRootIds.length) return null;

    return {
        nodeIds: duplicatedRootIds,
        primary: duplicatedRootIds[0] ?? null,
    };
}

function dispatchMoveDragStart({
    dispatcher,
    runtimeState,
    worldPoint,
    hitNodeId,
    additive = false,
    duplicate = false,
}) {
    if (!dispatcher?.dispatch || !runtimeState || !worldPoint || !hitNodeId) return false;

    const nodesById = getToolNodes(runtimeState);
    const currentSelection = resolveCurrentSelection(runtimeState);
    let nodeIds = resolveNextMoveSelection({
        additive,
        currentSelection,
        hitNodeId,
    });

    if (!nodeIds.length) return false;

    dispatcher.dispatch({
        type: EventTypes.SELECTION_SET,
        payload: {
            ids: nodeIds,
            primary: hitNodeId,
        },
    });

    const origin = buildOriginMap(nodeIds, nodesById, runtimeState);
    const payload = {
        type: 'pending-move',
        nodeIds,
        pointer: worldPoint,
        origin,
        meta: {
            snapTargets: [],
            duplicateRequested: duplicate,
        },
    };

    if (nodeIds.length > 1) {
        payload.group = {
            nodeIds,
        };
    }

    dispatcher.dispatch({
        type: EventTypes.DRAG_START,
        payload,
    });

    return true;
}

function hasCrossedThreshold(startPointer, currentPointer, threshold = DRAG_THRESHOLD) {
    if (!startPointer || !currentPointer) return false;

    return (
        Math.abs((currentPointer.x ?? 0) - (startPointer.x ?? 0)) >= threshold ||
        Math.abs((currentPointer.y ?? 0) - (startPointer.y ?? 0)) >= threshold
    );
}

function buildMarqueeRect(startPointer, currentPointer) {
    if (!startPointer || !currentPointer) return null;

    return {
        x: Math.min(startPointer.x, currentPointer.x),
        y: Math.min(startPointer.y, currentPointer.y),
        width: Math.abs(currentPointer.x - startPointer.x),
        height: Math.abs(currentPointer.y - startPointer.y),
    };
}

function buildMoveUpdates(nodeIds, origin, delta) {
    return nodeIds
        .map((nodeId) => {
            const start = origin?.[nodeId];
            if (!start) return null;

            return {
                id: nodeId,
                x: start.x + delta.dx,
                y: start.y + delta.dy,
            };
        })
        .filter(Boolean);
}

function moveToolHandler(input, context) {
    const dispatcher = context?.dispatcher;
    const runtimeState = context?.state;
    const drag = runtimeState?.interaction?.drag ?? null;
    const worldPoint = input?.worldPoint ?? null;

    if (!dispatcher?.dispatch || !runtimeState || !worldPoint || !drag?.active) {
        return null;
    }

    if (drag.type === 'pending-move') {
        if (input.type === 'pointermove') {
            if (!hasCrossedThreshold(drag.startPointer, worldPoint)) {
                return { handled: true };
            }

            let promotedNodeIds = drag.nodeIds ?? [];
            let promotedOrigin = drag.origin ?? null;
            if (drag.meta?.duplicateRequested === true) {
                const duplicatedSelection = duplicateMoveSelection({
                    dispatcher,
                    runtimeState,
                    nodeIds: promotedNodeIds,
                });

                if (duplicatedSelection?.nodeIds?.length) {
                    promotedNodeIds = duplicatedSelection.nodeIds;
                    const refreshedState = dispatcher.getState?.() ?? runtimeState;
                    const refreshedNodes = getToolNodes(refreshedState);
                    promotedOrigin = buildOriginMap(promotedNodeIds, refreshedNodes, refreshedState);

                    dispatcher.dispatch({
                        type: EventTypes.SELECTION_SET,
                        payload: {
                            ids: promotedNodeIds,
                            primary: duplicatedSelection.primary ?? promotedNodeIds[0] ?? null,
                        },
                    });
                }
            }

            dispatcher.dispatch({
                type: EventTypes.DRAG_START,
                payload: {
                    type: 'move',
                    nodeIds: promotedNodeIds,
                    pointer: drag.startPointer,
                    origin: promotedOrigin,
                    meta: drag.meta ?? { snapTargets: [] },
                    group: drag.group ?? null,
                },
            });

            const promotedDrag = {
                ...drag,
                type: 'move',
                currentPointer: worldPoint,
            };
            const delta = computeDragDelta(promotedDrag, {
                runtime: runtimeState,
            });

            dispatcher.dispatch({
                type: EventTypes.DRAG_UPDATE,
                payload: {
                    pointer: worldPoint,
                    guides: delta.guides ?? [],
                    interactionTransforms: delta.interactionTransforms ?? null,
                },
            });

            dispatchLayoutBulk(
                dispatcher,
                buildMoveUpdates(promotedNodeIds, promotedOrigin, delta),
            );

            return { handled: true };
        }

        if (input.type === 'pointerup' || input.type === 'pointercancel') {
            dispatcher.dispatch({ type: EventTypes.DRAG_END });
            return { handled: true };
        }

        return null;
    }

    if (drag.type !== 'move') {
        return null;
    }

    if (input.type === 'pointermove') {
        const nextDrag = {
            ...drag,
            currentPointer: worldPoint,
        };
        const delta = computeDragDelta(nextDrag, {
            runtime: runtimeState,
        });

        dispatcher.dispatch({
            type: EventTypes.DRAG_UPDATE,
            payload: {
                pointer: worldPoint,
                guides: delta.guides ?? [],
                interactionTransforms: delta.interactionTransforms ?? null,
            },
        });

        dispatchLayoutBulk(
            dispatcher,
            buildMoveUpdates(drag.nodeIds ?? [], drag.origin ?? null, delta),
        );

        return { handled: true };
    }

    if (input.type === 'pointerup' || input.type === 'pointercancel') {
        dispatcher.dispatch({ type: EventTypes.DRAG_END });
        return { handled: true };
    }

    return null;
}

function computeResizeBounds(drag, worldPoint) {
    const startPointer = drag?.startPointer ?? null;
    const originBounds = drag?.resize?.originBounds ?? drag?.bounds ?? null;
    const handle = drag?.resize?.handle ?? null;

    const result = computeResizeSessionDelta(
        startPointer,
        worldPoint,
        originBounds,
        handle ?? 'se',
        [],
    );

    return result?.bounds ?? null;
}

function resizeToolHandler(input, context) {
    const runtimeState = context?.state;
    const dispatcher = context?.dispatcher;
    const worldPoint = input?.worldPoint ?? null;
    const drag = runtimeState?.interaction?.drag ?? null;

    if (!runtimeState || !dispatcher?.dispatch || !worldPoint) return null;

    if (input.type === 'pointerdown') {
        const hit = resolvePrimaryHit(runtimeState, worldPoint, input.event, input.targetNodeId);
        const handle = input.resizeHandle ?? input.handle ?? null;

        if (!hit?.id || !handle) return null;

        const rect = getNodeRect(getToolNodes(runtimeState)[hit.id] ?? hit, runtimeState);
        if (!rect) return null;

        dispatcher.dispatch({
            type: EventTypes.DRAG_START,
            payload: {
                type: 'resize',
                nodeIds: [hit.id],
                pointer: worldPoint,
                handle,
                originBounds: rect,
            },
        });

        return { handled: true };
    }

    if (!drag?.active || drag.type !== 'resize') return null;

    const activeNodeId = drag.nodeIds?.[0] ?? null;
    const nextBounds = computeResizeBounds(drag, worldPoint);

    if (input.type === 'pointermove') {
        dispatcher.dispatch({
            type: EventTypes.DRAG_UPDATE,
            payload: {
                pointer: worldPoint,
                guides: [],
            },
        });

        if (activeNodeId && nextBounds) {
            const update = {
                id: activeNodeId,
                x: nextBounds.x,
                y: nextBounds.y,
                width: nextBounds.width,
                height: nextBounds.height,
            };
            dispatchLayoutBulk(dispatcher, [
                update,
            ]);
        }

        return { handled: true };
    }

    if (input.type === 'pointerup' || input.type === 'pointercancel') {
        if (activeNodeId && nextBounds) {
            const update = {
                id: activeNodeId,
                x: nextBounds.x,
                y: nextBounds.y,
                width: nextBounds.width,
                height: nextBounds.height,
            };
            dispatchLayoutBulk(dispatcher, [
                update,
            ]);
        }

        dispatcher.dispatch({ type: EventTypes.DRAG_END });
        return { handled: true };
    }

    return null;
}

function rotateToolHandler(input, context) {
    const runtimeState = context?.state;
    const dispatcher = context?.dispatcher;
    const worldPoint = input?.worldPoint ?? null;
    const drag = runtimeState?.interaction?.drag ?? null;

    if (!runtimeState || !dispatcher?.dispatch || !worldPoint) return null;

    if (input.type === 'pointerdown') {
        const hit = resolvePrimaryHit(runtimeState, worldPoint, input.event, input.targetNodeId);
        if (!hit?.id) return null;

        const rect = getNodeRect(getToolNodes(runtimeState)[hit.id] ?? hit, runtimeState);
        if (!rect) return null;

        dispatcher.dispatch({
            type: EventTypes.DRAG_START,
            payload: {
                type: 'rotate',
                nodeIds: [hit.id],
                pointer: worldPoint,
                center: {
                    x: rect.x + rect.width / 2,
                    y: rect.y + rect.height / 2,
                },
                originAngle: hit.rotation ?? 0,
            },
        });

        return { handled: true };
    }

    if (!drag?.active || drag.type !== 'rotate') return null;

    if (input.type === 'pointermove') {
        const nextDrag = {
            ...drag,
            currentPointer: worldPoint,
        };
        const nextRotation = computeRotationDelta(nextDrag);

        dispatcher.dispatch({
            type: EventTypes.DRAG_UPDATE,
            payload: {
                pointer: worldPoint,
                guides: [],
            },
        });

        if (drag.nodeIds?.[0] && Number.isFinite(nextRotation?.angle)) {
            dispatcher.dispatch({
                type: 'node.layout.rotate',
                payload: {
                    id: drag.nodeIds[0],
                    angle: nextRotation.angle,
                },
            });
        }

        return { handled: true };
    }

    if (input.type === 'pointerup' || input.type === 'pointercancel') {
        dispatcher.dispatch({ type: EventTypes.DRAG_END });
        return { handled: true };
    }

    return null;
}

function selectToolHandler(input, context) {
    const runtimeState = context?.state;
    const dispatcher = context?.dispatcher;
    const drag = runtimeState?.interaction?.drag ?? null;
    const worldPoint = input?.worldPoint ?? null;

    if (!runtimeState || !dispatcher?.dispatch || !worldPoint) return null;

    if (drag?.active) {
        if (drag.type === 'pending-move' || drag.type === 'move') {
            return moveToolHandler(input, context);
        }

        if (drag.type === 'resize') {
            return resizeToolHandler(input, context);
        }

        if (drag.type === 'rotate') {
            return rotateToolHandler(input, context);
        }

        if (drag.type === 'pending-select') {
            if (input.type === 'pointermove') {
                if (!hasCrossedThreshold(drag.startPointer, worldPoint)) {
                    return { handled: true };
                }

                const dragHitNodeId = drag.meta?.hitNodeId ?? null;
                const dragWasHitSelected = drag.meta?.wasHitSelected === true;
                const dragAdditive = drag.meta?.additive === true;
                if (dragHitNodeId && dragWasHitSelected && !dragAdditive) {
                    dispatchMoveDragStart({
                        dispatcher,
                        runtimeState,
                        worldPoint: drag.startPointer,
                        hitNodeId: dragHitNodeId,
                        additive: false,
                        duplicate: drag.meta?.duplicateRequested === true,
                    });

                    return moveToolHandler(
                        {
                            ...input,
                            worldPoint,
                        },
                        context,
                    );
                }

                dispatcher.dispatch({
                    type: EventTypes.DRAG_START,
                    payload: {
                        type: 'marquee',
                        pointer: drag.startPointer,
                        meta: drag.meta ?? null,
                    },
                });

                dispatcher.dispatch({
                    type: EventTypes.DRAG_UPDATE,
                    payload: {
                        pointer: worldPoint,
                    },
                });

                return { handled: true };
            }

            if (input.type === 'pointerup' || input.type === 'pointercancel') {
                const additive = drag.meta?.additive === true;
                const pendingToggleId = drag.meta?.pendingToggleId ?? null;
                const hitNodeId = drag.meta?.hitNodeId ?? null;

                if (additive && pendingToggleId) {
                    dispatcher.dispatch({
                        type: EventTypes.SELECTION_TOGGLE,
                        payload: { id: pendingToggleId },
                    });
                } else if (hitNodeId) {
                    dispatcher.dispatch({
                        type: EventTypes.SELECTION_SET,
                        payload: {
                            ids: [hitNodeId],
                            primary: hitNodeId,
                        },
                    });
                } else {
                    dispatcher.dispatch({
                        type: EventTypes.SELECTION_CLEAR,
                    });
                }

                dispatcher.dispatch({ type: EventTypes.DRAG_END });
                return { handled: true };
            }
        }

        if (drag.type === 'marquee') {
            if (input.type === 'pointermove') {
                dispatcher.dispatch({
                    type: EventTypes.DRAG_UPDATE,
                    payload: {
                        pointer: worldPoint,
                    },
                });
                return { handled: true };
            }

            if (input.type === 'pointerup' || input.type === 'pointercancel') {
                const rect = buildMarqueeRect(drag.startPointer, worldPoint);
                const selection = resolveBoundsSelection(runtimeState, rect, {
                    additive: drag.meta?.additive === true,
                    existingIds:
                        drag.meta?.additive === true
                            ? resolveCurrentSelection(runtimeState)
                            : [],
                });

                dispatcher.dispatch({
                    type: EventTypes.SELECTION_SET,
                    payload: {
                        ids: selection.ids,
                        primary: selection.primary,
                    },
                });

                dispatcher.dispatch({ type: EventTypes.DRAG_END });
                return { handled: true };
            }
        }
    }

    if (input.type !== 'pointerdown') {
        return null;
    }

    const hit = resolvePrimaryHit(runtimeState, worldPoint, input.event, input.targetNodeId);
    const hitNodeId = hit?.id ?? input.targetNodeId ?? null;
    const additive = input.event?.shiftKey === true;
    const duplicate = input.event?.altKey === true || input.modifiers?.alt === true;
    const currentSelection = resolveCurrentSelection(runtimeState);
    const wasHitSelected = hitNodeId ? currentSelection.includes(hitNodeId) : false;

    if (hitNodeId && !additive && wasHitSelected) {
        dispatchMoveDragStart({
            dispatcher,
            runtimeState,
            worldPoint,
            hitNodeId,
            additive,
            duplicate,
        });
        return { handled: true };
    }

    dispatcher.dispatch({
        type: EventTypes.DRAG_START,
        payload: {
            type: 'pending-select',
            pointer: worldPoint,
            meta: {
                additive,
                hitNodeId,
                wasHitSelected,
                pendingToggleId: additive ? hitNodeId : null,
                duplicateRequested: duplicate,
            },
        },
    });

    return { handled: true };
}

function createNodeToolHandler(nodeType) {
    return function createNodeHandler(input, context) {
        if (input?.type !== EventTypes.INPUT_CREATE_COMMIT) return null;

        const dispatcher = context?.dispatcher;
        if (!dispatcher?.dispatch) return null;
        const sessionId = input?.sessionId ?? null;
        const scope = 'create-session-commit';

        assertCreateSessionInvariant(
            typeof sessionId === 'string' && sessionId.length > 0,
            scope,
            'MISSING_SESSION_ID',
            { sessionId },
        );
        assertCreateSessionInvariant(
            input?.sessionState?.active === true,
            scope,
            'SESSION_NOT_ACTIVE_AT_COMMIT',
            { sessionId, sessionState: input?.sessionState ?? null },
        );
        const federationSnapshot = input?.sessionState?.federationSnapshot ?? null;
        assertCreateSessionInvariant(
            federationSnapshot?.envelope?.sessionId === sessionId,
            scope,
            'FEDERATION_SESSION_MISMATCH',
            { sessionId, federationSessionId: federationSnapshot?.envelope?.sessionId ?? null },
        );
        assertCreateSessionInvariant(
            federationSnapshot?.envelope?.phase === 'committed',
            scope,
            'FEDERATION_NOT_COMMITTED',
            { sessionId, federationPhase: federationSnapshot?.envelope?.phase ?? null },
        );

        const result = createNodeCreateEvent({
            type: input.nodeType ?? nodeType,
            bounds: input.bounds,
            parentId: input.parentId ?? null,
        });

        if (!result?.event) return null;
        const runtimeState = context?.runtimeState ?? {};
        const ledger = runtimeState.__createCommitLedger ?? new Set();
        if (!runtimeState.__createCommitLedger) {
            Object.defineProperty(runtimeState, '__createCommitLedger', {
                value: ledger,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }

        assertCreateSessionInvariant(
            !ledger.has(sessionId),
            scope,
            'COMMIT_ALREADY_FINALIZED',
            { sessionId },
        );
        ledger.add(sessionId);

        dispatcher.dispatch(result.event);
        return { handled: true };
    };
}

const CORE_TOOL_HANDLERS = new Map([
    ['select', selectToolHandler],
    ['move', moveToolHandler],
    ['resize', resizeToolHandler],
    ['rotate', rotateToolHandler],
    ['frame', createNodeToolHandler('frame')],
    ['shape', createNodeToolHandler('shape')],
    ['text', createNodeToolHandler('text')],
    ['image', createNodeToolHandler('image')],
]);

function getCoreToolHandler(tool) {
    if (typeof tool !== 'string' || tool.length === 0) return null;
    return CORE_TOOL_HANDLERS.get(tool) ?? null;
}

function registerDefaultGraphToolHandlers() {
    registerToolHandler('select', CORE_TOOL_HANDLERS.get('select'), { family: 'utility' });
    registerToolHandler('move', CORE_TOOL_HANDLERS.get('move'), { family: 'session' });
    registerToolHandler('resize', CORE_TOOL_HANDLERS.get('resize'), { family: 'session' });
    registerToolHandler('rotate', CORE_TOOL_HANDLERS.get('rotate'), { family: 'session' });
    registerToolHandler('frame', CORE_TOOL_HANDLERS.get('frame'), { family: 'createNode' });
    registerToolHandler('shape', CORE_TOOL_HANDLERS.get('shape'), { family: 'createNode' });
    registerToolHandler('text', CORE_TOOL_HANDLERS.get('text'), { family: 'createNode' });
    registerToolHandler('image', CORE_TOOL_HANDLERS.get('image'), { family: 'createNode' });
}

function unregisterDefaultGraphToolHandlers() {
    CORE_TOOL_HANDLERS.forEach((_handler, tool) => {
        unregisterToolHandler(tool);
    });
}

export const __TESTING__ = Object.freeze({
    getNodeRect,
    getToolNodes,
    moveToolHandler,
    resizeToolHandler,
    rotateToolHandler,
    selectToolHandler,
    resolvePrimaryHit,
    resolveNextMoveSelection,
    dispatchMoveDragStart,
    dispatchLayoutBulk,
});

export {
    dispatchMoveDragStart,
    getCoreToolHandler,
    registerDefaultGraphToolHandlers,
    resolveNextMoveSelection,
    unregisterDefaultGraphToolHandlers,
};
