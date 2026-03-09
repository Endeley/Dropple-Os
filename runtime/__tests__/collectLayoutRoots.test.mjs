import { collectLayoutRoots } from '@/runtime/layout/collectLayoutRoots.js';

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function assertSameMembers(actual, expected, message) {
    const normalize = (value) => [...value].sort().join('|');
    if (normalize(actual) !== normalize(expected)) {
        throw new Error(`${message}: expected ${normalize(expected)}, got ${normalize(actual)}`);
    }
}

const sceneGraph = {
    rootIds: ['page'],
    nodes: {
        page: { id: 'page', children: ['row', 'grid', 'freeNode'] },
        row: { id: 'row', parentId: 'page', children: ['childA', 'childB'] },
        childA: { id: 'childA', parentId: 'row', children: [] },
        childB: { id: 'childB', parentId: 'row', children: [] },
        grid: { id: 'grid', parentId: 'page', children: ['card1', 'card2', 'card3'] },
        card1: { id: 'card1', parentId: 'grid', children: ['buttonA'] },
        buttonA: { id: 'buttonA', parentId: 'card1', children: [] },
        card2: { id: 'card2', parentId: 'grid', children: ['buttonB'] },
        buttonB: { id: 'buttonB', parentId: 'card2', children: [] },
        card3: { id: 'card3', parentId: 'grid', children: [] },
        freeNode: { id: 'freeNode', parentId: 'page', children: [] },
        constrainedParent: { id: 'constrainedParent', parentId: 'page', children: ['constraintChild'] },
        constraintChild: { id: 'constraintChild', parentId: 'constrainedParent', children: [] },
    },
};

const layoutNodes = {
    row: {
        mode: 'flow',
        container: {
            type: 'row',
        },
    },
    grid: {
        mode: 'grid',
        container: {
            type: 'grid',
            columns: 3,
            rows: 'auto',
        },
    },
    constrainedParent: {
        mode: 'flow',
        container: {
            type: 'column',
        },
    },
    constraintChild: {
        mode: 'constraint',
        container: null,
    },
};

{
    const roots = collectLayoutRoots({
        dirtyNodeIds: ['childA', 'childB'],
        sceneGraph,
        layoutNodes,
    });

    assertSameMembers(roots, ['row'], 'flow descendants should resolve to nearest flow container');
}

{
    const roots = collectLayoutRoots({
        dirtyNodeIds: ['buttonA', 'buttonB', 'card3'],
        sceneGraph,
        layoutNodes,
    });

    assertSameMembers(roots, ['grid'], 'grid descendants should resolve to grid container');
}

{
    const roots = collectLayoutRoots({
        dirtyNodeIds: ['freeNode'],
        sceneGraph,
        layoutNodes,
    });

    assertSameMembers(roots, ['freeNode'], 'free node should resolve to itself');
}

{
    const roots = collectLayoutRoots({
        dirtyNodeIds: ['constraintChild'],
        sceneGraph,
        layoutNodes,
    });

    assertSameMembers(roots, ['constraintChild'], 'constraint node should resolve to itself as layout boundary');
}

{
    const roots = collectLayoutRoots({
        dirtyNodeIds: ['childA', 'buttonA', 'constraintChild', 'freeNode', 'buttonA'],
        sceneGraph,
        layoutNodes,
    });

    assert(roots.length === 4, 'root collection should dedupe boundaries');
    assertSameMembers(
        roots,
        ['row', 'grid', 'constraintChild', 'freeNode'],
        'mixed dirty set should map to unique layout roots',
    );
}

console.log('COLLECT LAYOUT ROOTS: OK');
