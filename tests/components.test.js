import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { evaluateComponents } from '@/runtime/components/index.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';

function createState() {
    return structuredClone({
        ...initialRuntimeState,
        document: {
            ...structuredClone(initialRuntimeState.document),
            sceneGraph: {
                rootIds: ['frame-1'],
                nodes: {
                    'frame-1': {
                        id: 'frame-1',
                        type: 'frame',
                        parentId: null,
                        children: ['text-1'],
                        props: { transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 } },
                    },
                    'text-1': {
                        id: 'text-1',
                        type: 'text',
                        parentId: 'frame-1',
                        children: [],
                        props: {
                            transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                            content: 'Button',
                        },
                    },
                },
            },
            components: {
                definitions: {},
                instances: {},
                instanceOverrides: {},
            },
        },
        components: {
            index: {},
            resolvedInstances: {},
        },
    });
}

async function createDispatcherWithState() {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createState(), { animate: false });
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
    return dispatcher;
}

test('componentReducer creates component definitions in document truth', async () => {
    const dispatcher = await createDispatcherWithState();
    const next = await dispatcher.dispatch({
        type: EventTypes.COMPONENT_CREATE,
        payload: {
            componentId: 'button-component',
            rootNodeId: 'frame-1',
        },
    });

    assert.deepEqual(next.document.components.definitions['button-component'], {
        rootNodeId: 'frame-1',
    });
});

test('componentReducer creates instances in document truth', async () => {
    const dispatcher = await createDispatcherWithState();
    await dispatcher.dispatch({
        type: EventTypes.COMPONENT_CREATE,
        payload: {
            componentId: 'button-component',
            rootNodeId: 'frame-1',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.COMPONENT_INSTANCE_CREATE,
        payload: {
            instanceId: 'button-instance',
            componentId: 'button-component',
        },
    });

    assert.deepEqual(next.document.components.instances['button-instance'], {
        componentId: 'button-component',
    });
});

test('componentReducer stores instance overrides in document truth', async () => {
    const dispatcher = await createDispatcherWithState();
    const withOverride = await dispatcher.dispatch({
        type: EventTypes.COMPONENT_INSTANCE_OVERRIDE_SET,
        payload: {
            instanceId: 'button-instance',
            nodeId: 'text-1',
            prop: 'content',
            value: 'Submit',
        },
    });

    assert.equal(
        withOverride.document.components.instanceOverrides['button-instance']['text-1'].content,
        'Submit',
    );
});

test('evaluateComponents resolves instances with overrides into runtime components', () => {
    let state = createState();
    state.document.components.definitions['button-component'] = {
        rootNodeId: 'frame-1',
    };
    state.document.components.instances['button-instance'] = {
        componentId: 'button-component',
    };
    state.document.components.instanceOverrides['button-instance'] = {
        'text-1': {
            content: 'Submit',
        },
    };

    const evaluated = evaluateComponents(state.document, state);
    const resolved = evaluated.components.resolvedInstances['button-instance'];

    assert.ok(resolved);
    assert.equal(resolved.id, 'frame-1');
    assert.equal(resolved.children[0].props.content, 'Submit');
});
