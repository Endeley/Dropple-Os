// ui/interaction/nodeCreateResolver.js
import { nanoid } from 'nanoid';
import { canvasBus } from '@/ui/canvasBus.js';
import { dispatcher } from './dispatcher.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { createNode } from '@/design/state/createNode.js';

let _unsub = null;
let warnedMissingDispatcher = false;

function safeDispatch(event) {
    try {
        dispatcher.dispatch(event);
    } catch (err) {
        if (!warnedMissingDispatcher) {
            console.warn('[nodeCreateResolver] Dispatcher not attached; skipping node create.', err);
            warnedMissingDispatcher = true;
        }
    }
}

/**
 * Registers the node creation resolver once.
 * Canvas intent → domain event
 */
export function registerNodeCreateResolver() {
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

        const layout = bounds
            ? bounds
            : {
                  x: position?.x ?? 0,
                  y: position?.y ?? 0,
                  width: 160,
                  height: 100,
              };

        const node = createNode({
            id: id || `node-${nanoid()}`,
            type,
            parentId,
            props,
            style,
            content,
            layout,
        });

        safeDispatch({
            type: EventTypes.NODE_CREATE,
            payload: { node },
        });
    };

    _unsub = canvasBus.on('intent.node.create', handler);
    return _unsub;
}
