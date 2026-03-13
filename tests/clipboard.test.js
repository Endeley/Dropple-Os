import test from 'node:test';
import assert from 'node:assert/strict';

import { clipboardProjection } from '@/runtime/clipboard/clipboardProjection.js';
import { copySelection } from '@/runtime/clipboard/copySelection.js';
import { duplicateSelection } from '@/runtime/clipboard/duplicateSelection.js';
import { pasteClipboard } from '@/runtime/clipboard/pasteClipboard.js';
import { createCanonicalDocumentEnvelope } from '@/core/persistence/documentEnvelope.js';

function createDocument() {
    const document = createCanonicalDocumentEnvelope();
    document.sceneGraph = {
        rootIds: ['frame-1'],
        nodes: {
            'frame-1': {
                id: 'frame-1',
                type: 'frame',
                parentId: null,
                children: ['text-1'],
                props: { transform: { x: 0, y: 0 } },
            },
            'text-1': {
                id: 'text-1',
                type: 'text',
                parentId: 'frame-1',
                children: [],
                props: { transform: { x: 10, y: 10 } },
            },
        },
    };
    return document;
}

function createDispatcher(document = createDocument()) {
    const events = [];
    const state = {
        document,
        nodes: document.sceneGraph.nodes,
    };

    return {
        events,
        getState() {
            return state;
        },
        async dispatch(event) {
            events.push(event);
            return state;
        },
    };
}

test('copySelection clones document nodes', () => {
    const clipboard = copySelection(['frame-1', 'text-1'], createDocument());

    assert.deepEqual(clipboard.rootIds, ['frame-1', 'text-1']);
    assert.equal(clipboard.nodes.length, 2);
    assert.notEqual(clipboard.nodes[0], createDocument().sceneGraph.nodes['frame-1']);
});

test('pasteClipboard generates new deterministic node ids', async () => {
    const clipboard = copySelection(['frame-1', 'text-1'], createDocument());
    const dispatcher = createDispatcher();

    const created = await pasteClipboard(clipboard, dispatcher);

    assert.match(created[0].id, /^frame-[A-Za-z0-9_-]+$/);
    assert.match(created[1].id, /^text-[A-Za-z0-9_-]+$/);
    assert.equal(dispatcher.events[0].type, 'node/create');
    assert.equal(dispatcher.events[1].type, 'node/create');
    assert.equal(dispatcher.events[2].type, 'node/attach');
});

test('duplicateSelection creates new nodes through dispatcher events', async () => {
    const dispatcher = createDispatcher();
    const created = await duplicateSelection(['frame-1'], createDocument(), dispatcher);

    assert.equal(created.length, 1);
    assert.equal(dispatcher.events[0].type, 'node/create');
});

test('clipboardProjection reflects clipboard runtime state', () => {
    assert.deepEqual(
        clipboardProjection({
            clipboard: {
                nodes: [{ id: 'a' }, { id: 'b' }],
                rootIds: ['a'],
            },
        }),
        {
            count: 2,
            hasData: true,
        },
    );
});
