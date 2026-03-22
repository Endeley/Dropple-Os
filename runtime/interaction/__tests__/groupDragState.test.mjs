import test from 'node:test';
import assert from 'node:assert/strict';
import { startDrag, initialDragState } from '@/runtime/interaction/dragRuntime.js';

test('startDrag preserves deterministic group metadata when provided', () => {
    const next = startDrag(initialDragState, {
        type: 'move',
        nodeIds: ['b', 'a'],
        pointer: { x: 10, y: 20 },
        group: {
            active: true,
            nodeIds: ['a', 'b'],
            bounds: {
                x: 0,
                y: 0,
                width: 250,
                height: 150,
                center: { x: 125, y: 75 },
            },
            center: { x: 125, y: 75 },
            members: {
                a: {
                    originBounds: { x: 0, y: 0, width: 100, height: 100 },
                    offsetFromGroupOrigin: { x: 0, y: 0 },
                    centerOffsetFromGroupCenter: { x: -75, y: -25 },
                    rotation: 0,
                },
                b: {
                    originBounds: { x: 200, y: 100, width: 50, height: 50 },
                    offsetFromGroupOrigin: { x: 200, y: 100 },
                    centerOffsetFromGroupCenter: { x: 100, y: 50 },
                    rotation: 0,
                },
            },
        },
    });

    assert.deepEqual(Object.keys(next.group.members), ['a', 'b']);
    assert.deepEqual(next.group.nodeIds, ['a', 'b']);
});
