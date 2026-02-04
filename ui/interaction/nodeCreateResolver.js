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
        console.log('[nodeCreateResolver] dispatch start:', event?.type);
        dispatcher.dispatch(event);
        console.log('[nodeCreateResolver] dispatch success:', event?.type);
    } catch (err) {
        console.error('[nodeCreateResolver] dispatch error:', event?.type, err);
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
        console.log('[nodeCreateResolver] intent received:', intent);
        console.trace('[nodeCreateResolver] intent.node.create origin stack');
        if (!intent) {
            console.warn('[nodeCreateResolver] early return: missing intent');
            return;
        }

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
        console.log('[nodeCreateResolver] handler complete: NODE_CREATE dispatched path finished');
    };

    _unsub = canvasBus.on('intent.node.create', handler);
    return _unsub;
}
