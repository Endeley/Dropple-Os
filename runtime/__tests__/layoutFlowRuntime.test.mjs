import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { getNodes } from '@/runtime/document/documentAdapter.js';

function assert(condition, message) {
    if (!condition) throw new Error(message);
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

function createBaseState() {
    const state = structuredClone(initialRuntimeState);

    state.document.sceneGraph = {
        rootIds: ['root'],
        nodes: {
            root: createNode('root', { width: 300, height: 120, children: ['a', 'b'] }),
            a: createNode('a', { width: 50, height: 20 }),
            b: createNode('b', { width: 40, height: 20 }),
        },
    };

    state.document.layout.dirty = {
        nodeIds: ['root'],
        fullPass: true,
        revision: 1,
    };

    return state;
}

function createLayoutNode({
    mode = 'flow',
    container = null,
    widthMode = 'fixed',
    widthValue = null,
    heightMode = 'fixed',
    heightValue = null,
    alignSelfCross = 'auto',
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
        alignSelf: {
            main: 'auto',
            cross: alignSelfCross,
        },
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

{
    const dispatcher = createEventDispatcher({ headless: true });
    const state = createBaseState();

    state.document.layout.nodes = {
        root: createLayoutNode({
            container: {
                type: 'row',
                wrap: false,
                gap: { main: 10, cross: 0 },
                padding: { top: 8, right: 8, bottom: 8, left: 8 },
                align: { main: 'start', cross: 'start' },
            },
            widthMode: 'fixed',
            widthValue: 300,
            heightMode: 'fixed',
            heightValue: 80,
        }),
        a: createLayoutNode({
            widthMode: 'fixed',
            widthValue: 50,
            heightMode: 'fixed',
            heightValue: 20,
        }),
        b: createLayoutNode({
            widthMode: 'fill',
            heightMode: 'fixed',
            heightValue: 20,
            alignSelfCross: 'stretch',
        }),
    };

    dispatcher.hydrateRuntimeState(state, { animate: false });
    const result = dispatcher.getState();
    const projectedNodes = getNodes(result);

    assert(result.document.layout.computed.a.x === 8, 'row runtime child a x mismatch');
    assert(result.document.layout.computed.a.y === 8, 'row runtime child a y mismatch');
    assert(result.document.layout.computed.root.height === 80, 'row runtime container fixed height mismatch');
    assert(result.document.layout.computed.b.x === 68, 'row runtime child b x mismatch');
    assert(result.document.layout.computed.b.height === 64, 'row runtime stretch height mismatch');
    assert(projectedNodes.b.x === 68, 'row runtime derived node x mismatch');
    assert(projectedNodes.b.height === 64, 'row runtime derived node height mismatch');
    assert(result.document.layout.dirty.fullPass === false, 'row runtime dirty fullPass should clear');
    assert(result.document.layout.dirty.nodeIds.length === 0, 'row runtime dirty nodeIds should clear');
}

{
    const dispatcher = createEventDispatcher({ headless: true });
    const state = createBaseState();

    state.document.layout.nodes = {
        root: createLayoutNode({
            container: {
                type: 'column',
                wrap: false,
                gap: { main: 12, cross: 0 },
                padding: { top: 10, right: 6, bottom: 10, left: 6 },
                align: { main: 'start', cross: 'stretch' },
            },
            widthMode: 'fixed',
            widthValue: 160,
            heightMode: 'hug',
        }),
        a: createLayoutNode({
            widthMode: 'fill',
            heightMode: 'fixed',
            heightValue: 24,
        }),
        b: createLayoutNode({
            widthMode: 'fill',
            heightMode: 'fixed',
            heightValue: 30,
        }),
    };

    dispatcher.hydrateRuntimeState(state, { animate: false });
    const result = dispatcher.getState();
    const projectedNodes = getNodes(result);

    assert(result.document.layout.computed.a.x === 6, 'column runtime child a x mismatch');
    assert(result.document.layout.computed.a.y === 10, 'column runtime child a y mismatch');
    assert(result.document.layout.computed.b.y === 46, 'column runtime child b y mismatch');
    assert(result.document.layout.computed.root.height === 86, 'column runtime hug container height mismatch');
    assert(result.document.layout.computed.a.width === 148, 'column runtime fill width mismatch');
    assert(projectedNodes.a.width === 148, 'column runtime derived node width mismatch');
    assert(result.document.layout.dirty.fullPass === false, 'column runtime dirty fullPass should clear');
    assert(result.document.layout.dirty.nodeIds.length === 0, 'column runtime dirty nodeIds should clear');
}

{
    const dispatcher = createEventDispatcher({ headless: true });
    const state = createBaseState();

    state.document.layout.nodes = {
        root: createLayoutNode({
            container: {
                type: 'row',
                wrap: false,
                gap: { main: 10, cross: 0 },
                padding: { top: 10, right: 10, bottom: 10, left: 10 },
                align: { main: 'start', cross: 'start' },
            },
            widthMode: 'hug',
            heightMode: 'hug',
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
    };

    state.document.sceneGraph.nodes.c = createNode('c', { width: 70, height: 20 });
    state.document.sceneGraph.nodes.root.children = ['a', 'b', 'c'];
    state.document.layout.nodes.c = createLayoutNode({
        widthMode: 'fixed',
        widthValue: 70,
        heightMode: 'fixed',
        heightValue: 20,
    });

    dispatcher.hydrateRuntimeState(state, { animate: false });
    const result = dispatcher.getState();

    assert(result.document.layout.computed.root.width === 220, 'row hug container width mismatch');
    assert(result.document.layout.computed.root.height === 40, 'row hug container height mismatch');
    assert(result.document.layout.computed.c.x === 140, 'row hug third child x mismatch');
}

console.log('RUNTIME FLOW LAYOUT: OK');
