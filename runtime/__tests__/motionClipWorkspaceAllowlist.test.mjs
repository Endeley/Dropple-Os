import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';

test('uiux workspace allows motion clip create and delete through the active dispatcher path', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            id: 'uiux',
            workspaceDef: {
                id: 'uiux',
                allowedEventTypes: [
                    EventTypes.MOTION_CLIP_CREATE,
                    EventTypes.MOTION_CLIP_DELETE,
                ],
                policy: {
                    mutation: 'open',
                    capabilities: ['timeline:edit'],
                    denies: [],
                },
                timeline: { readOnly: false },
            },
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.MOTION_CLIP_CREATE,
        payload: {
            clip: {
                id: 'clip-1',
                target: 'frame-1',
                property: 'opacity',
                keyframes: [],
            },
        },
    });

    let state = dispatcher.getState();
    assert.equal(state.document.motion.clips['clip-1']?.target, 'frame-1');

    await dispatcher.dispatch({
        type: EventTypes.MOTION_CLIP_DELETE,
        payload: { clipId: 'clip-1' },
    });

    state = dispatcher.getState();
    assert.equal(state.document.motion.clips['clip-1'], undefined);
});

test('uiux workspace allows node wrap and unwrap through the active dispatcher path', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    const runtimeState = structuredClone(initialRuntimeState);
    runtimeState.document.sceneGraph = {
        rootIds: ['a', 'b'],
        nodes: {
            a: {
                id: 'a',
                type: 'frame',
                parentId: null,
                children: [],
                layout: { x: 0, y: 0, width: 100, height: 100 },
            },
            b: {
                id: 'b',
                type: 'frame',
                parentId: null,
                children: [],
                layout: { x: 120, y: 0, width: 100, height: 100 },
            },
        },
    };
    dispatcher.hydrateRuntimeState(runtimeState, { animate: false });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            id: 'uiux',
            workspaceDef: {
                id: 'uiux',
                allowedEventTypes: [
                    EventTypes.NODE_WRAP,
                    EventTypes.NODE_UNWRAP,
                ],
                policy: {
                    mutation: 'open',
                    capabilities: ['node:create'],
                    denies: [],
                },
            },
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.NODE_WRAP,
        payload: {
            nodeIds: ['a', 'b'],
            parentId: null,
            wrapperNode: {
                id: 'group-1',
                type: 'group',
                layout: { x: 0, y: 0, width: 220, height: 100 },
            },
        },
    });

    let state = dispatcher.getState();
    assert.equal(state.document.sceneGraph.nodes['group-1']?.type, 'group');
    assert.deepEqual(state.document.sceneGraph.nodes['group-1']?.children, ['a', 'b']);
    assert.equal(state.document.sceneGraph.nodes.a?.parentId, 'group-1');
    assert.equal(state.document.sceneGraph.nodes.b?.parentId, 'group-1');

    await dispatcher.dispatch({
        type: EventTypes.NODE_UNWRAP,
        payload: {
            nodeId: 'group-1',
        },
    });

    state = dispatcher.getState();
    assert.equal(state.document.sceneGraph.nodes['group-1'], undefined);
    assert.equal(state.document.sceneGraph.nodes.a?.parentId, null);
    assert.equal(state.document.sceneGraph.nodes.b?.parentId, null);
    assert.deepEqual(state.document.sceneGraph.rootIds, ['a', 'b']);
});
