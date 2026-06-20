import test from 'node:test';
import assert from 'node:assert/strict';

import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { registerNodeCreateBridge } from '@/ui/bridges/nodeCreateBridge.js';
import { registerSelectionIntentBridge } from '@/ui/bridges/selectionIntentBridge.js';
import { registerCommandIntentBridge } from '@/ui/bridges/commandIntentBridge.js';
import { EventTypes } from '@/core/events/eventTypes.js';

test('node create bridge rebinds to the latest registered dispatcher', () => {
    const staleDispatched = [];
    const dispatched = [];

    const cleanupStale = registerNodeCreateBridge((event) => {
        staleDispatched.push(event);
    });
    const cleanupActive = registerNodeCreateBridge((event) => {
        dispatched.push(event);
    });

    try {
        canvasBus.emit('intent.node.create', {
            type: 'frame',
            bounds: { x: 10, y: 20, width: 120, height: 80 },
        });
    } finally {
        cleanupActive?.();
        cleanupStale?.();
    }

    assert.equal(staleDispatched.length, 0);
    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.NODE_CREATE);
    assert.equal(dispatched[0]?.payload?.node?.type, 'frame');
});

test('selection intent bridge rebinds to the latest registered dispatcher', () => {
    const staleDispatched = [];
    const dispatched = [];

    const cleanupStale = registerSelectionIntentBridge({
        dispatch(event) {
            staleDispatched.push(event);
        },
    });
    const cleanupActive = registerSelectionIntentBridge({
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit('intent.selection.select', { nodeId: 'node-1' });
    } finally {
        cleanupActive?.();
        cleanupStale?.();
    }

    assert.equal(staleDispatched.length, 0);
    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.SELECTION_SET);
    assert.deepEqual(dispatched[0]?.payload?.ids, ['node-1']);
    assert.equal(dispatched[0]?.payload?.primary, 'node-1');
});

test('selection intent bridge normalizes grouped child selection to group wrapper', () => {
    const dispatched = [];

    const cleanup = registerSelectionIntentBridge({
        getState() {
            return {
                document: {
                    sceneGraph: {
                        nodes: {
                            'group-1': { id: 'group-1', type: 'group', parentId: null, children: ['node-1'] },
                            'node-1': { id: 'node-1', type: 'frame', parentId: 'group-1' },
                        },
                    },
                },
            };
        },
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit('intent.selection.select', { nodeId: 'node-1' });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.SELECTION_SET);
    assert.deepEqual(dispatched[0]?.payload?.ids, ['group-1']);
    assert.equal(dispatched[0]?.payload?.primary, 'group-1');
});

test('command intent bridge rebinds to the latest registered dispatcher', () => {
    const staleDispatched = [];
    const dispatched = [];
    const runtimeState = {
        workspace: {
            id: 'uiux',
            modeId: 'uiux',
        },
        document: {
            sceneGraph: {
                rootIds: ['node-a', 'node-b'],
                nodes: {
                    'node-a': { id: 'node-a', type: 'frame', parentId: null, children: [] },
                    'node-b': { id: 'node-b', type: 'frame', parentId: null, children: [] },
                },
            },
        },
        selection: {
            ids: new Set(['node-a', 'node-b']),
            primary: 'node-a',
        },
    };

    const staleCleanup = registerCommandIntentBridge({
        getState() {
            return runtimeState;
        },
        dispatch(event) {
            staleDispatched.push(event);
            return event;
        },
    });

    const cleanup = registerCommandIntentBridge({
        getState() {
            return runtimeState;
        },
        dispatch(event) {
            dispatched.push(event);
            return event;
        },
    });

    try {
        canvasBus.emit('intent.command.run', {
            commandId: 'group',
            payload: {
                nodeIds: ['node-a', 'node-b'],
            },
        });
    } finally {
        cleanup?.();
        staleCleanup?.();
    }

    assert.equal(staleDispatched.length, 0);
    assert.equal(dispatched[0]?.type, EventTypes.NODE_WRAP);
    assert.equal(dispatched.length, 1);
});
