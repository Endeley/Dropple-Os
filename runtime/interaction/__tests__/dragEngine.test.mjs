import test from 'node:test';
import assert from 'node:assert/strict';
import {
    endDrag,
    initialDragState,
    startDrag,
    updateDrag,
} from '@/runtime/interaction/dragRuntime.js';
import { computeDragDelta } from '@/runtime/interaction/dragEngine.js';
import {
    collectSnapTargets as collectRuntimeSnapTargets,
    resolveSnap,
} from '@/runtime/interaction/snapResolver.js';

test('startDrag initializes deterministic drag state', () => {
    const next = startDrag(initialDragState, {
        type: 'move',
        nodeIds: ['a'],
        pointer: { x: 10, y: 20 },
        origin: { a: { x: 1, y: 2 } },
    });

    assert.equal(next.active, true);
    assert.equal(next.type, 'move');
    assert.deepEqual(next.nodeIds, ['a']);
    assert.deepEqual(next.startPointer, { x: 10, y: 20 });
    assert.deepEqual(next.previousPointer, { x: 10, y: 20 });
    assert.deepEqual(next.currentPointer, { x: 10, y: 20 });
    assert.deepEqual(next.origin, { a: { x: 1, y: 2 } });
    assert.equal(next.resize, null);
    assert.equal(next.meta, null);
});

test('startDrag captures resize metadata for resize drags', () => {
    const next = startDrag(initialDragState, {
        type: 'resize',
        nodeIds: ['a'],
        pointer: { x: 10, y: 20 },
        handle: 'se',
        originBounds: { x: 5, y: 6, width: 20, height: 30 },
    });

    assert.deepEqual(next.resize, {
        handle: 'se',
        originBounds: { x: 5, y: 6, width: 20, height: 30 },
    });
});

test('updateDrag updates current pointer without mutating origin', () => {
    const started = startDrag(initialDragState, {
        type: 'move',
        nodeIds: ['a'],
        pointer: { x: 10, y: 20 },
        origin: { a: { x: 1, y: 2 } },
    });

    const next = updateDrag(started, { x: 25, y: 35 });

    assert.deepEqual(next.previousPointer, { x: 10, y: 20 });
    assert.deepEqual(next.currentPointer, { x: 25, y: 35 });
    assert.deepEqual(next.origin, { a: { x: 1, y: 2 } });
});

test('endDrag returns initial drag state', () => {
    assert.deepEqual(endDrag(), initialDragState);
});

test('computeDragDelta resolves pointer delta deterministically', () => {
    const delta = computeDragDelta({
        startPointer: { x: 10, y: 15 },
        currentPointer: { x: 16, y: 25 },
    });

    assert.deepEqual(delta, { dx: 6, dy: 10, guides: [], interactionTransforms: null });
});

test('computeDragDelta snaps to grid before apply when enabled', () => {
    const delta = computeDragDelta(
        {
            startPointer: { x: 10, y: 15 },
            currentPointer: { x: 16, y: 27 },
        },
        {
            snap: true,
            snapOptions: { grid: 10 },
        },
    );

    assert.deepEqual(delta, { dx: 10, dy: 10, guides: [], interactionTransforms: null });
});

test('computeDragDelta axis-locks to the dominant direction when enabled', () => {
    const delta = computeDragDelta(
        {
            startPointer: { x: 10, y: 15 },
            currentPointer: { x: 30, y: 22 },
        },
        {
            axisLock: true,
        },
    );

    assert.deepEqual(delta, { dx: 20, dy: 0, guides: [], interactionTransforms: null });
});

test('computeDragDelta applies axis lock before snapping', () => {
    const delta = computeDragDelta(
        {
            startPointer: { x: 10, y: 15 },
            currentPointer: { x: 18, y: 31 },
        },
        {
            axisLock: true,
            snap: true,
            snapOptions: { grid: 10 },
        },
    );

    assert.deepEqual(delta, { dx: 0, dy: 20, guides: [], interactionTransforms: null });
});

test('computeDragDelta delegates snapping to custom resolver and returns guides', () => {
    const delta = computeDragDelta(
        {
            startPointer: { x: 10, y: 10 },
            currentPointer: { x: 14, y: 17 },
        },
        {
            snapResolver({ dx, dy }) {
                return {
                    dx: dx + 1,
                    dy: dy - 2,
                    guides: [{ type: 'vertical', x: 20 }],
                };
            },
        },
    );

    assert.deepEqual(delta, {
        dx: 5,
        dy: 5,
        guides: [{ type: 'vertical', x: 20 }],
        interactionTransforms: null,
    });
});

test('computeDragDelta builds interaction transforms from authored layout before computed transforms', () => {
    const delta = computeDragDelta(
        {
            nodeIds: ['a'],
            startPointer: { x: 10, y: 10 },
            currentPointer: { x: 16, y: 25 },
        },
        {
            nodeLookup: {
                a: {
                    id: 'a',
                    layout: { x: -577, y: -52, width: 100, height: 100 },
                },
            },
            computedTransforms: {
                a: { x: 100, y: 200 },
            },
        },
    );

    assert.deepEqual(delta, {
        dx: 6,
        dy: 15,
        guides: [],
        interactionTransforms: {
            a: { x: -571, y: -37 },
        },
    });
});

