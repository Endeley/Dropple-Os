import { evaluateLayout } from '../layout/evaluateLayout.js';

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

const sceneGraph = {
    rootIds: ['root'],
    nodes: {
        root: { id: 'root', children: ['a', 'b'] },
        a: { id: 'a', children: [] },
        b: { id: 'b', children: [] },
    },
};

const layoutNodes = {
    root: {
        mode: 'flow',
        container: {
            type: 'row',
            wrap: false,
            gap: { main: 10, cross: 0 },
            padding: { top: 8, right: 8, bottom: 8, left: 8 },
            align: { main: 'start', cross: 'start' },
        },
        sizing: {
            width: { mode: 'fixed', value: 300 },
            height: { mode: 'fixed', value: 80 },
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
        participation: {
            absoluteInContainer: false,
            excluded: false,
        },
    },
    a: {
        mode: 'flow',
        container: null,
        sizing: {
            width: { mode: 'fixed', value: 50 },
            height: { mode: 'fixed', value: 20 },
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
        participation: {
            absoluteInContainer: false,
            excluded: false,
        },
    },
    b: {
        mode: 'flow',
        container: null,
        sizing: {
            width: { mode: 'fill', value: null },
            height: { mode: 'fixed', value: 20 },
            minWidth: null,
            maxWidth: null,
            minHeight: null,
            maxHeight: null,
            aspectRatio: null,
        },
        alignSelf: { main: 'auto', cross: 'stretch' },
        constraints: {
            left: false,
            right: false,
            top: false,
            bottom: false,
            centerX: false,
            centerY: false,
        },
        participation: {
            absoluteInContainer: false,
            excluded: false,
        },
    },
};

const nodeGeometry = {
    root: { x: 0, y: 0, width: 300, height: 80 },
    a: { x: 0, y: 0, width: 50, height: 20 },
    b: { x: 0, y: 0, width: 40, height: 20 },
};

const result = evaluateLayout({
    sceneGraph,
    layoutNodes,
    nodeGeometry,
    dirtyNodes: ['root'],
    fullPass: true,
});

assert(result.computed.a.x === 8, 'row child a x mismatch');
assert(result.computed.a.y === 8, 'row child a y mismatch');
assert(result.computed.root.height === 80, 'row container fixed height mismatch');
assert(result.computed.b.x === 68, 'row child b x mismatch');
assert(result.computed.b.height === 64, 'stretch cross size mismatch');
assert(result.affectedNodes.includes('a'), 'affected nodes missing a');
assert(result.affectedNodes.includes('b'), 'affected nodes missing b');

const hugResult = evaluateLayout({
    sceneGraph,
    layoutNodes: {
        ...layoutNodes,
        root: {
            ...layoutNodes.root,
            sizing: {
                ...layoutNodes.root.sizing,
                width: { mode: 'hug', value: null },
            },
        },
        b: {
            ...layoutNodes.b,
            sizing: {
                ...layoutNodes.b.sizing,
                width: { mode: 'fixed', value: 70 },
            },
        },
    },
    nodeGeometry,
    dirtyNodes: ['root'],
    fullPass: true,
});

assert(hugResult.computed.root.width === 146, 'row hug width mismatch');

console.log('EVALUATE LAYOUT FLOW: OK');
