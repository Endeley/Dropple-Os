import test from 'node:test';
import assert from 'node:assert/strict';

import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { registerToolIntentBridge } from '@/ui/bridges/toolIntentBridge.js';
import { EventTypes } from '@/core/events/eventTypes.js';

test('tool intent bridge rebinds to the latest registered dispatcher', () => {
    const dispatched = [];
    const staleDispatched = [];

    const cleanupStale = registerToolIntentBridge({
        dispatch(event) {
            staleDispatched.push(event);
        },
    });
    const cleanupActive = registerToolIntentBridge({
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit('intent.tool.setActive', { toolId: 'select' });
    } finally {
        cleanupActive?.();
        cleanupStale?.();
    }

    assert.equal(staleDispatched.length, 0);
    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.TOOL_SET_ACTIVE);
    assert.equal(dispatched[0]?.payload, 'select');
});
