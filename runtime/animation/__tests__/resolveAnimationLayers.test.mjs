import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveAnimationLayers } from '../layers/resolveAnimationLayers.js';

test('resolveAnimationLayers preserves source authority order and annotates intents', () => {
    const result = resolveAnimationLayers({
        timeline: [{ id: 'timeline:walk', channels: [] }],
        choreography: [{ id: 'choreo:beat', channels: [] }],
        stateMachine: [{ id: 'state:attack', channels: [] }],
        graph: [{ id: 'graph:aim', channels: [] }],
    });

    assert.deepEqual(
        result.map((layer) => ({
            id: layer.id,
            intent: layer.intent,
            priority: layer.priority,
            mode: layer.mode ?? null,
        })),
        [
            {
                id: 'timeline:walk',
                intent: 'base',
                priority: 0,
                mode: null,
            },
            {
                id: 'choreo:beat',
                intent: 'base',
                priority: 0,
                mode: null,
            },
            {
                id: 'state:attack',
                intent: 'override',
                priority: 1,
                mode: null,
            },
            {
                id: 'graph:aim',
                intent: 'modifier',
                priority: 2,
                mode: 'add',
            },
        ]
    );
});

test('resolveAnimationLayers leaves explicit graph blend modes intact', () => {
    const result = resolveAnimationLayers({
        graph: [{ id: 'graph:override', mode: 'multiply', channels: [] }],
    });

    assert.equal(result.length, 1);
    assert.equal(result[0].intent, 'modifier');
    assert.equal(result[0].priority, 2);
    assert.equal(result[0].mode, 'multiply');
});
