import test from 'node:test';
import assert from 'node:assert/strict';
import { projectGroupTransform } from '@/runtime/projection/groupTransformProjection.js';

test('projectGroupTransform returns null when no active group drag exists', () => {
    assert.equal(projectGroupTransform({ interaction: { drag: null } }), null);
});

test('projectGroupTransform exposes read-only group bounds and node ids', () => {
    const projection = projectGroupTransform({
        interaction: {
            drag: {
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
                },
            },
        },
    });

    assert.deepEqual(projection, {
        bounds: {
            x: 0,
            y: 0,
            width: 250,
            height: 150,
            center: { x: 125, y: 75 },
        },
        nodeIds: ['a', 'b'],
    });
    assert.equal(Object.isFrozen(projection), true);
});
