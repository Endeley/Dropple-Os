import { createNodeCreateEvent } from '@/runtime/input/nodeCreateRuntimeBridge.js';
import {
    registerToolHandler,
    unregisterToolHandler,
} from '@/runtime/tools/toolController.js';
import { hitTestPoint } from '@/runtime/hitTest/hitTestPoint.js';
import { clearSelection } from '@/runtime/selection/clearSelection.js';
import { selectNode } from '@/runtime/selection/selectNode.js';
import { toggleNode } from '@/runtime/selection/toggleNode.js';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import {
    beginSession,
    endSession,
    getActiveSessionType,
    resolveToolHandler,
    updatePointer,
} from '@/ui/bridges/inputSessionRuntimeFacade.js';
import { TOOL_DEFINITION_BY_ID } from '@/ui/tools/toolDefinitions.js';
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
    return 'handled';
}

function moveToolHandler(input, context) {
    const runtimeState = context.state;
    const dispatcher = context.dispatcher;
    const worldPoint = input.worldPoint;
    if (!runtimeState || !dispatcher || !worldPoint) return null;

    if (input.type === 'pointerdown') {
        let hit = resolvePrimaryHit(runtimeState, worldPoint);
        if (!hit?.id) {
            dispatcher.dispatch(clearSelection());
            return 'handled';
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

        const toolDef = TOOL_DEFINITION_BY_ID.move || { id: 'move' };
        const handler = resolveToolHandler(toolDef);
        if (typeof handler !== 'function') {
            return null;
        }

        const intent = handler(toolDef, {
            sessionType: 'move',
            sessionPayload: {
                nodeIds,
                startPointer: worldPoint,
            },
            nodeIds,
            hitNodeId: hit.id,
            selectionIds,
            pointerWorld: worldPoint,
            additive: input.event?.shiftKey ?? false,
        });

        if (intent?.type === 'session/start') {
            beginSession({
                type: intent.payload?.sessionType,
                payload: intent.payload?.sessionPayload || {},
            });
            return 'handled';
        }

        return null;
    }

    if (input.type === 'pointermove') {
        const active = getActiveSessionType();
        if (active === 'move') {
            updatePointer({ pointer: worldPoint });
            return 'handled';
        }
        return null;
    }

    if (input.type === 'pointerup') {
        const active = getActiveSessionType();
        if (active === 'move') {
            const event = endSession({ reason: 'pointerUp' });
            if (event) canvasBus.emit('session.commit', event);
            return 'handled';
        }
        return null;
    }

    return null;
}

function shapeToolHandler(input, context) {
    if (input.type !== 'createcommit') return null;

    const eventEnvelope = createNodeCreateEvent({
        type: input.nodeType || 'shape',
        bounds: input.bounds,
        parentId: input.parentId ?? null,
    });

    if (!eventEnvelope?.event) return null;

    context.dispatcher?.dispatch?.(eventEnvelope.event);
    return 'handled';
}

export function registerDefaultGraphToolHandlers() {
    registerToolHandler('select', selectToolHandler);
    registerToolHandler('move', moveToolHandler);
    registerToolHandler('shape', shapeToolHandler);
}

export function unregisterDefaultGraphToolHandlers() {
    unregisterToolHandler('select');
    unregisterToolHandler('move');
    unregisterToolHandler('shape');
}
