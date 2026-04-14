import test from 'node:test';
import assert from 'node:assert/strict';

import { computeMergeDiff } from '@/branching/merge/computeMergeDiff.js';
import { planMerge } from '@/branching/merge/planMerge.js';
import { simulateMergeState } from '@/branching/merge/simulateMergeState.js';

function createTargetState() {
    return {
        document: {
            sceneGraph: {
                nodes: {
                    a: {
                        id: 'a',
                        type: 'rect',
                        children: [],
                        layoutChild: {
                            grow: 0,
                            align: 'start',
                            size: 'fixed',
                        },
                    },
                },
                rootIds: ['a'],
            },
            layout: {
                version: 1,
                nodes: {
                    a: {
                        x: 10,
                        y: 20,
                    },
                },
                computed: {},
                breakpoints: {
                    mobile: 480,
                    tablet: 768,
                    desktop: 1200,
                },
                dirty: {
                    nodeIds: [],
                    fullPass: false,
                    revision: 0,
                },
                metadata: {
                    schemaVersion: 1,
                },
            },
        },
    };
}

test('full merge pipeline is deterministic', () => {
    const base = {
        a: {
            id: 'a',
            type: 'rect',
            layout: {
                x: 0,
                y: 0,
            },
        },
    };
    const source = {
        a: {
            id: 'a',
            type: 'rect',
            layout: {
                x: 40,
                y: 50,
            },
        },
    };
    const target = {
        a: {
            id: 'a',
            type: 'rect',
            layout: {
                x: 10,
                y: 20,
            },
        },
    };

    const diff = computeMergeDiff(base, source, target);
    const events = planMerge(diff);
    const baseState = createTargetState();

    const simA = simulateMergeState({ baseState, events });
    const simB = simulateMergeState({ baseState, events });

    assert.deepEqual(simA, simB);
    assert.equal(simA.document.layout.nodes.a.x, 40);
    assert.equal(simA.document.layout.nodes.a.y, 50);
});

test('merge plans never inject event ids', () => {
    const diff = {
        added: [
            {
                nodeId: 'a',
                after: {
                    id: 'a',
                    type: 'rect',
                    layout: { x: 10, y: 20 },
                },
            },
        ],
        removed: [],
        updated: [],
    };

    const events = planMerge(diff);

    for (const event of events) {
        assert.equal('id' in event, false);
    }
});
