import test from 'node:test';
import assert from 'node:assert/strict';

import {
    __TESTING__,
    dispatchMoveDragStart,
} from '@/ui/bridges/toolHandlerRegistrationFacade.js';
import { createSessionCommitActions } from '@/runtime/input/sessionCommitRuntimeBridge.js';

const {
    moveToolHandler,
    resizeToolHandler,
    rotateToolHandler,
} = __TESTING__;

function withWarnSpy(fn) {
    const originalWarn = console.warn;
    const calls = [];
    console.warn = (...args) => {
        calls.push(args);
    };

    try {
        const result = fn();
        return { calls, result };
    } finally {
        console.warn = originalWarn;
    }
}

function withNodeEnv(value, fn) {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = value;
    try {
        return fn();
    } finally {
        process.env.NODE_ENV = previous;
    }
}

test('canonical move/resize/rotate handlers do not hit session commit warnings', () => {
    const moveDispatcher = {
        dispatch() {},
    };
    const resizeDispatcher = {
        dispatch() {},
    };
    const rotateDispatcher = {
        dispatch() {},
    };

    const { calls } = withWarnSpy(() => {
        dispatchMoveDragStart({
            dispatcher: moveDispatcher,
            runtimeState: {
                nodes: {
                    a: { layout: { x: 0, y: 0, width: 20, height: 20 } },
                },
                selection: { ids: [] },
            },
            worldPoint: { x: 10, y: 10 },
            hitNodeId: 'a',
            additive: false,
        });

        moveToolHandler(
            {
                type: 'pointermove',
                event: {},
                worldPoint: { x: 20, y: 10 },
            },
            {
                dispatcher: moveDispatcher,
                state: {
                    nodes: {
                        a: { id: 'a', layout: { x: 0, y: 0, width: 20, height: 20 } },
                    },
                    interaction: {
                        drag: {
                            active: true,
                            type: 'pending-move',
                            nodeIds: ['a'],
                            startPointer: { x: 10, y: 10 },
                            currentPointer: { x: 10, y: 10 },
                            previousPointer: { x: 10, y: 10 },
                            origin: { a: { x: 0, y: 0 } },
                            meta: { snapTargets: [] },
                            group: null,
                        },
                    },
                },
            },
        );

        resizeToolHandler(
            {
                type: 'pointerdown',
                event: {},
                worldPoint: { x: 30, y: 40 },
                targetNodeId: 'a',
                resizeHandle: 'se',
            },
            {
                dispatcher: resizeDispatcher,
                state: {
                    nodes: {
                        a: { id: 'a', layout: { x: 10, y: 20, width: 30, height: 40 } },
                    },
                    interaction: { drag: null },
                },
            },
        );

        rotateToolHandler(
            {
                type: 'pointerdown',
                event: {},
                worldPoint: { x: 25, y: 5 },
                targetNodeId: 'a',
            },
            {
                dispatcher: rotateDispatcher,
                state: {
                    nodes: {
                        a: { id: 'a', layout: { x: 10, y: 20, width: 30, height: 40 }, rotation: 0 },
                    },
                    interaction: { drag: null },
                },
            },
        );
    });

    assert.equal(calls.length, 0);
});

test('session commit bridge warns when asked to commit non-canonical canvas transforms', () => {
    const context = {
        nodesById: {
            a: {
                id: 'a',
                layout: { x: 10, y: 20, width: 30, height: 40 },
                rotation: 0,
            },
        },
        selectedIds: ['a'],
        frameTime: 0,
        autoKeyframeEnabled: false,
        canAuthorAnimationKeyframes: false,
        isAutoLayoutChild: () => false,
    };

    const { calls } = withNodeEnv('development', () =>
        withWarnSpy(() => {
            createSessionCommitActions({
                event: {
                    sessionType: 'move',
                    payload: {
                        type: 'move',
                        nodeIds: ['a'],
                        delta: { dx: 5, dy: 6 },
                    },
                },
                context,
            });

            createSessionCommitActions({
                event: {
                    sessionType: 'resize',
                    payload: {
                        type: 'resize',
                        nodeIds: ['a'],
                        resize: { width: 5, height: 6 },
                        delta: { x: 0, y: 0 },
                    },
                },
                context,
            });

            createSessionCommitActions({
                event: {
                    sessionType: 'rotate',
                    payload: {
                        type: 'rotate',
                        nodeIds: ['a'],
                        rotationDelta: 0.5,
                    },
                },
                context,
            });
        }),
    );

    assert.equal(calls.length, 3);
    assert.match(String(calls[0]?.[0] ?? ''), /Non-canonical canvas move commit/);
    assert.match(String(calls[1]?.[0] ?? ''), /Non-canonical canvas resize commit/);
    assert.match(String(calls[2]?.[0] ?? ''), /Non-canonical canvas rotate commit/);
});
