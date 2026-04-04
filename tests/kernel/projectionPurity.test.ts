import test from 'node:test';
import assert from 'node:assert/strict';

import { syncRuntimeToZustand } from '@/runtime/projection/zustandBridge.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';

test.beforeEach(() => {
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
    });
});

test('projection sync does not mutate runtime truth', () => {
    const runtimeState = {
        nodes: {
            frameA: {
                id: 'frameA',
                type: 'frame',
                parentId: null,
                children: [],
                layout: { autoLayout: { direction: 'row' } },
            },
        },
        rootIds: ['frameA'],
        selection: { ids: new Set(['frameA']), primary: 'frameA' },
        clipboard: {
            nodes: [{ id: 'clip-a' }],
            rootIds: ['clip-a'],
        },
        document: {
            sceneGraph: {
                rootIds: ['frameA'],
                nodes: {
                    frameA: {
                        id: 'frameA',
                        type: 'group',
                        parentId: null,
                        children: [],
                        layout: { autoLayout: { direction: 'row' } },
                    },
                },
            },
        },
        scene: {
            computed: {
                frameA: {
                    id: 'frameA',
                    worldBounds: { x: 10, y: 20, width: 80, height: 40 },
                },
            },
        },
        workspace: { id: 'graphic' },
    };

    const before = structuredClone(runtimeState);
    syncRuntimeToZustand(runtimeState);

    assert.deepEqual(runtimeState, before);

    const projection = useRuntimeStore.getState();
    assert.notEqual(projection.viewNodes.frameA, runtimeState.nodes.frameA);
    assert.equal(projection.viewNodes.frameA.id, 'frameA');
    assert.deepEqual(projection.viewRootIds, ['frameA']);
    assert.deepEqual(projection.selection.ids, ['frameA']);
    assert.equal(projection.selection.primary, 'frameA');
    assert.equal(projection.selection.count, 1);
    assert.deepEqual(projection.clipboard, { count: 1, hasData: true });
    assert.deepEqual(projection.grouping, { count: 1 });
    assert.deepEqual(projection.selectionBounds.bounds, {
        x: 10,
        y: 20,
        width: 80,
        height: 40,
    });
    assert.deepEqual(projection.selectionBounds.center, {
        x: 50,
        y: 40,
    });
    assert.deepEqual(projection.transformAnchors.pivot, {
        x: 50,
        y: 40,
    });
    assert.deepEqual(projection.transformAnchors.rotateAnchor, {
        x: 50,
        y: -4,
    });
    assert.deepEqual(projection.transformAnchors.resizeAnchors?.se, {
        x: 90,
        y: 60,
    });
    assert.ok(Array.isArray(projection.guides));
});
