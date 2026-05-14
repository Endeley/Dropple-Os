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
import { getVisibleTools } from '@/runtime/tools/toolRuntime.js';
import { getUXAuditLog } from '@/runtime/dispatcher/ux/uxAuditLog.js';

function resetStores() {
    __resetRuntimeStateInternal();
    useRuntimeStore.setState({
        viewNodes: {},
        viewRootIds: [],
        workspace: null,
        viewSceneGraph: null,
        scene: null,
        selection: { ids: [], primary: null, count: 0 },
        clipboard: { count: 0, hasData: false },
        grouping: { count: 0 },
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
        uxAudit: [],
    });
    useAnimatedRuntimeStore.setState({ previewNodes: {}, cameraTransform: null }, false);
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
                tools: ['select', 'shape'],
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
    assert.deepEqual(useRuntimeStore.getState().viewRootIds, ['node-1']);
    assert.equal(useRuntimeStore.getState().tools.activeTool, 'select');
    assert.equal(useRuntimeStore.getState().tools.visibleTools.includes('select'), true);
});

test('dispatcher attaches created child nodes to their parent instead of promoting them to roots', async () => {
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

    await dispatcher.dispatch({
        type: EventTypes.NODE_CREATE,
        payload: {
            node: {
                id: 'root-1',
                type: 'frame',
                children: [],
                layout: { x: 0, y: 0, width: 400, height: 300 },
            },
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.NODE_CREATE,
        payload: {
            node: {
                id: 'child-1',
                type: 'frame',
                parentId: 'root-1',
                layout: { x: 10, y: 10, width: 100, height: 80 },
            },
        },
    });

    assert.equal(next.nodes['child-1']?.parentId, 'root-1');
    assert.deepEqual(next.rootIds, ['root-1']);
    assert.deepEqual(next.nodes['root-1']?.children, ['child-1']);
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

test('dispatcher rejects synthesized tool registration payloads that carry authority-like descriptors', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'graphic',
                tools: ['select'],
                policy: {
                    mutation: 'allow',
                    capabilities: ['node:create'],
                },
            },
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.TOOLS_REGISTER,
        payload: {
            source: 'capability.graph',
            tools: ['move'],
            descriptors: [{
                id: 'move',
                label: 'Move',
                handlerFamily: 'dispatcher',
                dispatch: 'intent.node.move',
            }],
        },
    });

    const next = dispatcher.getState();
    assert.equal(getVisibleTools(next?.tools ?? initialRuntimeState.tools).includes('move'), false);
    assert.deepEqual(next?.tools?.registeredTools?.['capability.graph'] ?? null, null);
});

test('dispatcher rejects recursive synthesized tool registration payloads and preserves prior tool state', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'graphic',
                tools: ['select'],
                policy: {
                    mutation: 'allow',
                    capabilities: ['node:create'],
                },
            },
        },
    });

    const before = dispatcher.getState();
    await dispatcher.dispatch({
        type: EventTypes.TOOLS_REGISTER,
        payload: {
            source: 'capability.graph',
            tools: ['move'],
            descriptors: [{
                id: 'move',
                label: 'Move',
                handlerFamily: 'session',
                metadata: {
                    nested: {
                        type: 'capability.tools.register.requested',
                        payload: {
                            source: 'capability.inner',
                            tools: ['shape'],
                        },
                    },
                },
            }],
        },
    });

    const after = dispatcher.getState();
    assert.deepEqual(after?.tools, before?.tools);
    assert.equal(getVisibleTools(after?.tools ?? initialRuntimeState.tools).includes('move'), false);
});

