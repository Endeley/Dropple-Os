import test from 'node:test';
import assert from 'node:assert/strict';

import { syncRuntimeToZustand } from '@/runtime/projection/zustandBridge.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { hashRuntimeState } from '@/core/persistence/hashDocument.js';
import { resolveSemanticZoomPresentation } from '@/runtime/canvas/zoomTiers.js';

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

test('projection sync overlays active interaction transforms into projected view nodes only', () => {
    const runtimeState = {
        document: {
            sceneGraph: {
                rootIds: ['nodeA'],
                nodes: {
                    nodeA: {
                        id: 'nodeA',
                        type: 'frame',
                        parentId: null,
                        children: [],
                    },
                },
            },
            layout: {
                version: 1,
                nodes: {
                    nodeA: { x: 10, y: 20, width: 80, height: 40 },
                },
                computed: {},
                breakpoints: { mobile: 480, tablet: 768, desktop: 1200 },
                dirty: { nodeIds: [], fullPass: false, revision: 0 },
                metadata: { schemaVersion: 1 },
            },
        },
        selection: { ids: new Set(['nodeA']), primary: 'nodeA' },
        interaction: {
            drag: {
                active: true,
                type: 'move',
                interactionTransforms: {
                    nodeA: { x: 110, y: 220 },
                },
            },
        },
    };

    const before = structuredClone(runtimeState);
    syncRuntimeToZustand(runtimeState);

    assert.deepEqual(runtimeState, before);

    const projection = useRuntimeStore.getState();
    assert.equal(projection.viewNodes.nodeA.layout.x, 110);
    assert.equal(projection.viewNodes.nodeA.layout.y, 220);
    assert.equal(projection.viewNodes.nodeA.transform.x, 110);
    assert.equal(projection.viewNodes.nodeA.transform.y, 220);
    assert.equal(runtimeState.document.layout.nodes.nodeA.x, 10);
    assert.equal(runtimeState.document.layout.nodes.nodeA.y, 20);
});

test('projection converges to canonical truth after interaction completion and final hash is replay-stable', () => {
    const buildRuntimeState = () => ({
        document: {
            sceneGraph: {
                rootIds: ['nodeA'],
                nodes: {
                    nodeA: {
                        id: 'nodeA',
                        type: 'frame',
                        parentId: null,
                        children: [],
                    },
                },
            },
            layout: {
                version: 1,
                nodes: {
                    nodeA: { x: 10, y: 20, width: 80, height: 40 },
                },
                computed: {},
                breakpoints: { mobile: 480, tablet: 768, desktop: 1200 },
                dirty: { nodeIds: [], fullPass: false, revision: 0 },
                metadata: { schemaVersion: 1 },
            },
        },
        selection: { ids: new Set(['nodeA']), primary: 'nodeA' },
        interaction: {
            drag: {
                active: true,
                type: 'move',
                interactionTransforms: {
                    nodeA: { x: 110, y: 220 },
                },
            },
        },
    });

    const runtimeStateA = buildRuntimeState();
    syncRuntimeToZustand(runtimeStateA);
    let projection = useRuntimeStore.getState();
    assert.equal(projection.viewNodes.nodeA.layout.x, 110);
    assert.equal(projection.viewNodes.nodeA.layout.y, 220);

    runtimeStateA.document.layout.nodes.nodeA = { x: 110, y: 220, width: 80, height: 40 };
    runtimeStateA.interaction.drag = { active: false, type: 'move', interactionTransforms: {} };
    syncRuntimeToZustand(runtimeStateA);

    projection = useRuntimeStore.getState();
    assert.equal(projection.viewNodes.nodeA.layout.x, 110);
    assert.equal(projection.viewNodes.nodeA.layout.y, 220);
    assert.equal(runtimeStateA.document.layout.nodes.nodeA.x, 110);
    assert.equal(runtimeStateA.document.layout.nodes.nodeA.y, 220);

    const finalHashA = hashRuntimeState(runtimeStateA);

    const runtimeStateB = buildRuntimeState();
    syncRuntimeToZustand(runtimeStateB);
    runtimeStateB.document.layout.nodes.nodeA = { x: 110, y: 220, width: 80, height: 40 };
    runtimeStateB.interaction.drag = { active: false, type: 'move', interactionTransforms: {} };
    syncRuntimeToZustand(runtimeStateB);
    const finalHashB = hashRuntimeState(runtimeStateB);

    assert.equal(finalHashA, finalHashB);
});

test('semantic zoom presentation mapping is deterministic and mutation-free', () => {
    const input = Object.freeze({ scale: 0.5, perspectiveId: 'create' });

    const left = resolveSemanticZoomPresentation(input);
    const right = resolveSemanticZoomPresentation(input);

    assert.deepEqual(left, Object.freeze({
        tier: 'overview',
        perspectiveId: 'create',
        detail: 'domain',
        cluster: 'artifact-group',
        labels: true,
        domain: 'creative',
    }));
    assert.deepEqual(left, right);
    assert.deepEqual(input, Object.freeze({ scale: 0.5, perspectiveId: 'create' }));
});
