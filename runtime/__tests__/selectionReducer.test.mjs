import test from 'node:test';
import assert from 'node:assert/strict';

import { selectionReducer } from '@/core/events/reducers/selectionReducers.js';
import { EventTypes } from '@/core/events/eventTypes.js';

function createSelectionState(ids = [], primary = null) {
    return {
        selection: {
            ids: new Set(ids),
            primary,
        },
    };
}

test('selection reducer clears a deleted selected artifact from runtime selection', () => {
    const state = createSelectionState(['frame-a', 'frame-b'], 'frame-a');

    const next = selectionReducer(state, {
        type: EventTypes.NODE_DELETE,
        payload: { id: 'frame-a' },
    });

    assert.equal(next.selection.ids.has('frame-a'), false);
    assert.equal(next.selection.ids.has('frame-b'), true);
    assert.equal(next.selection.primary, 'frame-b');
});

test('selection reducer ignores deletion of an unselected artifact', () => {
    const state = createSelectionState(['frame-a'], 'frame-a');

    const next = selectionReducer(state, {
        type: EventTypes.NODE_DELETE,
        payload: { id: 'frame-z' },
    });

    assert.equal(next, state);
});

test('selection reducer promotes group wrapper on node wrap', () => {
    const state = createSelectionState(['frame-a', 'frame-b'], 'frame-a');

    const next = selectionReducer(state, {
        type: EventTypes.NODE_WRAP,
        payload: {
            nodeIds: ['frame-a', 'frame-b'],
            wrapperNode: {
                id: 'group-1',
                type: 'group',
            },
        },
    });

    assert.deepEqual(Array.from(next.selection.ids), ['group-1']);
    assert.equal(next.selection.primary, 'group-1');
});
