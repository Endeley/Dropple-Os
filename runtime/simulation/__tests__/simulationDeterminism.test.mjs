import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSimulationInputs } from '@/runtime/simulation/buildSimulationInputs.js';
import { evaluateSimulationFrame } from '@/runtime/simulation/evaluateSimulationFrame.js';
import { hashSimulationState } from '@/runtime/simulation/simulationStateHash.js';
import { simulationTick } from '@/runtime/simulation/simulationTick.js';
import {
    buildSimulationPartitionSchedule,
    createSimulationPartitionCheckpoint,
} from '@/runtime/simulation/simulationPartitionSchedule.js';
import { hashRuntimeState } from '@/core/persistence/hashDocument.js';

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
            simulation: {
                dampingProfiles: {
                    smooth: { dampingMultiplier: 1.5, springMultiplier: 0.8 },
                    snappy: { dampingMultiplier: 0.6, springMultiplier: 1.2 },
                },
                entityProfiles: {
                    'node-a': 'smooth',
                    'node-b': 'snappy',
                },
                springChains: [
                    {
                        id: 'chain-main',
                        members: ['node-a', 'node-b'],
                        stiffness: 1.1,
                        damping: 0.4,
                        blendMode: 'add',
                    },
                ],
                springChainGroups: [
                    {
                        id: 'group-base',
                        chainIds: ['chain-main'],
                        blendMode: 'add',
                        priority: 0,
                    },
                ],
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
    assert.deepEqual(Object.keys(inputs.dampingProfiles), ['smooth', 'snappy']);
    assert.deepEqual(inputs.entityProfiles, { 'node-a': 'smooth', 'node-b': 'snappy' });
    assert.deepEqual(inputs.springChains.map((chain) => chain.id), ['chain-main']);
    assert.deepEqual(inputs.springChainGroups.map((group) => group.id), ['group-base']);
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

test('damping profiles and spring chains remain deterministic across repeated ticks', () => {
    const snapshot = createSnapshot();
    const seed = evaluateSimulationFrame({
        document: snapshot.document,
        runtime: snapshot.runtime,
        previousSimulationState: null,
        time: 16,
        deltaTime: 16,
    });

    const runTrace = () => {
        let previous = seed;
        const hashes = [];
        for (let step = 1; step <= 5; step += 1) {
            previous = evaluateSimulationFrame({
                document: snapshot.document,
                runtime: snapshot.runtime,
                previousSimulationState: previous,
                time: 16 + step * 16,
                deltaTime: 16,
            });
            hashes.push(hashSimulationState(previous));
        }
        return hashes;
    };

    assert.deepEqual(runTrace(), runTrace());
});

test('reordered chain/group declarations produce identical layered simulation result', () => {
    const left = createSnapshot(['node-b', 'node-a']);
    left.document.simulation.springChains = [
        {
            id: 'chain-z',
            members: ['node-a', 'node-b'],
            stiffness: 1.3,
            damping: 0.2,
            blendMode: 'replace',
        },
        {
            id: 'chain-a',
            members: ['node-a', 'node-b'],
            stiffness: 0.7,
            damping: 0.1,
            blendMode: 'add',
        },
    ];
    left.document.simulation.springChainGroups = [
        { id: 'g1', chainIds: ['chain-z'], blendMode: 'replace', priority: 2 },
        { id: 'g0', chainIds: ['chain-a'], blendMode: 'add', priority: 1 },
    ];

    const right = createSnapshot(['node-a', 'node-b']);
    right.document.simulation.springChains = [
        {
            id: 'chain-a',
            members: ['node-a', 'node-b'],
            stiffness: 0.7,
            damping: 0.1,
            blendMode: 'add',
        },
        {
            id: 'chain-z',
            members: ['node-a', 'node-b'],
            stiffness: 1.3,
            damping: 0.2,
            blendMode: 'replace',
        },
    ];
    right.document.simulation.springChainGroups = [
        { id: 'g0', chainIds: ['chain-a'], blendMode: 'add', priority: 1 },
        { id: 'g1', chainIds: ['chain-z'], blendMode: 'replace', priority: 2 },
    ];

    const leftResult = evaluateSimulationFrame({
        document: left.document,
        runtime: left.runtime,
        previousSimulationState: null,
        time: 16,
        deltaTime: 16,
    });
    const rightResult = evaluateSimulationFrame({
        document: right.document,
        runtime: right.runtime,
        previousSimulationState: null,
        time: 16,
        deltaTime: 16,
    });

    assert.deepEqual(leftResult, rightResult);
    assert.equal(hashSimulationState(leftResult), hashSimulationState(rightResult));
});

test('invalid chain and group blend modes coerce deterministically to replace', () => {
    const snapshot = createSnapshot();
    snapshot.document.simulation.springChains = [
        {
            id: 'invalid-blend-chain',
            members: ['node-a', 'node-b'],
            stiffness: 1,
            damping: 0,
            blendMode: 'nonsense-mode',
        },
    ];
    snapshot.document.simulation.springChainGroups = [
        {
            id: 'invalid-group',
            chainIds: ['invalid-blend-chain'],
            blendMode: 'bad-group-mode',
            priority: 0,
        },
    ];

    const inputs = buildSimulationInputs({
        document: snapshot.document,
        runtime: snapshot.runtime,
        time: 16,
        deltaTime: 16,
    });

    assert.equal(inputs.springChains[0].blendMode, 'replace');
    assert.equal(inputs.springChainGroups[0].blendMode, 'replace');
});

test('partition-aware tick matches uninterrupted output when resumed from checkpoint', () => {
    const snapshot = createSnapshot(['node-b', 'node-a']);
    const simulationInputs = buildSimulationInputs({
        document: snapshot.document,
        runtime: snapshot.runtime,
        time: 16,
        deltaTime: 16,
    });
    const fullSchedule = buildSimulationPartitionSchedule({
        partitionIds: ['p0', 'p1'],
        tickTime: 16,
        deltaTime: 16,
    });
    const fullResult = simulationTick({
        simulationInputs,
        previousSimulationState: null,
        simulationPartitionSchedule: {
            ...fullSchedule,
            partitionBudget: fullSchedule.orderedPartitionIds.length,
        },
    });

    const firstPartialSchedule = buildSimulationPartitionSchedule({
        partitionIds: ['p0', 'p1'],
        tickTime: 16,
        deltaTime: 16,
    });
    const firstPartialResult = simulationTick({
        simulationInputs,
        previousSimulationState: null,
        simulationPartitionSchedule: {
            ...firstPartialSchedule,
            partitionBudget: 1,
        },
    });
    const resumedSchedule = buildSimulationPartitionSchedule({
        partitionIds: ['p0', 'p1'],
        tickTime: 16,
        deltaTime: 16,
        previousCheckpoint: createSimulationPartitionCheckpoint({
            ...firstPartialSchedule,
            partitionCursor: 1,
        }),
    });
    const resumedResult = simulationTick({
        simulationInputs,
        previousSimulationState: firstPartialResult,
        simulationPartitionSchedule: {
            ...resumedSchedule,
            partitionBudget: resumedSchedule.remainingPartitionIds.length,
        },
    });
    assert.equal(
        hashRuntimeState({
            tickTime: resumedResult.tickTime,
            deltaTime: resumedResult.deltaTime,
            entities: resumedResult.entities,
        }),
        hashRuntimeState({
            tickTime: fullResult.tickTime,
            deltaTime: fullResult.deltaTime,
            entities: fullResult.entities,
        }),
    );
    assert.ok(
        resumedResult.primitiveTrace.some((entry) => entry.type === 'partition.start') &&
            resumedResult.primitiveTrace.some((entry) => entry.type === 'partition.complete'),
    );
    assert.ok(
        fullResult.primitiveTrace.some((entry) => entry.type === 'partition.start') &&
            fullResult.primitiveTrace.some((entry) => entry.type === 'partition.complete'),
    );
});