test('tool registration governance reject emits one telemetry entry per reject attempt with stable payload and no truth mutation', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'graphic',
                tools: ['select'],
                policy: {
                    mutation: 'allow',
                    capabilities: ['node:create'],
                },
            },
        },
    });

    const before = dispatcher.getState();
    const recursiveRejectEvent = {
        type: EventTypes.TOOLS_REGISTER,
        payload: {
            source: 'capability.graph',
            tools: ['move'],
            currentTimeMs: 1000,
            descriptors: [{
                id: 'move',
                label: 'Move',
                handlerFamily: 'session',
                metadata: {
                    nested: {
                        type: 'capability.tools.register.requested',
                        payload: {
                            source: 'capability.inner',
                            tools: ['shape'],
                        },
                    },
                },
            }],
        },
    };

    await dispatcher.dispatch(recursiveRejectEvent);
    await dispatcher.dispatch(recursiveRejectEvent);

    const after = dispatcher.getState();
    assert.deepEqual(after?.tools, before?.tools);

    const rejects = (getUXAuditLog() ?? [])
        .filter((entry) => entry?.type === 'runtime.tools.governance.reject');
    assert.equal(rejects.length, 2);
    assert.deepEqual(rejects[0]?.payload, rejects[1]?.payload);
    assert.deepEqual(rejects[0]?.payload, {
        code: 'tool-registration-recursive-sovereignty-blocked',
        source: 'capability.graph',
        toolIds: ['move'],
        atEventType: EventTypes.TOOLS_REGISTER,
        reason: 'Synthesized tool registration payload contains nested tool-registration intents/actions',
    });
});

test('capability boundary tool registration reject telemetry is emitted once and preserves runtime truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'graphic',
                tools: ['select'],
                policy: {
                    mutation: 'allow',
                    capabilities: ['node:create'],
                },
            },
        },
    });

    const before = dispatcher.getState();
    await dispatcher.dispatch({
        type: 'capability.tools.register.requested',
        payload: {
            source: 'capability.graph',
            tools: ['move'],
            currentTimeMs: 999,
            descriptors: [{
                id: 'move',
                label: 'Move',
                handlerFamily: 'session',
                metadata: {
                    nested: {
                        type: EventTypes.TOOLS_REGISTER,
                        payload: { source: 'capability.inner', tools: ['shape'] },
                    },
                },
            }],
        },
    });

    const after = dispatcher.getState();
    assert.deepEqual(after?.tools, before?.tools);
    const rejects = (getUXAuditLog() ?? [])
        .filter((entry) => entry?.type === 'runtime.tools.governance.reject');
    assert.equal(rejects.length, 1);
    assert.deepEqual(rejects[0]?.payload, {
        code: 'tool-registration-recursive-sovereignty-blocked',
        source: 'capability.graph',
        toolIds: ['move'],
        atEventType: 'capability.tools.register.requested',
        reason: 'Synthesized tool registration payload contains nested tool-registration intents/actions',
    });
});

test('dispatcher undo and redo replay canonical persisted truth while preserving runtime workspace', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'animation',
                tools: ['select', 'keyframe'],
                allowedEventTypes: [EventTypes.TIMELINE_TRACK_CREATE],
                policy: {
                    mutation: 'allow',
                    capabilities: ['timeline:edit'],
                },
            },
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'track-undo-redo',
            type: 'standard',
        },
    });

    const afterCreate = dispatcher.getState();
    assert.equal(afterCreate?.timeline?.timelines?.default?.tracks?.length, 1);
    assert.equal(afterCreate?.workspace?.id, 'animation');
    assert.equal(afterCreate?.cursorIndex, 0);

    const afterUndo = dispatcher.undo();
    assert.equal(afterUndo?.timeline?.timelines?.default?.tracks?.length, 0);
    assert.equal(afterUndo?.workspace?.id, 'animation');
    assert.equal(afterUndo?.cursorIndex, -1);
    assert.equal(afterUndo?.events?.length, 1);

    const afterRedo = dispatcher.redo();
    assert.equal(afterRedo?.timeline?.timelines?.default?.tracks?.length, 1);
    assert.equal(afterRedo?.timeline?.timelines?.default?.tracks?.[0]?.id, 'track-undo-redo');
    assert.equal(afterRedo?.workspace?.id, 'animation');
    assert.equal(afterRedo?.cursorIndex, 0);
    assert.equal(afterRedo?.events?.length, 1);
});

test('clipboard system events update runtime clipboard without entering persisted event mirrors', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    const next = await dispatcher.dispatch({
        type: EventTypes.CLIPBOARD_SET,
        payload: {
            clipboard: {
                nodes: [{ id: 'node-1', type: 'frame' }],
                rootIds: ['node-1'],
            },
        },
    });

    assert.equal(next.clipboard.nodes.length, 1);
    assert.deepEqual(useRuntimeStore.getState().clipboard, {
        count: 1,
        hasData: true,
    });
    assert.deepEqual(useRuntimeStore.getState().events, []);
});

