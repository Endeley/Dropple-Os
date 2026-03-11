import { EventTypes } from '../../core/events/eventTypes.js';
import { createNode } from '../../core/nodes/createNode.js';
import { normalizeNodeShape } from '../../design/state/normalizeNodeShape.js';
import { canProjectToCanonicalNode } from '../../validation/canProjectToCanonicalNode.js';
import { generateNodeId } from '@/runtime/nodes/generateNodeId.js';

function finiteOr(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
}

/**
 * Creates a node creation event from an intent.
 */
export function createNodeCreateEvent(intent) {
    if (!intent) return null;

    const {
        id,
        type = 'frame',
        bounds,
        position,
        parentId = null,
        props = {},
        style = {},
        content = null,
    } = intent;

    const sourceLayout = bounds || {
        x: position?.x,
        y: position?.y,
        width: 160,
        height: 100,
    };
    const layout = {
        x: finiteOr(sourceLayout?.x, 0),
        y: finiteOr(sourceLayout?.y, 0),
        width: finiteOr(sourceLayout?.width, 160),
        height: finiteOr(sourceLayout?.height, 100),
    };

    const node = createNode(
        normalizeNodeShape({
            id: id || generateNodeId(),
            type,
            parentId,
            props,
            style,
            content,
            layout,
        }),
    );

    return {
        event: {
            type: EventTypes.NODE_CREATE,
            payload: { node },
        },
        projectionOk: canProjectToCanonicalNode(node),
    };
}
