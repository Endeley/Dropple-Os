import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { getNodes } from '@/runtime/document/documentAdapter.js';

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

function createConstraintLayoutNode({
    width = 100,
    height = 40,
    constraints = {},
    offsetLeft = 0,
    offsetRight = 0,
    offsetTop = 0,
    offsetBottom = 0,
} = {}) {
    return {
        mode: 'constraint',
        container: null,
        sizing: {
            width: { mode: 'fixed', value: width },
            height: { mode: 'fixed', value: height },
            minWidth: null,
            maxWidth: null,
            minHeight: null,
            maxHeight: null,
            aspectRatio: null,
        },
        alignSelf: {
            main: 'auto',
            cross: 'auto',
        },
        constraints: {
            left: false,
            right: false,
            top: false,
            bottom: false,
            centerX: false,
            centerY: false,
            ...constraints,
        },
        offsetLeft,
        offsetRight,
        offsetTop,
        offsetBottom,
        participation: {
            absoluteInContainer: false,
            excluded: false,
        },
    };
}

function createState({ parentWidth, parentHeight, childWidth = 100, childHeight = 40, layoutNode } = {}) {
    const state = structuredClone(initialRuntimeState);

    state.document.sceneGraph = {
        rootIds: ['root'],
        nodes: {
            root: createNode('root', { width: parentWidth, height: parentHeight, children: ['child'] }),
            child: createNode('child', {
                x: 40,
                y: 30,
                width: childWidth,
                height: childHeight,
                parentId: 'root',
            }),
        },
    };

    state.document.layout.nodes = {
        root: {
            mode: 'free',
            container: null,
            sizing: {
                width: { mode: 'fixed', value: parentWidth },
                height: { mode: 'fixed', value: parentHeight },
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
            offsetLeft: 0,
            offsetRight: 0,
            offsetTop: 0,
            offsetBottom: 0,
            participation: {
                absoluteInContainer: false,
                excluded: false,
            },
        },
        child: layoutNode,
    };

    state.document.layout.dirty = {
        nodeIds: ['child'],
        fullPass: true,
        revision: 1,
    };

    return state;
}

{
    const dispatcher = createEventDispatcher({ headless: true });
    const state = createState({
        parentWidth: 300,
        parentHeight: 180,
        layoutNode: createConstraintLayoutNode({
            constraints: { left: true, top: true },
            offsetLeft: 24,
            offsetTop: 16,
        }),
    });

    dispatcher.hydrateRuntimeState(state, { animate: false });
    const result = dispatcher.getState();
    const projectedNodes = getNodes(result);

    assert(result.document.layout.computed.child.x === 24, 'left pinned child x mismatch');
    assert(result.document.layout.computed.child.y === 16, 'top pinned child y mismatch');
    assert(projectedNodes.child.x === 24, 'left pinned derived node x mismatch');
}

{
    const dispatcher = createEventDispatcher({ headless: true });
    const state = createState({
        parentWidth: 360,
        parentHeight: 180,
        layoutNode: createConstraintLayoutNode({
            constraints: { left: true, right: true, top: true },
            offsetLeft: 20,
            offsetRight: 30,
            offsetTop: 12,
        }),
    });

    dispatcher.hydrateRuntimeState(state, { animate: false });
    const result = dispatcher.getState();
    const projectedNodes = getNodes(result);

    assert(result.document.layout.computed.child.x === 20, 'left+right pinned child x mismatch');
    assert(result.document.layout.computed.child.width === 310, 'left+right pinned child width mismatch');
    assert(projectedNodes.child.width === 310, 'left+right derived node width mismatch');
}

{
    const dispatcher = createEventDispatcher({ headless: true });
    const state = createState({
        parentWidth: 320,
        parentHeight: 200,
        childWidth: 80,
        layoutNode: createConstraintLayoutNode({
            width: 80,
            constraints: { centerX: true, centerY: true },
        }),
    });

    dispatcher.hydrateRuntimeState(state, { animate: false });
    const result = dispatcher.getState();

    assert(result.document.layout.computed.child.x === 120, 'centerX child x mismatch');
    assert(result.document.layout.computed.child.y === 80, 'centerY child y mismatch');
    assert(result.document.layout.dirty.fullPass === false, 'constraint runtime dirty fullPass should clear');
    assert(result.document.layout.dirty.nodeIds.length === 0, 'constraint runtime dirty nodeIds should clear');
}

console.log('RUNTIME CONSTRAINT LAYOUT: OK');
