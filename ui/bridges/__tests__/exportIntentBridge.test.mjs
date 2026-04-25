import test from 'node:test';
import assert from 'node:assert/strict';

import { registerExportIntentBridge } from '@/ui/bridges/exportIntentBridge.js';
import { exportIntentTargetDelete, exportIntentTargetUpsert } from '@/ui/export/exportIntent.js';
import { EventTypes } from '@/core/events/eventTypes.js';

function createDispatcher(target) {
    return {
        dispatch(event) {
            target.push(event);
        },
    };
}

test('export intent bridge dispatches canonical export target upsert and delete events', () => {
    const staleDispatched = [];
    const dispatched = [];

    const cleanupStale = registerExportIntentBridge(createDispatcher(staleDispatched));
    const cleanupActive = registerExportIntentBridge(createDispatcher(dispatched));

    try {
        exportIntentTargetUpsert({
            target: {
                id: 'mp4:master',
                type: 'mp4',
                delivery: 'master',
            },
        });
        exportIntentTargetDelete({ targetId: 'mp4:master' });
    } finally {
        cleanupActive?.();
        cleanupStale?.();
    }

    assert.equal(staleDispatched.length, 0);
    assert.equal(dispatched.length, 2);
    assert.equal(dispatched[0]?.type, EventTypes.EXPORT_TARGET_UPSERT);
    assert.equal(dispatched[0]?.payload?.target?.id, 'mp4:master');
    assert.equal(dispatched[1]?.type, EventTypes.EXPORT_TARGET_DELETE);
    assert.equal(dispatched[1]?.payload?.targetId, 'mp4:master');
});
