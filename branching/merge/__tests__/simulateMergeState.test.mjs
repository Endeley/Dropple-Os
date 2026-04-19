import test from 'node:test';
import assert from 'node:assert/strict';

import { replayEvents } from '@/core/persistence/replayEngine.js';
import { simulateMergeState } from '@/branching/merge/simulateMergeState.js';

function createBaseState() {
    return {
        document: {
            sceneGraph: {
                nodes: {},
                rootIds: [],
            },
            layout: {
                version: 1,
                nodes: {},
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

function createEvents() {
    return [
        {
            type: 'node/create',
            payload: {
                node: {
                    id: 'a',
                    type: 'rect',
                },
            },
        },
        {
            type: 'node.layout.bulk',
            payload: {
                updates: [
                    {
                        id: 'a',
                        x: 10,
                        y: 20,
                    },
                ],
            },
        },
    ];
}

test('simulateMergeState is deterministic across runs', () => {
    const baseState = createBaseState();
    const events = createEvents();

    const a = simulateMergeState({ baseState, events });
    const b = simulateMergeState({ baseState, events });

    assert.deepEqual(a, b);
});

test('simulateMergeState does not mutate baseState', () => {
    const baseState = createBaseState();
    const events = createEvents();
    const original = structuredClone(baseState);

    simulateMergeState({ baseState, events });

    assert.deepEqual(baseState, original);
});

test('simulateMergeState matches canonical replay', () => {
    const baseState = createBaseState();
    const events = createEvents();

    const simulated = simulateMergeState({ baseState, events });
    const real = replayEvents({
        events,
        initialState: structuredClone(baseState),
    });

    assert.deepEqual(simulated, real);
});
