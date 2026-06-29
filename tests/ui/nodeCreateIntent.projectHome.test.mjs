import test from 'node:test';
import assert from 'node:assert/strict';

import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { nodeCreateIntent } from '@/ui/creation/nodeCreateIntent.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';

function resetRuntimeStore() {
    useRuntimeStore.setState({
        document: { sceneGraph: { rootIds: [], nodes: {} } },
        viewNodes: {},
        viewRootIds: [],
        workspace: {
            id: 'uiux',
            modeId: 'uiux',
            viewport: { x: 0, y: 0, scale: 1 },
            canvasSurface: { type: 'smooth', snap: false },
            canvasPolicy: { allowPan: true, allowZoom: true },
        },
    });
}

test('nodeCreateIntent places the first command-driven frame at project home in Create > UI', () => {
    resetRuntimeStore();

    const received = [];
    const handler = (payload) => received.push(payload);
    canvasBus.on('intent.node.create', handler);

    try {
        nodeCreateIntent({
            type: 'frame',
        });
    } finally {
        canvasBus.off('intent.node.create', handler);
    }

    assert.equal(received.length, 1);
    assert.deepEqual(received[0]?.bounds, {
        x: -192,
        y: -144,
        width: 1440,
        height: 1024,
    });
});

test('nodeCreateIntent does not override explicit frame bounds away from project home', () => {
    resetRuntimeStore();

    const received = [];
    const handler = (payload) => received.push(payload);
    canvasBus.on('intent.node.create', handler);

    try {
        nodeCreateIntent({
            type: 'frame',
            bounds: {
                x: 40,
                y: 80,
                width: 320,
                height: 240,
            },
        });
    } finally {
        canvasBus.off('intent.node.create', handler);
    }

    assert.equal(received.length, 1);
    assert.deepEqual(received[0]?.bounds, {
        x: 40,
        y: 80,
        width: 320,
        height: 240,
    });
});

test('nodeCreateIntent does not reapply first-frame home placement once project history exists', () => {
    useRuntimeStore.setState({
        document: {
            sceneGraph: { rootIds: [], nodes: {} },
            world: {
                history: {
                    firstRememberedArtifact: {
                        nodeId: 'frame-a',
                        nodeType: 'frame',
                        parentId: null,
                        layout: { x: -192, y: -144, width: 1440, height: 1024 },
                    },
                },
            },
        },
        viewNodes: {},
        viewRootIds: [],
        workspace: {
            id: 'uiux',
            modeId: 'uiux',
            viewport: { x: 0, y: 0, scale: 1 },
            canvasSurface: { type: 'smooth', snap: false },
            canvasPolicy: { allowPan: true, allowZoom: true },
        },
    });

    const received = [];
    const handler = (payload) => received.push(payload);
    canvasBus.on('intent.node.create', handler);

    try {
        nodeCreateIntent({
            type: 'frame',
        });
    } finally {
        canvasBus.off('intent.node.create', handler);
    }

    assert.equal(received.length, 1);
    assert.deepEqual(received[0]?.bounds, {
        x: 0,
        y: 0,
        width: 160,
        height: 100,
    });
});

test('nodeCreateIntent preserves creation metadata and naming for lawful first-page scenario creation', () => {
    resetRuntimeStore();

    const received = [];
    const handler = (payload) => received.push(payload);
    canvasBus.on('intent.node.create', handler);

    try {
        nodeCreateIntent({
            type: 'frame',
            name: 'Landing Page',
            metadata: {
                scenario: 'landingPage',
            },
        });
    } finally {
        canvasBus.off('intent.node.create', handler);
    }

    assert.equal(received.length, 1);
    assert.equal(received[0]?.name, 'Landing Page');
    assert.deepEqual(received[0]?.metadata, {
        scenario: 'landingPage',
    });
});
