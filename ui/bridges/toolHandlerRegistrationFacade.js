import { createNodeCreateEvent } from '@/runtime/input/nodeCreateRuntimeBridge.js';
import { registerToolHandler, unregisterToolHandler } from '@/runtime/tools/toolController.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { applyAxisLock, computeRawDragDelta } from '@/runtime/interaction/dragEngine.js';
import { computeGroupBounds } from '@/runtime/interaction/groupBoundsEngine.js';
import { buildGroupSnapContext } from '@/runtime/interaction/groupSnapContext.js';
import { hitTestPoint } from '@/runtime/hitTest/hitTestPoint.js';
import { collectSnapTargets, resolveSnap } from '@/runtime/interaction/snapResolver.js';
import { applyMagneticSnap, computeVelocity } from '@/runtime/interaction/magneticSnap.js';
import { computeResizeDelta } from '@/runtime/interaction/resizeEngine.js';
import { computeRotationDelta as computeRuntimeRotationDelta } from '@/runtime/interaction/rotationEngine.js';
import { snapAngle } from '@/runtime/interaction/snapAngle.js';
import { applyMagneticRotation } from '@/runtime/interaction/magneticRotation.js';
import { clearSelection } from '@/runtime/selection/clearSelection.js';
import { selectNode } from '@/runtime/selection/selectNode.js';
import { toggleNode } from '@/runtime/selection/toggleNode.js';
import { resolveTargetNodeId } from '@/ui/interactions/resolveTargetNodeId.js';
import { getNodes } from '@/runtime/document/documentAdapter.js';

const MOVE_DRAG_THRESHOLD = 3;

/* =========================
   HELPERS
========================= */

function getToolNodes(runtimeState) {
    const nodes = getNodes(runtimeState);
    return Object.keys(nodes).length > 0 ? nodes : (runtimeState?.viewNodes ?? {});
}

function getNodeRect(node, runtimeState) {
    const computed = runtimeState?.scene?.computed ?? {};
    const entry = computed[node?.id];

    if (entry?.worldBounds) {
        const b = entry.worldBounds;

        if (
            Number.isFinite(b.x) &&
            Number.isFinite(b.y) &&
            Number.isFinite(b.width) &&
            Number.isFinite(b.height)
        ) {
            return {
                x: b.x,
                y: b.y,
                width: Math.max(0, b.width),
                height: Math.max(0, b.height),
            };
        }
    }

    if (entry) {
        const x = Number(entry.x ?? 0);
        const y = Number(entry.y ?? 0);
        const width = Number(entry.width ?? 0);
        const height = Number(entry.height ?? 0);

        if (
            Number.isFinite(x) &&
            Number.isFinite(y) &&
            Number.isFinite(width) &&
            Number.isFinite(height)
        ) {
            return {
                x,
                y,
                width: Math.max(0, width),
                height: Math.max(0, height),
            };
        }
    }

    const props = node?.props || {};
    const layout = node?.layout || {};

    return {
        x: layout.x ?? node?.x ?? props.x ?? 0,
        y: layout.y ?? node?.y ?? props.y ?? 0,
        width: layout.width ?? node?.width ?? props.width ?? 0,
        height: layout.height ?? node?.height ?? props.height ?? 0,
    };
}

function resolvePrimaryHit(runtimeState, worldPoint, inputEvent, targetNodeId) {
    const nodesById = getToolNodes(runtimeState);

    if (targetNodeId) return nodesById[targetNodeId] ?? { id: targetNodeId };

    const domHit = resolveTargetNodeId(inputEvent?.target ?? null);
    if (domHit) return nodesById[domHit] ?? { id: domHit };

    const hit = hitTestPoint({
        runtime: runtimeState,
        x: worldPoint.x,
        y: worldPoint.y,
    });

    if (typeof hit === 'string') return nodesById[hit] ?? { id: hit };
    if (hit?.id) return hit;

    return null;
}

/* =========================
   MOVE TOOL HANDLER
========================= */

