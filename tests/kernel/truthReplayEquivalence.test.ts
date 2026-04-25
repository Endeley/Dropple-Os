import test from 'node:test';
import assert from 'node:assert/strict';

import { replayEvents as replayPersistenceEvents } from '@/core/persistence/replayEngine.js';
import { replayEvents as replayDispatcherEvents } from '@/runtime/dispatcher/replayEvents.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { hashCanonicalDocument } from '@/core/persistence/hashDocument.js';

function reorderObjectEntries(record) {
    return Object.fromEntries(Object.entries(record).reverse());
}

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

    const first = replayPersistenceEvents({ events });
    const second = replayPersistenceEvents({ events });

    assert.ok(first?.document);
    assert.ok(second?.document);

    const hashA = hashCanonicalDocument(first.document);
    const hashB = hashCanonicalDocument(second.document);

    assert.equal(hashA, hashB);
    assert.deepEqual(first.document, second.document);
});

test('canonical document hash stays stable under object-backed storage reordering', () => {
    const document = {
        sceneGraph: {
            rootIds: ['root'],
            nodes: {
                root: { id: 'root', type: 'frame', children: ['childA', 'childB'] },
                childA: { id: 'childA', type: 'rect', children: [] },
                childB: { id: 'childB', type: 'rect', children: [] },
            },
            scenes: [
                {
                    id: 'sceneA',
                    shots: [
                        { id: 'shotA', start: 0, duration: 1000, compositionId: 'root' },
                    ],
                },
            ],
        },
        layout: {
            nodes: {
                root: { x: 0, y: 0, width: 100, height: 100 },
                childA: { x: 10, y: 10, width: 20, height: 20 },
                childB: { x: 40, y: 10, width: 20, height: 20 },
            },
        },
        vectors: {
            iconA: { id: 'iconA', type: 'path', path: 'M0 0L10 0' },
            iconB: { id: 'iconB', type: 'path', path: 'M0 0L0 10' },
        },
        graphs: {
            b: { id: 'b', nodes: {}, edges: [] },
            a: { id: 'a', nodes: {}, edges: [] },
        },
    };

    const reordered = {
        ...document,
        sceneGraph: {
            ...document.sceneGraph,
            nodes: reorderObjectEntries(document.sceneGraph.nodes),
        },
        layout: {
            ...document.layout,
            nodes: reorderObjectEntries(document.layout.nodes),
        },
        vectors: reorderObjectEntries(document.vectors),
        graphs: reorderObjectEntries(document.graphs),
    };

    assert.equal(hashCanonicalDocument(document), hashCanonicalDocument(reordered));
});

test('canonical document hash is replay-equivalent across persistence and dispatcher entrypoints', () => {
    const events = [
        {
            id: 'main:1',
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
            id: 'main:2',
            type: EventTypes.NODE_CREATE,
            payload: {
                node: {
                    id: 'child',
                    type: 'rect',
                    parentId: 'root',
                    props: {
                        transform: { x: 24, y: 16, scaleX: 1, scaleY: 1, rotation: 0 },
                    },
                },
            },
        },
        {
            id: 'main:3',
            type: EventTypes.NODE_ATTACH,
            payload: {
                parentId: 'root',
                childId: 'child',
            },
        },
        {
            id: 'main:4',
            type: 'vector/create',
            payload: {
                id: 'badge',
                type: 'path',
                path: 'M0 0 L12 0 L12 12 Z',
                fill: '#0ea5e9',
            },
        },
    ];

    const persistenceState = replayPersistenceEvents({ events });
    const dispatcherState = replayDispatcherEvents({ events });

    assert.ok(persistenceState?.document);
    assert.ok(dispatcherState?.document);
    assert.deepEqual(dispatcherState.document, persistenceState.document);
    assert.equal(
        hashCanonicalDocument(persistenceState.document),
        hashCanonicalDocument(dispatcherState.document),
    );
});
