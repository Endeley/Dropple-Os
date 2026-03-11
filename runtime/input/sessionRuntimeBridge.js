import { MoveSession } from '../interactions/input/sessions/MoveSession.js';
import { ResizeSession } from '../interactions/input/sessions/ResizeSession.js';
import { RotateSession } from '../interactions/input/sessions/RotateSession.js';
import { isAutoLayoutChild } from '@/engine/layout/isAutoLayoutChild.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';

export function createSessionFromIntent({ sessionType, payload, nodesById = {} }) {
    if (!payload) return null;
    const projection = useRuntimeStore.getState();

    if (sessionType === 'move') {
        const nodeIds = Array.isArray(payload.nodeIds) ? payload.nodeIds : [];

        return new MoveSession({
            nodeIds,
            startPointer: payload.startPointer ?? payload.pointer ?? payload.pointerWorld,
            transforms: payload.transforms ?? null,
        });
    }

    if (sessionType === 'resize') {
        const nodeIds = Array.isArray(payload.nodeIds) ? payload.nodeIds : [];
        const nodes = nodeIds.map((id) => nodesById[id]).filter(Boolean);
        const blocked = nodes.some((node) => isAutoLayoutChild(node, nodesById));
        if (blocked) return null;

        return new ResizeSession({
            nodeIds,
            nodes,
            startPointer: payload.startPointer ?? payload.pointer ?? payload.pointerWorld,
            handle: payload.handle,
            bounds: payload.bounds ?? projection?.selectionBounds?.bounds ?? null,
        });
    }

    if (sessionType === 'rotate') {
        const nodeIds = Array.isArray(payload.nodeIds)
            ? payload.nodeIds
            : [payload.nodeId].filter(Boolean);

        return new RotateSession({
            nodeIds,
            nodes: nodeIds.map((id) => nodesById[id]).filter(Boolean),
            startPointerWorld: payload.startPointerWorld ?? payload.pointerWorld ?? payload.pointer,
            centerWorld: payload.centerWorld,
            pivot: payload.pivot ?? projection?.transformAnchors?.pivot ?? null,
        });
    }

    return null;
}
