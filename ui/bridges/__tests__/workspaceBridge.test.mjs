import test from 'node:test';
import assert from 'node:assert/strict';

import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { INTENTS } from '@/core/intents/intentTypes.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { registerWorkspaceBridge } from '@/ui/bridges/workspaceBridge.js';

test('workspace bridge translates canonical activation intent into dispatcher event', () => {
    const dispatched = [];
    const cleanup = registerWorkspaceBridge({
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit(INTENTS.WORKSPACE_ACTIVATE, {
            workspaceId: 'graphic',
        });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.WORKSPACE_SET_ACTIVE);
    assert.equal(dispatched[0]?.payload?.workspaceId, 'design');
    assert.equal(dispatched[0]?.payload?.workspaceDef?.id, 'design');
});
