import test from 'node:test';
import assert from 'node:assert/strict';

import { replayEvents } from '@/core/persistence/replayEngine.js';
import { EventTypes } from '@/core/events/eventTypes.js';

const events = [
    {
        id: 'main:1',
        type: EventTypes.NODE_CREATE,
        payload: {
            node: {
                id: 'root',
                type: 'frame',
                props: {
                    transform: { x: 10, y: 20, scaleX: 1, scaleY: 1, rotation: 0 },
                },
            },
        },
    },
    {
        id: 'main:2',
        type: EventTypes.SELECTION_SET,
        payload: { ids: ['root'] },
    },
];

test('replay is deterministic for the same event stream', () => {
    const first = replayEvents({ events });
    const second = replayEvents({ events });

    assert.deepEqual(second, first);
});

test('replay preserves canonical scene graph and selection outputs', () => {
    const state = replayEvents({ events });

    assert.ok(state.nodes.root);
    assert.deepEqual(state.rootIds, ['root']);
    assert.deepEqual(Array.from(state.selection.ids), ['root']);
    assert.equal(state.selection.primary, null);
});
