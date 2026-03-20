import test from 'node:test';
import assert from 'node:assert/strict';
import { guideProjection } from '@/runtime/guides/guideProjection.js';

test('guideProjection includes active drag guides when selection bounds are absent', () => {
    const guides = guideProjection(
        {
            interaction: {
                drag: {
                    active: true,
                    guides: [{ type: 'vertical', x: 120 }],
                },
            },
        },
        { bounds: null },
    );

    assert.deepEqual(guides, [{ type: 'vertical', x: 120 }]);
});
