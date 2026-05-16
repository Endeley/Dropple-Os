import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSimulationInputs } from '@/runtime/simulation/buildSimulationInputs.js';
import { evaluateSimulationFrame } from '@/runtime/simulation/evaluateSimulationFrame.js';
import { hashSimulationState } from '@/runtime/simulation/simulationStateHash.js';

function createSnapshot(nodeOrder = ['node-b', 'node-a']) {
    const nodes = {};
    for (const id of nodeOrder) {
        nodes[id] = {
            id,
            type: 'frame',
            layout: {
                x: id === 'node-a' ? 10 : -10,
                y: id === 'node-a' ? 5 : -5,
            },
        };
    }

    return {
        document: {
            sceneGraph: {
                nodes,
            },
        },
        runtime: {
            scene: {
                computed: {
                    'node-a': { x: 100, y: 200 },
                    'node-b': { x: -100, y: -200 },
                },
            },
        },
    };
}

test('buildSimulationInputs canonicalizes entity ordering deterministically', () => {
    const snapshot = createSnapshot(['node-b', 'node-a']);
    const inputs = buildSimulationInputs({
        document: snapshot.document,
        runtime: snapshot.runtime,
        time: 16,
        deltaTime: 16,
    });

    assert.deepEqual(
        inputs.entities.map((entity) => entity.id),
        ['node-a', 'node-b'],
    );
});

test('evaluateSimulationFrame is deterministic for identical input + previous state', () => {
    const snapshot = createSnapshot();
    const previousSimulationState = Object.freeze({
        tickTime: 0,
        deltaTime: 16,
        entities: Object.freeze({
            'node-a': Object.freeze({ id: 'node-a', x: 0, y: 0, vx: 0, vy: 0 }),
            'node-b': Object.freeze({ id: 'node-b', x: 0, y: 0, vx: 0, vy: 0 }),
        }),
    });

    const left = evaluateSimulationFrame({
        document: snapshot.document,
        runtime: snapshot.runtime,
        previousSimulationState,
        time: 16,
        deltaTime: 16,
    });
    const right = evaluateSimulationFrame({
        document: snapshot.document,
        runtime: snapshot.runtime,
        previousSimulationState,
        time: 16,
        deltaTime: 16,
    });

    assert.deepEqual(left, right);
    assert.equal(hashSimulationState(left), hashSimulationState(right));
});

test('evaluateSimulationFrame does not mutate document runtime or previous simulation state', () => {
    const snapshot = createSnapshot();
    const previousSimulationState = {
        tickTime: 0,
        deltaTime: 16,
        entities: {
            'node-a': { id: 'node-a', x: 0, y: 0, vx: 0, vy: 0 },
            'node-b': { id: 'node-b', x: 0, y: 0, vx: 0, vy: 0 },
        },
    };

    const documentBefore = structuredClone(snapshot.document);
    const runtimeBefore = structuredClone(snapshot.runtime);
    const prevBefore = structuredClone(previousSimulationState);

    evaluateSimulationFrame({
        document: snapshot.document,
        runtime: snapshot.runtime,
        previousSimulationState,
        time: 16,
        deltaTime: 16,
    });

    assert.deepEqual(snapshot.document, documentBefore);
    assert.deepEqual(snapshot.runtime, runtimeBefore);
    assert.deepEqual(previousSimulationState, prevBefore);
});

test('reordered source nodes produce identical simulation state hash', () => {
    const leftSnapshot = createSnapshot(['node-b', 'node-a']);
    const rightSnapshot = createSnapshot(['node-a', 'node-b']);

    const left = evaluateSimulationFrame({
        document: leftSnapshot.document,
        runtime: leftSnapshot.runtime,
        previousSimulationState: null,
        time: 16,
        deltaTime: 16,
    });
    const right = evaluateSimulationFrame({
        document: rightSnapshot.document,
        runtime: rightSnapshot.runtime,
        previousSimulationState: null,
        time: 16,
        deltaTime: 16,
    });

    assert.equal(hashSimulationState(left), hashSimulationState(right));
    assert.deepEqual(left, right);
});