function moveToolHandler(input, context) {
    const runtimeState = context.state;
    const dispatcher = context.dispatcher;
    const worldPoint = input.worldPoint;

    if (!runtimeState || !dispatcher || !worldPoint) return null;

    const drag = runtimeState?.interaction?.drag ?? null;
    const nodesById = getToolNodes(runtimeState);

    /* ---------- POINTER DOWN ---------- */

    if (input.type === 'pointerdown') {
        const hit = resolvePrimaryHit(runtimeState, worldPoint, input.event, input.targetNodeId);

        if (!hit?.id) {
            dispatcher.dispatch(clearSelection());
            return { handled: true };
        }

        dispatcher.dispatch(selectNode(hit.id));

        dispatcher.dispatch({
            type: EventTypes.DRAG_START,
            payload: {
                type: 'pending-move',
                nodeIds: [hit.id],
                pointer: worldPoint,
                origin: {
                    [hit.id]: {
                        x: getNodeRect(nodesById[hit.id], runtimeState).x,
                        y: getNodeRect(nodesById[hit.id], runtimeState).y,
                    },
                },
                meta: {
                    snapTargets: collectSnapTargets(runtimeState, {
                        nodeIds: [hit.id],
                    }),
                },
            },
        });

        return { handled: true };
    }

    /* ---------- POINTER MOVE ---------- */

    if (input.type === 'pointermove') {
        let activeDrag = drag;

        // Promote pending → move
        if (drag?.active && drag.type === 'pending-move') {
            const delta = computeRawDragDelta({
                ...drag,
                currentPointer: worldPoint,
            });

            const dist = Math.max(Math.abs(delta.dx), Math.abs(delta.dy));
            if (dist < MOVE_DRAG_THRESHOLD) return { handled: true };

            dispatcher.dispatch({
                type: EventTypes.DRAG_START,
                payload: {
                    ...drag,
                    type: 'move',
                },
            });

            activeDrag = { ...drag, type: 'move' };
        }

        if (activeDrag?.active && activeDrag.type === 'move') {
            const nextDrag = {
                ...activeDrag,
                currentPointer: worldPoint,
            };

            const rawDelta = applyAxisLock(computeRawDragDelta(nextDrag), { axisLock: input.event?.shiftKey === true });

            const resolved = resolveSnap(rawDelta, {
                targets: activeDrag.meta?.snapTargets ?? collectSnapTargets(runtimeState, activeDrag),
            });

            const velocity = computeVelocity(activeDrag.previousPointer ?? activeDrag.currentPointer, worldPoint);

            const magnetic = applyMagneticSnap(rawDelta, resolved, {
                velocity,
            });

            const interactionTransforms = Object.fromEntries(
                activeDrag.nodeIds.map((id) => {
                    const origin = activeDrag.origin[id];
                    return [
                        id,
                        {
                            x: origin.x + magnetic.dx,
                            y: origin.y + magnetic.dy,
                        },
                    ];
                }),
            );

            dispatcher.dispatch({
                type: EventTypes.DRAG_UPDATE,
                payload: {
                    pointer: worldPoint,
                    guides: resolved.guides ?? [],
                    interactionTransforms,
                },
            });

            return { handled: true };
        }
    }

    /* ---------- POINTER UP (COMMIT FIX) ---------- */

    if (input.type === 'pointerup' || input.type === 'pointercancel') {
        if (drag?.active && drag.type === 'move') {
            const updates = drag.nodeIds
                .map((id) => {
                    const t = drag.interactionTransforms?.[id];
                    if (!t) return null;
                    return { id, x: t.x, y: t.y };
                })
                .filter(Boolean);

            if (updates.length > 0) {
                dispatcher.dispatch({
                    type: 'node.layout.bulk',
                    payload: { updates },
                });
            }

            dispatcher.dispatch({ type: EventTypes.DRAG_END });
            return { handled: true };
        }

        if (drag?.active) {
            dispatcher.dispatch({ type: EventTypes.DRAG_END });
            return { handled: true };
        }
    }

    return null;
}

/* =========================
   TOOL REGISTRATION
========================= */

export function registerDefaultGraphToolHandlers() {
    registerToolHandler('move', moveToolHandler);
}

export function unregisterDefaultGraphToolHandlers() {
    unregisterToolHandler('move');
}
