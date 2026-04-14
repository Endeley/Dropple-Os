import test from 'node:test';
import assert from 'node:assert/strict';

import { planMerge } from '@/branching/merge/planMerge.js';
import { EventTypes } from '@/core/events/eventTypes.js';

test('planMerge maps added, removed, and updated diff entries to canonical event types', () => {
    const diff = {
        added: [
            { nodeId: 'a', after: { type: 'rect', layout: { x: 10, y: 20 } } },
        ],
        removed: [
            { nodeId: 'b', before: { x: 1, y: 2 } },
        ],
        updated: [
            {
                nodeId: 'c',
                before: { layout: { x: 3, y: 4 } },
                after: { layout: { x: 30, y: 40 } },
            },
        ],
    };

    assert.deepEqual(planMerge(diff), [
        {
            type: EventTypes.NODE_CREATE,
            payload: {
                node: { id: 'a', type: 'rect', layout: { x: 10, y: 20 } },
            },
        },
        {
            type: EventTypes.NODE_DELETE,
            payload: {
                id: 'b',
            },
        },
        {
            type: EventTypes.NODE_UPDATE,
            payload: {
                id: 'c',
                patch: {
                    layout: { x: 30, y: 40 },
                },
            },
        },
    ]);
});

test('planMerge is deterministic across runs', () => {
    const diff = {
        added: [{ nodeId: 'a', after: { type: 'rect', layout: { x: 1 } } }],
        removed: [{ nodeId: 'b', before: { x: 2 } }],
        updated: [{ nodeId: 'c', before: { layout: { x: 3 } }, after: { layout: { x: 4 } } }],
    };

    const planA = planMerge(diff);
    const planB = planMerge(diff);

    assert.deepEqual(planA, planB);
});

test('planMerge does not mutate the diff input', () => {
    const diff = {
        added: [{ nodeId: 'a', after: { type: 'rect', layout: { x: 1 } } }],
        removed: [{ nodeId: 'b', before: { x: 2 } }],
        updated: [{ nodeId: 'c', before: { layout: { x: 3 } }, after: { layout: { x: 4 } } }],
    };
    const diffCopy = structuredClone(diff);

    planMerge(diff);

    assert.deepEqual(diff, diffCopy);
});

test('planMerge does not assign event ids', () => {
    const diff = {
        added: [{ nodeId: 'a', after: { type: 'rect', layout: { x: 1 } } }],
        removed: [],
        updated: [],
    };

    const plan = planMerge(diff);

    assert.equal('id' in plan[0], false);
});
