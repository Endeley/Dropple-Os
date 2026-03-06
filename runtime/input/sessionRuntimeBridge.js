import { MoveSession } from '../interactions/input/sessions/MoveSession.js';
import { ResizeSession } from '../interactions/input/sessions/ResizeSession.js';
import { RotateSession } from '../interactions/input/sessions/RotateSession.js';
import { isAutoLayoutChild } from '@/engine/layout/isAutoLayoutChild.js';

export function createSessionFromIntent({ sessionType, payload, nodesById = {} }) {
    if (!payload) return null;

    if (sessionType === 'move') {
        const nodeIds = Array.isArray(payload.nodeIds) ? payload.nodeIds : [];
        const nodes = nodeIds.map((id) => nodesById[id]).filter(Boolean);
        const parentId = nodes.length
            ? nodes.every((node) => node?.parentId === nodes[0]?.parentId)
                ? nodes[0]?.parentId
                : null
            : null;
        const parent = parentId ? nodesById[parentId] : null;
        const autoLayout = parent?.layout?.autoLayout || null;
        const parentChildren = Array.isArray(parent?.children) ? parent.children : [];
        const children = autoLayout
            ? parentChildren.map((id) => nodesById[id]).filter(Boolean)
            : [];

        return new MoveSession({
            nodeIds,
            nodes,
            siblings: Object.values(nodesById).filter(Boolean),
            canvas: payload.canvas,
            startPointer: payload.startPointer,
            options: payload.options,
            context: {
                autoLayout,
                container: parent,
                children,
                parentChildren,
                sourceParentId: parentId,
                isAutoLayoutChild: Boolean(autoLayout && parentId),
            },
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
            siblings: Object.values(nodesById).filter(Boolean),
            canvas: payload.canvas,
            startPointer: payload.startPointer,
            handle: payload.handle,
            options: payload.options,
        });
    }

    if (sessionType === 'rotate') {
        return new RotateSession({
            nodeIds: payload.nodeIds,
            nodes: payload.nodeIds.map((id) => nodesById[id]).filter(Boolean),
            startPointerWorld: payload.startPointerWorld,
            centerWorld: payload.centerWorld,
        });
    }

    return null;
}
