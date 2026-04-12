import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSelectionOverlay } from '@/runtime/frame/stages/buildSelectionOverlay.js';

test('buildSelectionOverlay uses computed runtime transforms ahead of static node coordinates', () => {
    const context = buildSelectionOverlay({
        runtimeState: {
            selection: {
                ids: new Set(['node-a']),
            },
            scene: {
                computed: {
                    transforms: {
                        'node-a': {
                            x: 320,
                            y: 180,
                        },
                    },
                },
            },
        },
        renderGraph: {
            nodes: [
                {
                    id: 'node-a',
                    x: 10,
                    y: 20,
                    width: 100,
                    height: 50,
                },
            ],
        },
    });

    assert.deepEqual(context.renderGraph.selectionOverlay, [
        {
            type: 'selection-box',
            id: 'node-a',
            bounds: {
                x: 320,
                y: 180,
                width: 100,
                height: 50,
            },
        },
    ]);
});

test('buildSelectionOverlay falls back to node transform before raw node coordinates', () => {
    const context = buildSelectionOverlay({
        runtimeState: {
            selection: {
                ids: new Set(['node-a']),
            },
            scene: {
                computed: {
                    transforms: {},
                },
            },
        },
        renderGraph: {
            nodes: [
                {
                    id: 'node-a',
                    x: 10,
                    y: 20,
                    width: 100,
                    height: 50,
                    transform: {
                        x: 80,
                        y: 90,
                    },
                },
            ],
        },
    });

    assert.deepEqual(context.renderGraph.selectionOverlay, [
        {
            type: 'selection-box',
            id: 'node-a',
            bounds: {
                x: 80,
                y: 90,
                width: 100,
                height: 50,
            },
        },
    ]);
});
