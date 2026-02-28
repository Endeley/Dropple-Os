import { MoveSession } from '../interactions/input/sessions/MoveSession.js';
import { ResizeSession } from '../interactions/input/sessions/ResizeSession.js';

export function createSessionFromIntent({ sessionType, payload, nodesById = {} }) {
    if (!payload) return null;

    if (sessionType === 'move') {
        return new MoveSession({
            nodeIds: payload.nodeIds,
            nodes: payload.nodeIds.map((id) => nodesById[id]).filter(Boolean),
            siblings: Object.values(nodesById).filter(Boolean),
            canvas: payload.canvas,
            startPointer: payload.startPointer,
            options: payload.options,
        });
    }

    if (sessionType === 'resize') {
        return new ResizeSession({
            nodeIds: payload.nodeIds,
            nodes: payload.nodeIds.map((id) => nodesById[id]).filter(Boolean),
            siblings: Object.values(nodesById).filter(Boolean),
            canvas: payload.canvas,
            startPointer: payload.startPointer,
            handle: payload.handle,
            options: payload.options,
        });
    }

    return null;
}
