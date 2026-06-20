import test from 'node:test';
import assert from 'node:assert/strict';

import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { registerNodeUpdateBridge } from '@/ui/bridges/nodeUpdateBridge.js';
import { EventTypes } from '@/core/events/eventTypes.js';

test('node update bridge normalizes dotted delete events into canonical runtime delete', () => {
    const dispatched = [];
    const cleanup = registerNodeUpdateBridge((event) => {
        dispatched.push(event);
    });

    try {
        canvasBus.emit('intent.node.update', {
            event: {
                type: 'node.delete',
                payload: { id: 'node-1' },
            },
        });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.NODE_DELETE);
    assert.deepEqual(dispatched[0]?.payload, { id: 'node-1' });
});
