import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import {
    __resetRuntimeStateInternal,
    initialRuntimeState,
} from '@/runtime/state/runtimeState.internal.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { EventTypes } from '@/core/events/eventTypes.js';

function resetStores() {
    __resetRuntimeStateInternal();
    useRuntimeStore.setState({
        nodes: {},
        rootIds: [],
        workspace: null,
        sceneGraph: null,
        scene: null,
        selection: { ids: [], primary: null, count: 0 },
        selectionBounds: { bounds: null, center: null },
        transformAnchors: { pivot: null, resizeAnchors: null, rotateAnchor: null },
        guides: [],
        frameTime: 0,
        evaluatedScene: null,
        shotId: null,
        shotTimeMs: null,
        evalStatus: 'NO_SHOT',
        events: [],
        cursorIndex: -1,
    });
    useAnimatedRuntimeStore.setState({ nodes: {}, rootIds: [] }, false);
}

test.beforeEach(resetStores);

test('dispatcher assigns event ids and mirrors committed events into the runtime store', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });
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

    const node = {
        id: 'node-1',
        type: 'frame',
        props: {
            transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
        },
    };

    const next = await dispatcher.dispatch({
        type: EventTypes.NODE_CREATE,
        payload: { node },
    });

    const events = useRuntimeStore.getState().events;
    assert.equal(events.length, 1);
    assert.match(events[0].id, /^main:\d+$/);
    assert.equal(events[0].type, EventTypes.NODE_CREATE);
    assert.ok(next.nodes['node-1']);
    assert.deepEqual(useRuntimeStore.getState().rootIds, ['node-1']);
});

test('dispatcher rejects pre-assigned event ids', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    await assert.rejects(
        dispatcher.dispatch({
            id: 'illegal',
            type: EventTypes.SELECTION_SET,
            payload: { ids: ['node-1'] },
        }),
        /Illegal event: event IDs may only be assigned by dispatcher/,
    );

    assert.deepEqual(useRuntimeStore.getState().events, []);
});

test('selection events update runtime state without entering persisted event mirrors', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    const next = await dispatcher.dispatch({
        type: EventTypes.SELECTION_SET,
        payload: { ids: ['node-1'], primary: 'node-1' },
    });

    assert.deepEqual(Array.from(next.selection.ids), ['node-1']);
    assert.equal(next.selection.primary, 'node-1');
    assert.deepEqual(useRuntimeStore.getState().events, []);
});
