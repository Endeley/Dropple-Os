import test from 'node:test';
import assert from 'node:assert/strict';

import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { registerNodeCreateBridge } from '@/ui/bridges/nodeCreateBridge.js';
import { registerSelectionIntentBridge } from '@/ui/bridges/selectionIntentBridge.js';
import { EventTypes } from '@/core/events/eventTypes.js';

test('node create bridge rebinds to the latest registered dispatcher', () => {
    const staleDispatched = [];
    const dispatched = [];

    const cleanupStale = registerNodeCreateBridge((event) => {
        staleDispatched.push(event);
    });
    const cleanupActive = registerNodeCreateBridge((event) => {
        dispatched.push(event);
    });

    try {
        canvasBus.emit('intent.node.create', {
            type: 'frame',
            bounds: { x: 10, y: 20, width: 120, height: 80 },
        });
    } finally {
        cleanupActive?.();
        cleanupStale?.();
    }

    assert.equal(staleDispatched.length, 0);
    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.NODE_CREATE);
    assert.equal(dispatched[0]?.payload?.node?.type, 'frame');
});

test('selection intent bridge rebinds to the latest registered dispatcher', () => {
    const staleDispatched = [];
    const dispatched = [];

    const cleanupStale = registerSelectionIntentBridge({
        dispatch(event) {
            staleDispatched.push(event);
        },
    });
    const cleanupActive = registerSelectionIntentBridge({
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit('intent.selection.select', { nodeId: 'node-1' });
    } finally {
        cleanupActive?.();
        cleanupStale?.();
    }

    assert.equal(staleDispatched.length, 0);
    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.SELECTION_SET);
    assert.deepEqual(dispatched[0]?.payload?.ids, ['node-1']);
    assert.equal(dispatched[0]?.payload?.primary, 'node-1');
});
