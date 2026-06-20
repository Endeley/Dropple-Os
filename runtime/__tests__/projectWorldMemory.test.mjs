import test from 'node:test';
import assert from 'node:assert/strict';

import { applyEvent } from '@/core/events/applyEvent.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { hasProjectHistory } from '@/runtime/workspaces/projectSubstrateNavigation.js';

function createNode(id, layout = { x: 0, y: 0, width: 100, height: 80 }) {
    return {
        id,
        type: 'frame',
        parentId: null,
        children: [],
        layout,
        layoutChild: {},
        props: {},
        style: {},
        content: null,
    };
}

test('project world remembers the first artifact as the beginning of history', () => {
    const firstState = applyEvent(undefined, {
        type: EventTypes.NODE_CREATE,
        payload: {
            node: createNode('frame-a', { x: -192, y: -144, width: 1440, height: 1024 }),
        },
    });

    assert.deepEqual(firstState.document.world.history.firstRememberedArtifact, {
        nodeId: 'frame-a',
        nodeType: 'frame',
        parentId: null,
        layout: {
            mode: 'none',
            gap: 0,
            padding: 0,
            align: 'start',
            x: -192,
            y: -144,
            width: 1440,
            height: 1024,
        },
    });

    const secondState = applyEvent(firstState, {
        type: EventTypes.NODE_CREATE,
        payload: {
            node: createNode('frame-b', { x: 640, y: 320, width: 640, height: 480 }),
        },
    });

    assert.deepEqual(secondState.document.world.history.firstRememberedArtifact, {
        nodeId: 'frame-a',
        nodeType: 'frame',
        parentId: null,
        layout: {
            mode: 'none',
            gap: 0,
            padding: 0,
            align: 'start',
            x: -192,
            y: -144,
            width: 1440,
            height: 1024,
        },
    });
});

test('project history survives deletion of the first artifact and even an empty current scene graph', () => {
    const withFirst = applyEvent(undefined, {
        type: EventTypes.NODE_CREATE,
        payload: {
            node: createNode('frame-a'),
        },
    });

    const withSecond = applyEvent(withFirst, {
        type: EventTypes.NODE_CREATE,
        payload: {
            node: createNode('frame-b'),
        },
    });

    const withoutFirst = applyEvent(withSecond, {
        type: EventTypes.NODE_DELETE,
        payload: { id: 'frame-a' },
    });

    const emptyAgain = applyEvent(withoutFirst, {
        type: EventTypes.NODE_DELETE,
        payload: { id: 'frame-b' },
    });

    assert.equal(Object.keys(emptyAgain.document.sceneGraph.nodes).length, 0);
    assert.equal(
        hasProjectHistory({
            workspaceId: 'uiux',
            nodeCount: 0,
            worldHistory: emptyAgain.document.world.history,
        }),
        true,
    );
    assert.deepEqual(emptyAgain.document.world.history.firstRememberedArtifact, {
        nodeId: 'frame-a',
        nodeType: 'frame',
        parentId: null,
        layout: {
            mode: 'none',
            gap: 0,
            padding: 0,
            align: 'start',
            x: 0,
            y: 0,
            width: 100,
            height: 80,
        },
    });
});

test('first remembered artifact survives deletion and is not reassigned by later creation', () => {
    const withFirst = applyEvent(undefined, {
        type: EventTypes.NODE_CREATE,
        payload: {
            node: createNode('frame-a', { x: 10, y: 20, width: 320, height: 180 }),
        },
    });

    const withoutFirst = applyEvent(withFirst, {
        type: EventTypes.NODE_DELETE,
        payload: { id: 'frame-a' },
    });

    const withReplacement = applyEvent(withoutFirst, {
        type: EventTypes.NODE_CREATE,
        payload: {
            node: createNode('frame-b', { x: 400, y: 240, width: 640, height: 480 }),
        },
    });

    assert.deepEqual(withReplacement.document.world.history.firstRememberedArtifact, {
        nodeId: 'frame-a',
        nodeType: 'frame',
        parentId: null,
        layout: {
            mode: 'none',
            gap: 0,
            padding: 0,
            align: 'start',
            x: 10,
            y: 20,
            width: 320,
            height: 180,
        },
    });

    assert.equal(withReplacement.document.sceneGraph.nodes['frame-b']?.id, 'frame-b');
    assert.equal(
        hasProjectHistory({
            workspaceId: 'uiux',
            nodeCount: Object.keys(withReplacement.document.sceneGraph.nodes).length,
            worldHistory: withReplacement.document.world.history,
        }),
        true,
    );
});

test('dispatcher delete prunes stale animated preview nodes for deleted artifacts', async () => {
    const dispatcher = createEventDispatcher({ headless: true, workspaceId: 'uiux' });

    useAnimatedRuntimeStore.setState(
        {
            previewNodes: {
                'frame-a': {
                    id: 'frame-a',
                    type: 'frame',
                    layout: { x: 0, y: 0, width: 100, height: 80 },
                },
            },
            cameraTransform: { x: 0, y: 0, zoom: 1, rotation: 0 },
        },
        false,
    );

    await dispatcher.dispatch({
        type: EventTypes.NODE_CREATE,
        payload: {
            node: createNode('frame-a'),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.NODE_DELETE,
        payload: { id: 'frame-a' },
    });

    const animated = useAnimatedRuntimeStore.getState();
    assert.deepEqual(animated.previewNodes, {});
    assert.equal(animated.cameraTransform, null);
});

test('node delete removes descendants and detaches them from parent structure', () => {
    const withParent = applyEvent(undefined, {
        type: EventTypes.NODE_CREATE,
        payload: {
            node: createNode('frame-parent', { x: 0, y: 0, width: 400, height: 300 }),
        },
    });

    const withChild = applyEvent(withParent, {
        type: EventTypes.NODE_CREATE,
        payload: {
            node: {
                ...createNode('frame-child', { x: 20, y: 20, width: 120, height: 80 }),
                parentId: 'frame-parent',
            },
        },
    });

    const next = applyEvent(withChild, {
        type: EventTypes.NODE_DELETE,
        payload: { id: 'frame-parent' },
    });

    assert.equal(next.document.sceneGraph.nodes['frame-parent'], undefined);
    assert.equal(next.document.sceneGraph.nodes['frame-child'], undefined);
    assert.equal(next.document.layout.nodes['frame-parent'], undefined);
    assert.equal(next.document.layout.nodes['frame-child'], undefined);
    assert.deepEqual(next.document.sceneGraph.rootIds, []);
});
