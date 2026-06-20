import test from 'node:test';
import assert from 'node:assert/strict';

import { createWrapSelectionEvent, wrapSelection } from '@/runtime/commands/structure/wrapSelection.js';
import { wrapNodes } from '@/core/structure/wrapNodes.js';

test('wrap selection synthesizes wrapper layout from selected node bounds', () => {
    const runtimeState = {
        document: {
            sceneGraph: {
                nodes: {
                    a: {
                        id: 'a',
                        type: 'frame',
                        parentId: null,
                        children: [],
                        zIndex: 1,
                        layout: { x: 10, y: 20, width: 100, height: 80 },
                    },
                    b: {
                        id: 'b',
                        type: 'frame',
                        parentId: null,
                        children: [],
                        zIndex: 3,
                        layout: { x: 150, y: 60, width: 50, height: 40 },
                    },
                },
                rootIds: ['a', 'b'],
            },
        },
    };

    const event = createWrapSelectionEvent({
        runtimeState,
        nodeIds: ['a', 'b'],
        wrapperNode: {
            id: 'group-1',
            type: 'group',
        },
        parentId: null,
    });

    assert.ok(event);
    assert.deepEqual(event.payload.wrapperNode.layout, {
        x: 10,
        y: 20,
        width: 190,
        height: 80,
    });
    assert.equal(event.payload.wrapperNode.zIndex, 4);
});

test('wrap selection dispatches only the structural wrap event', () => {
    const runtimeState = {
        document: {
            sceneGraph: {
                nodes: {
                    a: {
                        id: 'a',
                        type: 'frame',
                        parentId: null,
                        children: [],
                        zIndex: 1,
                        layout: { x: 10, y: 20, width: 100, height: 80 },
                    },
                    b: {
                        id: 'b',
                        type: 'frame',
                        parentId: null,
                        children: [],
                        zIndex: 2,
                        layout: { x: 150, y: 60, width: 50, height: 40 },
                    },
                },
                rootIds: ['a', 'b'],
            },
        },
    };
    const dispatched = [];

    wrapSelection({
        runtimeState,
        nodeIds: ['a', 'b'],
        wrapperNode: {
            id: 'group-1',
            type: 'group',
        },
        parentId: null,
        dispatch(event) {
            dispatched.push(event);
            return event;
        },
    });

    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, 'node/wrap');
});

test('wrap selection preserves async wrap dispatch shape', async () => {
    const runtimeState = {
        document: {
            sceneGraph: {
                nodes: {
                    a: {
                        id: 'a',
                        type: 'frame',
                        parentId: null,
                        children: [],
                        zIndex: 1,
                        layout: { x: 10, y: 20, width: 100, height: 80 },
                    },
                    b: {
                        id: 'b',
                        type: 'frame',
                        parentId: null,
                        children: [],
                        zIndex: 2,
                        layout: { x: 150, y: 60, width: 50, height: 40 },
                    },
                },
                rootIds: ['a', 'b'],
            },
        },
    };
    const dispatched = [];
    const result = wrapSelection({
        runtimeState,
        nodeIds: ['a', 'b'],
        wrapperNode: {
            id: 'group-1',
            type: 'group',
        },
        parentId: null,
        dispatch(event) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    dispatched.push(event);
                    resolve(event);
                }, event.type === 'node/wrap' ? 0 : 0);
            });
        },
    });

    await result;
    assert.equal(dispatched[0]?.type, 'node/wrap');
});

test('wrap nodes groups the full selection when parent child ordering is incomplete', () => {
    const result = wrapNodes({
        nodes: {
            root: {
                id: 'root',
                type: 'frame',
                parentId: null,
                children: ['a'],
            },
            a: {
                id: 'a',
                type: 'frame',
                parentId: 'root',
                children: [],
            },
            b: {
                id: 'b',
                type: 'frame',
                parentId: 'root',
                children: [],
            },
        },
        rootIds: ['root'],
        nodeIds: ['a', 'b'],
        parentId: 'root',
        wrapperNode: {
            id: 'group-1',
            type: 'group',
        },
    });

    assert.deepEqual(result.nodes['group-1']?.children, ['a', 'b']);
    assert.equal(result.nodes.a?.parentId, 'group-1');
    assert.equal(result.nodes.b?.parentId, 'group-1');
    assert.deepEqual(result.nodes.root?.children, ['group-1']);
});
