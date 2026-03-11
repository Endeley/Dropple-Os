import test from 'node:test';
import assert from 'node:assert/strict';

import { computeGuides } from '@/runtime/guides/computeGuides.js';
import { guideProjection } from '@/runtime/guides/guideProjection.js';

test('computeGuides emits vertical and horizontal guides near aligned targets', () => {
    assert.deepEqual(
        computeGuides(
            { x: 200, y: 120, width: 40, height: 20 },
            [{ type: 'v', x: 200 }, { type: 'h', y: 130 }],
        ),
        [{ type: 'vertical', x: 200 }, { type: 'horizontal', y: 130 }],
    );
});

test('guideProjection derives guides from selection bounds and scene computed', () => {
    const guides = guideProjection(
        {
            selection: {
                ids: new Set(['A']),
            },
            scene: {
                computed: {
                    A: { id: 'A', worldBounds: { x: 0, y: 0, width: 40, height: 20 } },
                    B: { id: 'B', worldBounds: { x: 200, y: 120, width: 40, height: 20 } },
                },
            },
        },
        {
            bounds: { x: 200, y: 120, width: 40, height: 20 },
            center: { x: 220, y: 130 },
        },
    );

    assert.deepEqual(guides, [
        { type: 'vertical', x: 200 },
        { type: 'vertical', x: 220 },
        { type: 'vertical', x: 240 },
        { type: 'horizontal', y: 120 },
        { type: 'horizontal', y: 130 },
        { type: 'horizontal', y: 140 },
    ]);
    assert.equal(Object.isFrozen(guides), true);
});
