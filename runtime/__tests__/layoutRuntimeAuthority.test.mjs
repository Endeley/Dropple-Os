import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { getWorkspaceDefinition } from '@/platform/workspaces/index.js';
import { getNodes } from '@/runtime/document/documentAdapter.js';

function createNode(id, { x = 0, y = 0, width = 100, height = 80 } = {}) {
    return {
        id,
        type: 'frame',
        children: [],
        parentId: null,
        x,
        y,
        width,
        height,
        layout: {
            mode: 'none',
            gap: 0,
            padding: 0,
            align: 'start',
            x,
            y,
            width,
            height,
        },
        props: {
            transform: {
                x,
                y,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                width,
                height,
            },
        },
    };
}

test('node.layout.bulk survives layout pass using derived geometry projection', async () => {
    const dispatcher = createEventDispatcher({ headless: true, workspaceId: 'uiux' });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceDefinition('uiux'),
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.NODE_CREATE,
        payload: {
            node: createNode('node1', { x: 10, y: 20, width: 120, height: 90 }),
        },
    });

    await dispatcher.dispatch({
        type: 'node.layout.bulk',
        payload: {
            updates: [
                {
                    id: 'node1',
                    x: 200,
                    y: 300,
                },
            ],
        },
    });

    const next = dispatcher.getState();
    const runtimeNode = getNodes(next).node1;

    assert.equal(runtimeNode.layout.x, 200);
    assert.equal(runtimeNode.layout.y, 300);
    assert.equal(runtimeNode.x, 200);
    assert.equal(runtimeNode.y, 300);
    assert.equal(next.document.layout.computed.node1.x, 200);
    assert.equal(next.document.layout.computed.node1.y, 300);
});

test('node.layout.bulk width and height survive layout pass for authored container sizing', async () => {
    const dispatcher = createEventDispatcher({ headless: true, workspaceId: 'uiux' });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceDefinition('uiux'),
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.NODE_CREATE,
        payload: {
            node: createNode('node1', { x: 10, y: 20, width: 120, height: 90 }),
        },
    });

    await dispatcher.dispatch({
        type: 'node.layout.bulk',
        payload: {
            updates: [
                {
                    id: 'node1',
                    width: 240,
                    height: 180,
                },
            ],
        },
    });

    const next = dispatcher.getState();
    const runtimeNode = getNodes(next).node1;

    assert.equal(runtimeNode.layout.width, 240);
    assert.equal(runtimeNode.layout.height, 180);
    assert.equal(runtimeNode.width, 240);
    assert.equal(runtimeNode.height, 180);
    assert.equal(next.document.layout.nodes.node1.sizing.width.value, 240);
    assert.equal(next.document.layout.nodes.node1.sizing.height.value, 180);
    assert.equal(next.document.layout.computed.node1.width, 240);
    assert.equal(next.document.layout.computed.node1.height, 180);
});

test('uiux workspace contract allows canonical node delete through dispatcher', async () => {
    const dispatcher = createEventDispatcher({ headless: true, workspaceId: 'uiux' });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceDefinition('uiux'),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.NODE_CREATE,
        payload: {
            node: createNode('node-delete-me', { x: 40, y: 50, width: 160, height: 120 }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.NODE_DELETE,
        payload: { id: 'node-delete-me' },
    });

    const next = dispatcher.getState();
    assert.equal(getNodes(next)['node-delete-me'], undefined);
});
