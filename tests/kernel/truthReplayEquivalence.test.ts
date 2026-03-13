import test from 'node:test';
import assert from 'node:assert/strict';

import { replayEvents } from '@/core/persistence/replayEngine.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { hashCanonicalDocument } from '@/core/persistence/hashDocument.js';

test('canonical document truth is replay-equivalent for the same event stream', () => {
    const events = [
        {
            type: EventTypes.NODE_CREATE,
            payload: {
                node: {
                    id: 'root',
                    type: 'frame',
                    props: {
                        transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                    },
                },
            },
        },
        {
            type: EventTypes.NODE_CREATE,
            payload: {
                node: {
                    id: 'child',
                    type: 'frame',
                    parentId: 'root',
                    props: {
                        transform: { x: 10, y: 20, scaleX: 1, scaleY: 1, rotation: 0 },
                    },
                },
            },
        },
        {
            type: EventTypes.NODE_ATTACH,
            payload: {
                parentId: 'root',
                childId: 'child',
            },
        },
        {
            type: 'vector/create',
            payload: {
                id: 'shape1',
                type: 'path',
                path: 'M0 0 L10 0 L10 10 Z',
                fill: '#ff0000',
                stroke: '#000000',
            },
        },
    ];

    const first = replayEvents({ events });
    const second = replayEvents({ events });

    assert.ok(first?.document);
    assert.ok(second?.document);

    const hashA = hashCanonicalDocument(first.document);
    const hashB = hashCanonicalDocument(second.document);

    assert.equal(hashA, hashB);
    assert.deepEqual(first.document, second.document);
});
