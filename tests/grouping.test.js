import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { groupProjection } from '@/runtime/grouping/groupProjection.js';
import { groupSelection } from '@/runtime/grouping/groupSelection.js';
import { ungroupSelection } from '@/runtime/grouping/ungroupSelection.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';

function createNode(id, parentId = null, children = []) {
    return {
        id,
        type: 'frame',
        parentId,
        children,
        props: { transform: { x: 0, y: 0 } },
        layout: { x: 0, y: 0, width: 100, height: 100 },
    };
}

function createGroupingState() {
    const state = structuredClone(initialRuntimeState);
    state.document.sceneGraph = {
        rootIds: ['root'],
        nodes: {
            root: createNode('root', null, ['a', 'b', 'c']),
            a: createNode('a', 'root'),
            b: createNode('b', 'root'),
            c: createNode('c', 'root'),
        },
    };
    state.nodes = state.document.sceneGraph.nodes;
    state.rootIds = state.document.sceneGraph.rootIds;
    return state;
}

async function activateWorkspace(dispatcher) {
    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'graphic',
                policy: {
                    mutation: 'allow',
                    capabilities: ['node:create'],
                },
            },
        },
    });
}

test('groupSelection creates a group node and selects it', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createGroupingState(), { animate: false });
    await activateWorkspace(dispatcher);

    const groupId = await groupSelection(['a', 'b'], dispatcher);
    const state = dispatcher.getState();

    assert.equal(groupId, 'group-1');
    assert.equal(state.document.sceneGraph.nodes[groupId].type, 'group');
    assert.deepEqual(state.document.sceneGraph.nodes[groupId].children, ['a', 'b']);
    assert.equal(state.document.sceneGraph.nodes.a.parentId, groupId);
    assert.equal(state.document.sceneGraph.nodes.b.parentId, groupId);
    assert.deepEqual(state.document.sceneGraph.nodes.root.children, ['group-1', 'c']);
    assert.deepEqual(Array.from(state.selection.ids), ['group-1']);
});

test('ungroupSelection restores children to the parent and reselects them', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createGroupingState(), { animate: false });
    await activateWorkspace(dispatcher);

    const groupId = await groupSelection(['a', 'b'], dispatcher);
    const children = await ungroupSelection(groupId, dispatcher);
    const state = dispatcher.getState();

    assert.deepEqual(children, ['a', 'b']);
    assert.equal(state.document.sceneGraph.nodes[groupId], undefined);
    assert.equal(state.document.sceneGraph.nodes.a.parentId, 'root');
    assert.equal(state.document.sceneGraph.nodes.b.parentId, 'root');
    assert.deepEqual(state.document.sceneGraph.nodes.root.children, ['a', 'b', 'c']);
    assert.deepEqual(Array.from(state.selection.ids), ['a', 'b']);
});

test('groupProjection reports current group count', () => {
    assert.deepEqual(
        groupProjection({
            document: {
                sceneGraph: {
                    nodes: {
                        a: { id: 'a', type: 'frame' },
                        g: { id: 'g', type: 'group' },
                    },
                },
            },
        }),
        { count: 1 },
    );
});
