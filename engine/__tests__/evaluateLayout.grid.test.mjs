import { evaluateLayout } from '../layout/evaluateLayout.js';

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function assertClose(actual, expected, message) {
    if (Math.abs(actual - expected) > 1e-9) {
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
}

const sceneGraph = {
    rootIds: ['root'],
    nodes: {
        root: { id: 'root', children: ['a', 'b', 'c', 'd'] },
        a: { id: 'a', children: [] },
        b: { id: 'b', children: [] },
        c: { id: 'c', children: [] },
        d: { id: 'd', children: [] },
    },
};

const container = {
    type: 'grid',
    wrap: false,
    gap: { main: 0, cross: 0 },
    padding: { top: 10, right: 10, bottom: 10, left: 10 },
    align: { main: 'start', cross: 'start' },
    columns: 2,
    rows: 'auto',
    columnGap: 12,
    rowGap: 12,
};

const childNode = (width, height, fill = false) => ({
    mode: 'grid',
    container: null,
    sizing: {
        width: { mode: fill ? 'fill' : 'fixed', value: fill ? null : width },
        height: { mode: 'fixed', value: height },
        minWidth: null,
        maxWidth: null,
        minHeight: null,
        maxHeight: null,
        aspectRatio: null,
    },
    alignSelf: { main: 'auto', cross: 'auto' },
    constraints: {
        left: false,
        right: false,
        top: false,
        bottom: false,
        centerX: false,
        centerY: false,
    },
    participation: { absoluteInContainer: false, excluded: false },
});

const layoutNodes = {
    root: {
        mode: 'grid',
        container,
        sizing: {
            width: { mode: 'fixed', value: 232 },
            height: { mode: 'hug', value: null },
            minWidth: null,
            maxWidth: null,
            minHeight: null,
            maxHeight: null,
            aspectRatio: null,
        },
        alignSelf: { main: 'auto', cross: 'auto' },
        constraints: {
            left: false,
            right: false,
            top: false,
            bottom: false,
            centerX: false,
            centerY: false,
        },
        participation: { absoluteInContainer: false, excluded: false },
    },
    a: childNode(60, 20),
    b: childNode(40, 30, true),
    c: childNode(50, 15),
    d: childNode(70, 25),
};

const nodeGeometry = {
    root: { x: 0, y: 0, width: 232, height: 100 },
    a: { x: 0, y: 0, width: 60, height: 20 },
    b: { x: 0, y: 0, width: 40, height: 30 },
    c: { x: 0, y: 0, width: 50, height: 15 },
    d: { x: 0, y: 0, width: 70, height: 25 },
};

const result = evaluateLayout({
    sceneGraph,
    layoutNodes,
    nodeGeometry,
    dirtyNodes: ['root'],
    fullPass: true,
});

assert(result.computed.root.height === 87, 'grid hug container height mismatch');
assert(result.computed.a.x === 10, 'grid child a x mismatch');
assert(result.computed.b.x === 122, 'grid child b x mismatch');
assert(result.computed.c.y === 52, 'grid child c y mismatch');
assert(result.computed.b.width === 100, 'grid fill child width mismatch');
assert(result.affectedNodes.includes('d'), 'grid affected nodes missing d');

console.log('EVALUATE LAYOUT GRID: OK');

const sixChildSceneGraph = {
    rootIds: ['gridRoot'],
    nodes: {
        gridRoot: { id: 'gridRoot', children: ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'] },
        c0: { id: 'c0', children: [] },
        c1: { id: 'c1', children: [] },
        c2: { id: 'c2', children: [] },
        c3: { id: 'c3', children: [] },
        c4: { id: 'c4', children: [] },
        c5: { id: 'c5', children: [] },
    },
};

const sixChildLayoutNodes = {
    gridRoot: {
        mode: 'grid',
        container: {
            type: 'grid',
            wrap: false,
            gap: { main: 0, cross: 0 },
            padding: { top: 10, right: 10, bottom: 10, left: 10 },
            align: { main: 'start', cross: 'start' },
            columns: 3,
            rows: 'auto',
            columnGap: 12,
            rowGap: 12,
        },
        sizing: {
            width: { mode: 'fixed', value: 334 },
            height: { mode: 'hug', value: null },
            minWidth: null,
            maxWidth: null,
            minHeight: null,
            maxHeight: null,
            aspectRatio: null,
        },
        alignSelf: { main: 'auto', cross: 'auto' },
        constraints: {
            left: false,
            right: false,
            top: false,
            bottom: false,
            centerX: false,
            centerY: false,
        },
        participation: { absoluteInContainer: false, excluded: false },
    },
    c0: childNode(40, 20),
    c1: childNode(40, 20),
    c2: childNode(40, 20),
    c3: childNode(40, 20),
    c4: childNode(40, 20),
    c5: childNode(40, 20),
};

const sixChildGeometry = {
    gridRoot: { x: 0, y: 0, width: 334, height: 100 },
    c0: { x: 0, y: 0, width: 40, height: 20 },
    c1: { x: 0, y: 0, width: 40, height: 20 },
    c2: { x: 0, y: 0, width: 40, height: 20 },
    c3: { x: 0, y: 0, width: 40, height: 20 },
    c4: { x: 0, y: 0, width: 40, height: 20 },
    c5: { x: 0, y: 0, width: 40, height: 20 },
};

const sixChildResult = evaluateLayout({
    sceneGraph: sixChildSceneGraph,
    layoutNodes: sixChildLayoutNodes,
    nodeGeometry: sixChildGeometry,
    dirtyNodes: ['gridRoot'],
    fullPass: true,
});

assertClose(sixChildResult.computed.c0.x, 10, 'child0 grid x mismatch');
assertClose(sixChildResult.computed.c0.y, 10, 'child0 grid y mismatch');
assertClose(sixChildResult.computed.c1.x, 118.66666666666667, 'child1 grid x mismatch');
assertClose(sixChildResult.computed.c1.y, 10, 'child1 grid y mismatch');
assertClose(sixChildResult.computed.c2.x, 227.33333333333334, 'child2 grid x mismatch');
assertClose(sixChildResult.computed.c2.y, 10, 'child2 grid y mismatch');
assertClose(sixChildResult.computed.c3.x, 10, 'child3 grid x mismatch');
assertClose(sixChildResult.computed.c3.y, 42, 'child3 grid y mismatch');
assertClose(sixChildResult.computed.c4.x, 118.66666666666667, 'child4 grid x mismatch');
assertClose(sixChildResult.computed.c4.y, 42, 'child4 grid y mismatch');
assertClose(sixChildResult.computed.c5.x, 227.33333333333334, 'child5 grid x mismatch');
assertClose(sixChildResult.computed.c5.y, 42, 'child5 grid y mismatch');

console.log('EVALUATE LAYOUT GRID 3x6: OK');
