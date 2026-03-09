import { applyLayoutPass } from '@/runtime/layout/applyLayoutPass.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function createNode(id, { x = 0, y = 0, width = 0, height = 0, children = [], parentId } = {}) {
    return {
        id,
        type: 'frame',
        parentId,
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
    mode = 'flow',
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
    rootIds: ['rowRoot', 'freeRoot'],
    nodes: {
        rowRoot: createNode('rowRoot', { width: 200, height: 60, children: ['a', 'b'] }),
        a: createNode('a', { width: 50, height: 20, parentId: 'rowRoot' }),
        b: createNode('b', { width: 30, height: 20, parentId: 'rowRoot' }),
        freeRoot: createNode('freeRoot', { x: 400, y: 200, width: 80, height: 40 }),
    },
};
state.document.layout.nodes = {
    rowRoot: createLayoutNode({
        container: {
            type: 'row',
            wrap: false,
            gap: { main: 10, cross: 0 },
            padding: { top: 5, right: 5, bottom: 5, left: 5 },
            align: { main: 'start', cross: 'start' },
        },
        widthMode: 'fixed',
        widthValue: 200,
        heightMode: 'fixed',
        heightValue: 60,
    }),
    a: createLayoutNode({
        widthMode: 'fixed',
        widthValue: 50,
        heightMode: 'fixed',
        heightValue: 20,
    }),
    b: createLayoutNode({
        widthMode: 'fixed',
        widthValue: 60,
        heightMode: 'fixed',
        heightValue: 20,
    }),
    freeRoot: createLayoutNode({
        mode: 'free',
        widthMode: 'fixed',
        widthValue: 80,
        heightMode: 'fixed',
        heightValue: 40,
    }),
};
state.document.layout.computed = {
    rowRoot: { x: 0, y: 0, width: 200, height: 60, contentBox: { x: 0, y: 0, width: 200, height: 60 }, paddingBox: { x: 0, y: 0, width: 200, height: 60 }, revision: 1 },
    a: { x: 5, y: 5, width: 50, height: 20, contentBox: { x: 5, y: 5, width: 50, height: 20 }, paddingBox: { x: 5, y: 5, width: 50, height: 20 }, revision: 1 },
    b: { x: 65, y: 5, width: 30, height: 20, contentBox: { x: 65, y: 5, width: 30, height: 20 }, paddingBox: { x: 65, y: 5, width: 30, height: 20 }, revision: 1 },
    freeRoot: { x: 999, y: 888, width: 80, height: 40, contentBox: { x: 999, y: 888, width: 80, height: 40 }, paddingBox: { x: 999, y: 888, width: 80, height: 40 }, revision: 7 },
};
state.document.layout.dirty = {
    nodeIds: ['b'],
    fullPass: false,
    revision: 2,
};

const result = applyLayoutPass(state);
const nextState = result.nextState;

assert(nextState.document.layout.computed.a.x === 5, 'incremental layout should preserve unaffected sibling');
assert(nextState.document.layout.computed.b.x === 65, 'incremental layout should recompute dirty subtree child');
assert(nextState.document.layout.computed.freeRoot.x === 999, 'incremental layout should preserve unrelated computed root');
assert(nextState.nodes.freeRoot.x === 999, 'incremental layout should preserve unrelated derived node');
assert(Array.isArray(result.affectedNodes) && result.affectedNodes.includes('rowRoot'), 'incremental layout should report affected root');
assert(!result.affectedNodes.includes('freeRoot'), 'incremental layout should not report unrelated root');

console.log('RUNTIME INCREMENTAL LAYOUT: OK');
