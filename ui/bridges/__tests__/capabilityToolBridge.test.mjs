import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { registerCapabilityToolBridge } from '@/ui/bridges/capabilityToolBridge.js';

test('capability tool bridge rebinds to the latest registered dispatcher', () => {
    const dispatched = [];
    const staleDispatched = [];

    const cleanupStale = registerCapabilityToolBridge({
        dispatch(event) {
            staleDispatched.push(event);
        },
    });
    const cleanupActive = registerCapabilityToolBridge({
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit('capability.tools.register.requested', {
            type: 'capability.tools.register.requested',
            payload: { source: 'graph', tools: ['select'] },
        });
        canvasBus.emit('capability.tools.unregister.requested', {
            type: 'capability.tools.unregister.requested',
            payload: { source: 'graph' },
        });
    } finally {
        cleanupActive?.();
        cleanupStale?.();
    }

    assert.deepEqual(staleDispatched, []);
    assert.equal(dispatched.length, 2);
    assert.equal(dispatched[0]?.type, EventTypes.TOOLS_REGISTER);
    assert.equal(dispatched[1]?.type, EventTypes.TOOLS_UNREGISTER);
});
