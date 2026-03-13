import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';

function createNode(id, { parentId, width = 0, height = 0, children = [], layout, responsive } = {}) {
    return {
        id,
        type: 'frame',
        parentId,
        children,
        layout,
        responsive,
        props: {
            transform: {
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                width,
                height,
            },
        },
    };
}

function createState(viewportWidth) {
    const state = structuredClone(initialRuntimeState);

    state.workspace.viewport = {
        ...state.workspace.viewport,
        width: viewportWidth,
    };

    state.document.sceneGraph = {
        rootIds: ['root'],
        nodes: {
            root: createNode('root', {
                width: 400,
                height: 300,
                children: ['child'],
                layout: {
                    mode: 'absolute',
                    size: {
                        width: 400,
                        height: 300,
                    },
                },
            }),
            child: createNode('child', {
                parentId: 'root',
                width: 200,
                height: 100,
                layout: {
                    mode: 'absolute',
                    constraints: {
                        left: true,
                        top: true,
                    },
                    size: {
                        width: 200,
                        height: 100,
                    },
                },
                responsive: {
                    mobile: { width: '100%' },
                    tablet: { width: '50%' },
                    desktop: { width: 400 },
                },
            }),
        },
    };

    state.document.layout.dirty = {
        nodeIds: ['root', 'child'],
        fullPass: true,
        revision: 1,
    };

    return state;
}

test('layout runtime applies mobile responsive width from canonical scene graph layout', () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createState(360), { animate: false });

    const result = dispatcher.getState();
    assert.equal(result.document.layout.computed.child.width, 400);
    assert.equal(result.document.layout.computed.child.x, 0);
    assert.equal(result.document.layout.metadata.compiled.breakpoints.mobile, 480);
});

test('layout runtime applies tablet responsive width from canonical scene graph layout', () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createState(700), { animate: false });

    const result = dispatcher.getState();
    assert.equal(result.document.layout.computed.child.width, 200);
});

test('layout runtime applies desktop responsive width from canonical scene graph layout', () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createState(1280), { animate: false });

    const result = dispatcher.getState();
    assert.equal(result.document.layout.computed.child.width, 400);
});
