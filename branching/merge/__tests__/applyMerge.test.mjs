import test from 'node:test';
import assert from 'node:assert/strict';

import { replayEvents } from '@/core/persistence/replayEngine.js';
import { applyMerge } from '@/branching/merge/applyMerge.js';
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

test('applyMerge dispatches all events', () => {
    const events = createEvents();
    const calls = [];
    const dispatcher = {
        dispatch: (event) => calls.push(event),
    };

    const result = applyMerge({ dispatcher, events });

    assert.equal(result.applied, events.length);
    assert.equal(calls.length, events.length);
});

test('applyMerge preserves event order', () => {
    const events = createEvents();
    const calls = [];
    const dispatcher = {
        dispatch: (event) => calls.push(event),
    };

    applyMerge({ dispatcher, events });

    assert.deepEqual(calls, events);
});

test('applyMerge does not mutate events', () => {
    const events = createEvents();
    const copy = structuredClone(events);
    const dispatcher = {
        dispatch: () => {},
    };

    applyMerge({ dispatcher, events });

    assert.deepEqual(events, copy);
});

test('applyMerge dispatch replay matches simulateMergeState', () => {
    const baseState = createBaseState();
    const events = createEvents();
    const simulated = simulateMergeState({ baseState, events });

    const dispatched = [];
    const dispatcher = {
        dispatch: (event) => {
            dispatched.push(event);
        },
    };

    applyMerge({ dispatcher, events });
    const real = replayEvents({
        events: dispatched,
        initialState: structuredClone(baseState),
    });

    assert.deepEqual(simulated, real);
});
