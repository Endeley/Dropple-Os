import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createLocalDocumentSnapshot,
    hydrateLocalDocumentSnapshot,
    LOCAL_DOCUMENT_VERSION,
} from '@/infrastructure/persistence/localDocumentSchema.js';
import { getDesignStateAtCursor } from '@/runtime/replay/getDesignStateAtCursor.js';
import { EventTypes } from '@/core/events/eventTypes.js';

test('local persistence roundtrip preserves the event log envelope', () => {
    const events = [
        {
            id: 'main:1',
            type: EventTypes.NODE_CREATE,
            payload: {
                node: {
                    id: 'persisted-node',
                    type: 'frame',
                    props: {
                        transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                    },
                },
            },
        },
    ];

    const snapshot = createLocalDocumentSnapshot({
        events,
        cursorIndex: 0,
        metadata: { name: 'Kernel Fixture' },
    });
    const hydrated = hydrateLocalDocumentSnapshot(snapshot);

    assert.equal(snapshot.version, LOCAL_DOCUMENT_VERSION);
    assert.deepEqual(hydrated, {
        events,
        cursorIndex: 0,
        metadata: { name: 'Kernel Fixture' },
    });
});

test('hydrated persistence data replays back into the same design truth', () => {
    const events = [
        {
            id: 'main:1',
            type: EventTypes.NODE_CREATE,
            payload: {
                node: {
                    id: 'persisted-node',
                    type: 'frame',
                    props: {
                        transform: { x: 12, y: 18, scaleX: 1, scaleY: 1, rotation: 0 },
                    },
                },
            },
        },
        {
            id: 'main:2',
            type: EventTypes.SELECTION_SET,
            payload: { ids: ['persisted-node'] },
        },
    ];

    const hydrated = hydrateLocalDocumentSnapshot(
        createLocalDocumentSnapshot({
            events,
            cursorIndex: 1,
            metadata: { name: 'Kernel Fixture' },
        }),
    );
    const state = getDesignStateAtCursor({
        events: hydrated.events,
        uptoIndex: hydrated.cursorIndex,
    });

    assert.ok(state.nodes['persisted-node']);
    assert.deepEqual(state.rootIds, ['persisted-node']);
    assert.deepEqual(state.selection.ids, ['persisted-node']);
});
