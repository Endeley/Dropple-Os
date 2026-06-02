import test from 'node:test';
import assert from 'node:assert/strict';

import { syncRuntimeToZustand } from '@/runtime/projection/zustandBridge.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { hashRuntimeState } from '@/core/persistence/hashDocument.js';
import {
    getZoomTier,
    resolveSemanticZoomNodeSelection,
    resolveSemanticZoomPresentation,
    resolveSemanticZoomVisibility,
} from '@/runtime/canvas/zoomTiers.js';

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
        focus: 'groups',
        nodeDetailLevel: 'label',
        groupDetailLevel: 'artifact-group',
        domain: 'creative',
    }));
    assert.deepEqual(left, right);
    assert.deepEqual(input, Object.freeze({ scale: 0.5, perspectiveId: 'create' }));
});

test('zoom tier boundaries are deterministic and fail closed for invalid scale', () => {
    assert.equal(getZoomTier(-1), 'far');
    assert.equal(getZoomTier(0), 'far');
    assert.equal(getZoomTier(0.399999), 'far');
    assert.equal(getZoomTier(0.4), 'overview');
    assert.equal(getZoomTier(0.799999), 'overview');
    assert.equal(getZoomTier(0.8), 'normal');
    assert.equal(getZoomTier(1.399999), 'normal');
    assert.equal(getZoomTier(1.4), 'detail');
    assert.equal(getZoomTier(2.499999), 'detail');
    assert.equal(getZoomTier(2.5), 'micro');
    assert.equal(getZoomTier(Number.NaN), 'normal');
    assert.equal(getZoomTier(undefined), 'normal');
});

test('semantic zoom visibility is deterministic and defaults to normal for unknown tier', () => {
    const normal = Object.freeze({
        showProjectHubLabel: true,
        showNodeLabels: true,
        showNodeCards: true,
        showClusterDots: false,
        showNodeKindBadges: true,
        showNodeMetadata: false,
        showGroups: false,
        showGroupCounts: false,
        showGroupPreviews: false,
        showGroupHalos: false,
    });
    assert.deepEqual(resolveSemanticZoomVisibility('normal'), normal);
    assert.deepEqual(resolveSemanticZoomVisibility('unknown'), normal);
    assert.equal(Object.isFrozen(resolveSemanticZoomVisibility('far')), true);
});

test('semantic zoom visibility layers are deterministic across far and overview tiers', () => {
    assert.deepEqual(
        resolveSemanticZoomVisibility('far'),
        Object.freeze({
            showProjectHubLabel: true,
            showNodeLabels: false,
            showNodeCards: false,
            showClusterDots: false,
            showNodeKindBadges: false,
            showNodeMetadata: false,
            showGroups: true,
            showGroupCounts: true,
            showGroupPreviews: false,
            showGroupHalos: true,
        }),
    );
    assert.deepEqual(
        resolveSemanticZoomVisibility('overview'),
        Object.freeze({
            showProjectHubLabel: true,
            showNodeLabels: true,
            showNodeCards: false,
            showClusterDots: true,
            showNodeKindBadges: false,
            showNodeMetadata: false,
            showGroups: true,
            showGroupCounts: true,
            showGroupPreviews: true,
            showGroupHalos: true,
        }),
    );
});

test('semantic zoom detail levels are deterministic across tier boundaries', () => {
    assert.deepEqual(
        resolveSemanticZoomPresentation({ scale: 0.2, perspectiveId: 'overview' }),
        Object.freeze({
            tier: 'far',
            perspectiveId: 'overview',
            detail: 'systems',
            cluster: 'project-domain',
            labels: false,
            focus: 'domains',
            nodeDetailLevel: 'hidden',
            groupDetailLevel: 'domain-chip',
            domain: 'project',
        }),
    );
    assert.deepEqual(
        resolveSemanticZoomPresentation({ scale: 1, perspectiveId: 'build' }),
        Object.freeze({
            tier: 'normal',
            perspectiveId: 'build',
            detail: 'artifact',
            cluster: 'artifact-node',
            labels: true,
            focus: 'artifacts',
            nodeDetailLevel: 'label-kind',
            groupDetailLevel: 'artifact-group',
            domain: 'execution',
        }),
    );
    assert.deepEqual(
        resolveSemanticZoomPresentation({ scale: 3, perspectiveId: 'publish' }),
        Object.freeze({
            tier: 'micro',
            perspectiveId: 'publish',
            detail: 'node-precision',
            cluster: 'none',
            labels: true,
            focus: 'inspect',
            nodeDetailLevel: 'metadata',
            groupDetailLevel: 'artifact-group',
            domain: 'release',
        }),
    );
});

test('semantic zoom node selection is perspective-aware, deterministic, and fail-closed', () => {
    const nodeIds = Object.freeze(['brand', 'ui', 'app', 'workflow', 'knowledge', 'media']);
    const buildSelection = resolveSemanticZoomNodeSelection({
        tier: 'overview',
        perspectiveId: 'build',
        nodeIds,
    });
    const createSelection = resolveSemanticZoomNodeSelection({
        tier: 'overview',
        perspectiveId: 'create',
        nodeIds,
    });
    const fallbackSelection = resolveSemanticZoomNodeSelection({
        tier: 'unknown',
        perspectiveId: 'unknown',
        nodeIds,
    });

    assert.deepEqual(buildSelection.selectedNodeIds, Object.freeze(['app', 'workflow', 'ui', 'knowledge']));
    assert.deepEqual(createSelection.selectedNodeIds, Object.freeze(['ui', 'brand', 'media', 'workflow']));
    assert.equal(buildSelection.hiddenCount, 2);
    assert.equal(createSelection.hiddenCount, 2);
    assert.equal(fallbackSelection.perspectiveId, 'overview');
    assert.equal(fallbackSelection.tier, 'unknown');
    assert.equal(fallbackSelection.budget, 6);
    assert.equal(Object.isFrozen(buildSelection.selectedNodeIds), true);
});