test('style events write truth into document.sceneGraph through the dispatcher', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });
    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'graphic',
                policy: {
                    mutation: 'allow',
                    capabilities: ['node:create', 'node:mutate'],
                },
            },
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.NODE_CREATE,
        payload: {
            node: {
                id: 'styled-1',
                type: 'frame',
                children: [],
                props: {
                    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                },
            },
        },
    });

    const next = await dispatcher.dispatch({
        type: 'node.style.update',
        payload: {
            nodeId: 'styled-1',
            style: { opacity: 0.4, fill: '#ff0000' },
        },
    });

    assert.equal(next.document.sceneGraph.nodes['styled-1']?.style?.opacity, 0.4);
    assert.equal(next.document.sceneGraph.nodes['styled-1']?.style?.fill, '#ff0000');
    assert.equal(useRuntimeStore.getState().viewNodes['styled-1']?.style?.opacity, 0.4);
});

test('structured fills and strokes propagate through dispatcher truth and projected view nodes', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });
    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'graphic',
                policy: {
                    mutation: 'allow',
                    capabilities: ['node:create', 'node:mutate'],
                },
            },
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.NODE_CREATE,
        payload: {
            node: {
                id: 'styled-structured-1',
                type: 'frame',
                children: [],
                props: {
                    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                },
                layout: { x: 0, y: 0, width: 120, height: 80 },
            },
        },
    });

    const next = await dispatcher.dispatch({
        type: 'node.style.update',
        payload: {
            nodeId: 'styled-structured-1',
            style: {
                fill: '#ff0000',
                stroke: { color: '#000000', width: 2 },
                fills: [{ type: 'solid', color: '#ff0000', enabled: true }],
                strokes: [{ color: '#000000', width: 2, enabled: true }],
                opacity: 0.75,
            },
        },
    });

    const truthStyle = next.document.sceneGraph.nodes['styled-structured-1']?.style;
    const viewStyle = useRuntimeStore.getState().viewNodes['styled-structured-1']?.style;

    assert.deepEqual(truthStyle?.fills, [{ type: 'solid', color: '#ff0000', enabled: true }]);
    assert.deepEqual(truthStyle?.strokes, [{ color: '#000000', width: 2, enabled: true }]);
    assert.equal(truthStyle?.fill, '#ff0000');
    assert.deepEqual(truthStyle?.stroke, { color: '#000000', width: 2 });
    assert.equal(truthStyle?.opacity, 0.75);

    assert.deepEqual(viewStyle?.fills, [{ type: 'solid', color: '#ff0000', enabled: true }]);
    assert.deepEqual(viewStyle?.strokes, [{ color: '#000000', width: 2, enabled: true }]);
    assert.equal(viewStyle?.fill, '#ff0000');
    assert.deepEqual(viewStyle?.stroke, { color: '#000000', width: 2 });
    assert.equal(viewStyle?.opacity, 0.75);
});

test('legacy style fields remain supported when structured fills and strokes are absent', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });
    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'graphic',
                policy: {
                    mutation: 'allow',
                    capabilities: ['node:create', 'node:mutate'],
                },
            },
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.NODE_CREATE,
        payload: {
            node: {
                id: 'styled-legacy-1',
                type: 'frame',
                children: [],
                props: {
                    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                },
                layout: { x: 0, y: 0, width: 90, height: 60 },
            },
        },
    });

    const next = await dispatcher.dispatch({
        type: 'node.style.update',
        payload: {
            nodeId: 'styled-legacy-1',
            style: {
                fill: '#00ff00',
                stroke: { color: '#111111', width: 1 },
            },
        },
    });

    const truthStyle = next.document.sceneGraph.nodes['styled-legacy-1']?.style;
    const viewStyle = useRuntimeStore.getState().viewNodes['styled-legacy-1']?.style;

    assert.equal(truthStyle?.fill, '#00ff00');
    assert.deepEqual(truthStyle?.stroke, { color: '#111111', width: 1 });
    assert.equal(truthStyle?.fills, undefined);
    assert.equal(truthStyle?.strokes, undefined);

    assert.equal(viewStyle?.fill, '#00ff00');
    assert.deepEqual(viewStyle?.stroke, { color: '#111111', width: 1 });
    assert.equal(viewStyle?.fills, undefined);
    assert.equal(viewStyle?.strokes, undefined);
});
