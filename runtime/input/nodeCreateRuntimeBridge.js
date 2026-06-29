import { EventTypes } from '../../core/events/eventTypes.js';
import { createNode } from '../../core/nodes/createNode.js';
import { normalizeNodeShape } from '../../design/state/normalizeNodeShape.js';
import { canProjectToCanonicalNode } from '../../validation/canProjectToCanonicalNode.js';
import { generateNodeId } from '@/runtime/nodes/generateNodeId.js';
import { assertCreateSessionInvariant } from '@/runtime/input/createSessionInvariant.js';

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
        name = null,
        props = {},
        style = {},
        content = null,
        metadata = undefined,
        meta = undefined,
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

    assertCreateSessionInvariant(
        Number.isFinite(layout.x) &&
            Number.isFinite(layout.y) &&
            Number.isFinite(layout.width) &&
            Number.isFinite(layout.height),
        'create-session',
        'INVALID_LAYOUT_VALUES',
        { layout },
    );
    assertCreateSessionInvariant(
        layout.width > 0 && layout.height > 0,
        'create-session',
        'NON_POSITIVE_LAYOUT',
        { layout },
    );

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

    if (typeof name === 'string' && name.trim().length > 0) {
        node.name = name.trim();
    }

    const normalizedMetadata =
        metadata && typeof metadata === 'object' && !Array.isArray(metadata)
            ? { ...metadata }
            : meta && typeof meta === 'object' && !Array.isArray(meta)
              ? { ...meta }
              : null;

    if (normalizedMetadata) {
        node.metadata = normalizedMetadata;
        node.meta = { ...normalizedMetadata };
    }

    return {
        event: {
            type: EventTypes.NODE_CREATE,
            payload: { node },
        },
        projectionOk: canProjectToCanonicalNode(node),
    };
}