test('computeDragDelta keeps interaction transforms anchored to drag origin across successive updates', () => {
    const delta = computeDragDelta(
        {
            nodeIds: ['a'],
            origin: {
                a: { x: 100, y: 200 },
            },
            startPointer: { x: 10, y: 10 },
            currentPointer: { x: 40, y: 50 },
        },
        {
            nodeLookup: {
                a: {
                    id: 'a',
                    layout: { x: 120, y: 230, width: 100, height: 100 },
                },
            },
            computedTransforms: {
                a: { x: 120, y: 230 },
            },
        },
    );

    assert.deepEqual(delta, {
        dx: 30,
        dy: 40,
        guides: [],
        interactionTransforms: {
            a: { x: 130, y: 240 },
        },
    });
});

test('resolveSnap prefers object targets over grid when weighted closer', () => {
    const result = resolveSnap(
        { dx: 7, dy: 12 },
        {
            bounds: {
                x: 10,
                y: 20,
                width: 40,
                height: 20,
            },
            threshold: 6,
            grid: 10,
            targets: [
                { axis: 'x', value: 14, source: 'node-a', weight: 1 },
                { axis: 'y', value: 35, source: 'node-b', weight: 2 },
            ],
        },
    );

    assert.deepEqual(result, {
        dx: 11,
        dy: 17,
        guides: [
            { type: 'vertical', x: 14, source: 'node-a' },
            { type: 'horizontal', y: 35, source: 'node-b' },
        ],
    });
});

test('collectSnapTargets includes adjacent spacing targets for non-dragged nodes', () => {
    const targets = collectRuntimeSnapTargets(
        {
            nodes: {
                a: { id: 'a', layout: { x: 0, y: 0, width: 20, height: 20 } },
                b: { id: 'b', layout: { x: 40, y: 0, width: 20, height: 20 } },
                c: { id: 'c', layout: { x: 0, y: 60, width: 20, height: 20 } },
            },
            scene: { computed: {} },
        },
        { nodeIds: ['dragging'] },
    );

    assert.ok(
        targets.some((target) => target.kind === 'spacing' && target.axis === 'x' && target.spacing === 20),
    );
    assert.ok(
        targets.some((target) => target.kind === 'spacing' && target.axis === 'y' && target.spacing === 40),
    );
});

test('collectSnapTargets derives spacing from computed transforms ahead of authored layout', () => {
    const targets = collectRuntimeSnapTargets(
        {
            nodes: {
                a: { id: 'a', layout: { x: 0, y: 0, width: 20, height: 20 } },
                b: { id: 'b', layout: { x: 40, y: 0, width: 20, height: 20 } },
            },
            scene: {
                computed: {
                    transforms: {
                        a: { x: 100, y: 50 },
                        b: { x: 150, y: 50 },
                    },
                },
            },
        },
        { nodeIds: ['dragging'] },
    );

    assert.ok(
        targets.some((target) => target.kind === 'spacing' && target.axis === 'x' && target.spacing === 30),
    );
});

test('resolveSnap returns spacing guides when spacing candidate wins', () => {
    const result = resolveSnap(
        { dx: 17, dy: 0 },
        {
            bounds: { x: 10, y: 20, width: 10, height: 10 },
            threshold: 6,
            grid: 10,
            targets: [
                {
                    axis: 'x',
                    kind: 'spacing',
                    left: 30,
                    right: 60,
                    spacing: 20,
                    source: 'a:b',
                    weight: 1.15,
                },
            ],
        },
    );

    assert.deepEqual(result, {
        dx: 20,
        dy: 0,
        guides: [
            {
                type: 'spacing',
                axis: 'x',
                from: 40,
                to: 60,
                y: 25,
                spacing: 20,
                source: 'a:b',
            },
        ],
    });
});

test('spacing target wins over edge even if slightly farther', () => {
    const result = resolveSnap(
        { dx: 18, dy: 0 },
        {
            bounds: { x: 10, y: 0, width: 10, height: 10 },
            threshold: 10,
            targets: [
                {
                    axis: 'x',
                    kind: 'edge',
                    value: 18.8,
                    priority: 1,
                },
                {
                    axis: 'x',
                    kind: 'spacing',
                    left: 30,
                    right: 60,
                    spacing: 20,
                    priority: 2,
                    weight: 1,
                },
            ],
        },
    );

    assert.equal(result.dx, 20);
    assert.equal(result.guides[0]?.type, 'spacing');
});

test('intent bias favors movement direction', () => {
    const toward = resolveSnap(
        { dx: 15, dy: 0 },
        {
            bounds: { x: 10, y: 0, width: 10, height: 10 },
            threshold: 10,
            targets: [
                {
                    axis: 'x',
                    kind: 'edge',
                    value: 20,
                    priority: 1,
                },
            ],
        },
    );

    const away = resolveSnap(
        { dx: -15, dy: 0 },
        {
            bounds: { x: 10, y: 0, width: 10, height: 10 },
            threshold: 10,
            targets: [
                {
                    axis: 'x',
                    kind: 'edge',
                    value: 20,
                    priority: 1,
                },
            ],
        },
    );

    assert.ok(toward.dx >= away.dx);
});
