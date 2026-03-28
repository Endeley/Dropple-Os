import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { getWorkspaceContractDefinition } from '@/ui/bridges/workspaceActivationFacade.js';
import { EventTypes } from '@/core/events/eventTypes.js';

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

test('node.layout.bulk survives layout pass using runtime geometry authority', async () => {
    const dispatcher = createEventDispatcher({ headless: true, workspaceId: 'uiux' });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceContractDefinition('uiux'),
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
    const runtimeNode = next.nodes.node1;

    assert.equal(runtimeNode.layout.x, 200);
    assert.equal(runtimeNode.layout.y, 300);
    assert.equal(runtimeNode.x, 200);
    assert.equal(runtimeNode.y, 300);
    assert.equal(next.document.layout.computed.node1.x, 200);
    assert.equal(next.document.layout.computed.node1.y, 300);
});
