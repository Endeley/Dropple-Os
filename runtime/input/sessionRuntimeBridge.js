/**
 * NON-CANONICAL INTERACTION SYSTEM
 *
 * This module creates session objects for preview/session-driven flows. Canvas
 * authoring execution is owned by:
 * WorkspaceCanvasRoot -> CanvasRoot -> useCanvasInteractions -> inputEngine -> toolHandlerRegistrationFacade
 *
 * Do not use this bridge to introduce a parallel canvas execution path.
 */

import { createInteractionManager } from '@/runtime/interactions/index.js';
import { isAutoLayoutChild } from '@/runtime/layout/index.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { getRuntimeState } from '@/runtime/state/runtimeState.js';
import { computeSnapTargets } from '@/runtime/snapping/computeSnapTargets.js';

function resolveParentBounds(sceneComputed, nodes) {
    const parentId = nodes.length === 1 ? nodes[0]?.parentId ?? null : null;
    if (!parentId) return null;

    return sceneComputed?.[parentId]?.worldBounds ?? null;
}

export function createSessionFromIntent({ sessionType, payload, nodesById = {} }) {
    if (!payload) return null;
    const projection = useRuntimeStore.getState();
    const runtimeState = getRuntimeState();
    const sceneComputed = runtimeState?.scene?.computed ?? {};
    const interactionManager = createInteractionManager({
        runtime: runtimeState,
    });

    if (sessionType === 'move') {
        const nodeIds = Array.isArray(payload.nodeIds) ? payload.nodeIds : [];
        const nodes = nodeIds.map((id) => nodesById[id]).filter(Boolean);
        const snapTargets = computeSnapTargets(sceneComputed, nodeIds);

        return interactionManager.createSession('move', {
            nodeIds,
            nodes,
            startPointer: payload.startPointer ?? payload.pointer ?? payload.pointerWorld,
            transforms: payload.transforms ?? null,
            bounds: payload.bounds ?? projection?.selectionBounds?.bounds ?? null,
            snapTargets,
            snapToGrid: payload.snapToGrid ?? false,
            parentBounds: resolveParentBounds(sceneComputed, nodes),
        });
    }

    if (sessionType === 'resize') {
        const nodeIds = Array.isArray(payload.nodeIds) ? payload.nodeIds : [];
        const nodes = nodeIds.map((id) => nodesById[id]).filter(Boolean);
        const blocked = nodes.some((node) => isAutoLayoutChild(node, nodesById));
        if (blocked) return null;

        return interactionManager.createSession('resize', {
            nodeIds,
            nodes,
            startPointer: payload.startPointer ?? payload.pointer ?? payload.pointerWorld,
            handle: payload.handle,
            bounds: payload.bounds ?? projection?.selectionBounds?.bounds ?? null,
            snapTargets: computeSnapTargets(sceneComputed, nodeIds),
            parentBounds: resolveParentBounds(sceneComputed, nodes),
        });
    }

    if (sessionType === 'rotate') {
        const nodeIds = Array.isArray(payload.nodeIds)
            ? payload.nodeIds
            : [payload.nodeId].filter(Boolean);

        return interactionManager.createSession('rotate', {
            nodeIds,
            nodes: nodeIds.map((id) => nodesById[id]).filter(Boolean),
            startPointerWorld: payload.startPointerWorld ?? payload.pointerWorld ?? payload.pointer,
            centerWorld: payload.centerWorld,
            pivot: payload.pivot ?? projection?.transformAnchors?.pivot ?? null,
        });
    }

    if (sessionType === 'pan') {
        return interactionManager.createSession('pan', {
            startPointer: payload.startPointer ?? payload.pointer ?? payload.pointerWorld,
            viewport: runtimeState?.workspace?.viewport ?? null,
        });
    }

    if (sessionType === 'zoom') {
        return interactionManager.createSession('zoom', {
            startPointer: payload.startPointer ?? payload.pointer ?? payload.pointerWorld,
            viewport: runtimeState?.workspace?.viewport ?? null,
        });
    }

    return null;
}
