import { nanoid } from 'nanoid';
import { canvasBus } from '@/infrastructure/eventBus/canvasBus.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { createNode } from '@/core/nodes/createNode';
import { normalizeNodeShape } from '@/design/state/normalizeNodeShape.js';
import { canProjectToCanonicalNode } from '@/validation/canProjectToCanonicalNode.js';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';

let _unsub = null;
let warnedMissingDispatcher = false;

function finiteOr(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
}

function safeDispatch(event) {
    try {
        const dispatcher = getRuntimeDispatcher();
        dispatcher.dispatch(event);
    } catch (err) {
        if (!warnedMissingDispatcher) {
            console.warn('[nodeCreateRuntimeBridge] Dispatcher not available; skipping node create.', err);
            warnedMissingDispatcher = true;
        }
    }
}

/**
 * Registers the node creation resolver once.
 * Canvas intent → domain event
 */
export function registerNodeCreateRuntimeBridge() {
    if (_unsub) return _unsub;

    const handler = (intent) => {
        if (!intent) return;

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
                id: id || `node-${nanoid()}`,
                type,
                parentId,
                props,
                style,
                content,
                layout,
            }),
        );

        if (process.env.NODE_ENV === 'development') {
            if (!canProjectToCanonicalNode(node)) {
                console.warn(
                    '[Skeleton v2] Node cannot project to canonical Node contract',
                    node
                );
            }
        }

        safeDispatch({
            type: EventTypes.NODE_CREATE,
            payload: { node },
        });
    };

    _unsub = canvasBus.on('intent.node.create', handler);
    return _unsub;
}
