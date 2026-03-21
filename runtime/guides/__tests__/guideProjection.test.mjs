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

test('guideProjection preserves projected spacing guides from active drag state', () => {
    const guides = guideProjection(
        {
            interaction: {
                drag: {
                    active: true,
                    guides: [
                        {
                            type: 'spacing',
                            axis: 'x',
                            from: 40,
                            to: 72,
                            y: 18,
                            spacing: 32,
                        },
                    ],
                },
            },
        },
        { bounds: null },
    );

    assert.deepEqual(guides, [
        {
            type: 'spacing',
            axis: 'x',
            from: 40,
            to: 72,
            y: 18,
            spacing: 32,
        },
    ]);
});

test('guideProjection preserves projected angle guides from active drag state', () => {
    const guides = guideProjection(
        {
            interaction: {
                drag: {
                    active: true,
                    guides: [{ type: 'angle', angle: Math.PI / 4 }],
                },
            },
        },
        { bounds: null },
    );

    assert.deepEqual(guides, [{ type: 'angle', angle: Math.PI / 4 }]);
});
