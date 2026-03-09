import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function assertClose(actual, expected, message) {
    if (Math.abs(actual - expected) > 1e-9) {
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
}

function createNode(id, { x = 0, y = 0, width = 0, height = 0, children = [] } = {}) {
    return {
        id,
        type: 'frame',
        children,
        props: {
            transform: {
                x,
                y,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                width,
                height,
            },
        },
    };
}

function createLayoutNode({
    mode = 'grid',
    container = null,
    widthMode = 'fixed',
    widthValue = null,
    heightMode = 'fixed',
    heightValue = null,
} = {}) {
    return {
        mode,
        container,
        sizing: {
            width: { mode: widthMode, value: widthValue },
            height: { mode: heightMode, value: heightValue },
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
    };
}

const state = structuredClone(initialRuntimeState);
state.document.sceneGraph = {
    rootIds: ['root'],
    nodes: {
        root: createNode('root', { width: 232, height: 100, children: ['a', 'b', 'c', 'd'] }),
        a: createNode('a', { width: 60, height: 20 }),
        b: createNode('b', { width: 40, height: 30 }),
        c: createNode('c', { width: 50, height: 15 }),
        d: createNode('d', { width: 70, height: 25 }),
    },
};
state.document.layout.nodes = {
    root: createLayoutNode({
        container: {
            type: 'grid',
            wrap: false,
            gap: { main: 0, cross: 0 },
            padding: { top: 10, right: 10, bottom: 10, left: 10 },
            align: { main: 'start', cross: 'start' },
            columns: 2,
            rows: 'auto',
            columnGap: 12,
            rowGap: 12,
        },
        widthMode: 'fixed',
        widthValue: 232,
        heightMode: 'hug',
    }),
    a: createLayoutNode({ widthMode: 'fixed', widthValue: 60, heightMode: 'fixed', heightValue: 20 }),
    b: createLayoutNode({ widthMode: 'fill', heightMode: 'fixed', heightValue: 30 }),
    c: createLayoutNode({ widthMode: 'fixed', widthValue: 50, heightMode: 'fixed', heightValue: 15 }),
    d: createLayoutNode({ widthMode: 'fixed', widthValue: 70, heightMode: 'fixed', heightValue: 25 }),
};
state.document.layout.dirty = {
    nodeIds: ['root'],
    fullPass: true,
    revision: 1,
};

const dispatcher = createEventDispatcher({ headless: true });
dispatcher.hydrateRuntimeState(state, { animate: false });
const result = dispatcher.getState();

assert(result.document.layout.computed.root.height === 87, 'grid runtime hug container height mismatch');
assert(result.document.layout.computed.a.x === 10, 'grid runtime child a x mismatch');
assert(result.document.layout.computed.b.x === 122, 'grid runtime child b x mismatch');
assert(result.document.layout.computed.c.y === 52, 'grid runtime child c y mismatch');
assert(result.document.layout.computed.b.width === 100, 'grid runtime fill width mismatch');
assert(result.nodes.b.width === 100, 'grid runtime legacy node width mismatch');
assert(result.document.layout.dirty.fullPass === false, 'grid runtime dirty fullPass should clear');
assert(result.document.layout.dirty.nodeIds.length === 0, 'grid runtime dirty nodeIds should clear');

console.log('RUNTIME GRID LAYOUT: OK');

const sixChildState = structuredClone(initialRuntimeState);
sixChildState.document.sceneGraph = {
    rootIds: ['gridRoot'],
    nodes: {
        gridRoot: createNode('gridRoot', {
            width: 334,
            height: 100,
            children: ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'],
        }),
        c0: createNode('c0', { width: 40, height: 20 }),
        c1: createNode('c1', { width: 40, height: 20 }),
        c2: createNode('c2', { width: 40, height: 20 }),
        c3: createNode('c3', { width: 40, height: 20 }),
        c4: createNode('c4', { width: 40, height: 20 }),
        c5: createNode('c5', { width: 40, height: 20 }),
    },
};
sixChildState.document.layout.nodes = {
    gridRoot: createLayoutNode({
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
        widthMode: 'fixed',
        widthValue: 334,
        heightMode: 'hug',
    }),
    c0: createLayoutNode({ widthMode: 'fixed', widthValue: 40, heightMode: 'fixed', heightValue: 20 }),
    c1: createLayoutNode({ widthMode: 'fixed', widthValue: 40, heightMode: 'fixed', heightValue: 20 }),
    c2: createLayoutNode({ widthMode: 'fixed', widthValue: 40, heightMode: 'fixed', heightValue: 20 }),
    c3: createLayoutNode({ widthMode: 'fixed', widthValue: 40, heightMode: 'fixed', heightValue: 20 }),
    c4: createLayoutNode({ widthMode: 'fixed', widthValue: 40, heightMode: 'fixed', heightValue: 20 }),
    c5: createLayoutNode({ widthMode: 'fixed', widthValue: 40, heightMode: 'fixed', heightValue: 20 }),
};
sixChildState.document.layout.dirty = {
    nodeIds: ['gridRoot'],
    fullPass: true,
    revision: 1,
};

const sixChildDispatcher = createEventDispatcher({ headless: true });
sixChildDispatcher.hydrateRuntimeState(sixChildState, { animate: false });
const sixChildResult = sixChildDispatcher.getState();

assertClose(sixChildResult.document.layout.computed.c0.x, 10, 'runtime child0 grid x mismatch');
assertClose(sixChildResult.document.layout.computed.c0.y, 10, 'runtime child0 grid y mismatch');
assertClose(sixChildResult.document.layout.computed.c1.x, 118.66666666666667, 'runtime child1 grid x mismatch');
assertClose(sixChildResult.document.layout.computed.c1.y, 10, 'runtime child1 grid y mismatch');
assertClose(sixChildResult.document.layout.computed.c2.x, 227.33333333333334, 'runtime child2 grid x mismatch');
assertClose(sixChildResult.document.layout.computed.c2.y, 10, 'runtime child2 grid y mismatch');
assertClose(sixChildResult.document.layout.computed.c3.x, 10, 'runtime child3 grid x mismatch');
assertClose(sixChildResult.document.layout.computed.c3.y, 42, 'runtime child3 grid y mismatch');
assertClose(sixChildResult.document.layout.computed.c4.x, 118.66666666666667, 'runtime child4 grid x mismatch');
assertClose(sixChildResult.document.layout.computed.c4.y, 42, 'runtime child4 grid y mismatch');
assertClose(sixChildResult.document.layout.computed.c5.x, 227.33333333333334, 'runtime child5 grid x mismatch');
assertClose(sixChildResult.document.layout.computed.c5.y, 42, 'runtime child5 grid y mismatch');
assert(sixChildResult.document.layout.computed.gridRoot.height === 72, 'runtime 3x6 grid hug height mismatch');
assert(sixChildResult.document.layout.dirty.nodeIds.length === 0, 'runtime 3x6 grid dirty nodeIds should clear');

console.log('RUNTIME GRID LAYOUT 3x6: OK');
