import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateSimulationFrame } from '@/runtime/simulation/evaluateSimulationFrame.js';
import { buildSimulationInputs } from '@/runtime/simulation/buildSimulationInputs.js';
import { hashSimulationState } from '@/runtime/simulation/simulationStateHash.js';
import { recordSimulationTrace } from '@/runtime/simulation/simulationTrace.js';
import { hashRuntimeState } from '@/core/persistence/hashDocument.js';

function createSnapshot() {
    return {
        document: {
            sceneGraph: {
                nodes: {
                    a: { id: 'a', type: 'frame', layout: { x: 0, y: 0 } },
                    b: { id: 'b', type: 'frame', layout: { x: 10, y: 5 } },
                },
            },
            simulation: {
                dampingProfiles: {
                    base: { dampingMultiplier: 1, springMultiplier: 1 },
                },
                entityProfiles: {
                    a: 'base',
                    b: 'base',
                },
                springChains: [
                    { id: 'c1', members: ['a', 'b'], stiffness: 1, damping: 0.2, blendMode: 'add' },
                ],
                springChainGroups: [
                    { id: 'g1', chainIds: ['c1'], blendMode: 'add', priority: 0 },
                ],
            },
        },
        runtime: {
            scene: {
                computed: {
                    a: { x: 100, y: 20 },
                    b: { x: 40, y: -50 },
                },
            },
        },
    };
}

function runTrace({ ticks = 8, resumeAt = null } = {}) {
    const snapshot = createSnapshot();
    let state = null;
    let trace = null;
    let paused = null;

    for (let index = 0; index < ticks; index += 1) {
        const time = (index + 1) * 16;
        const deltaTime = 16;
        const simulationInputs = buildSimulationInputs({
            document: snapshot.document,
            runtime: snapshot.runtime,
            time,
            deltaTime,
        });
        state = evaluateSimulationFrame({
            document: snapshot.document,
            runtime: snapshot.runtime,
            previousSimulationState: state,
            time,
            deltaTime,
        });
        trace = recordSimulationTrace({
            previousTrace: trace,
            simulationState: state,
            simulationHash: hashSimulationState(state),
            simulationInputs,
        });

        if (resumeAt != null && index === resumeAt) {
            paused = {
                state: structuredClone(state),
                trace: structuredClone(trace),
            };
        }
    }

    return {
        state,
        trace,
        paused,
    };
}

test('replay of identical simulation ticks yields identical trace hash sequence', () => {
    const left = runTrace({ ticks: 10 }).trace.entries.map((entry) => entry.simulationHash);
    const right = runTrace({ ticks: 10 }).trace.entries.map((entry) => entry.simulationHash);
    assert.deepEqual(left, right);
});

test('resume from checkpoint matches uninterrupted trace hash sequence', () => {
    const uninterrupted = runTrace({ ticks: 10 });
    const checkpointRun = runTrace({ ticks: 10, resumeAt: 4 });

    const snapshot = createSnapshot();
    let resumedState = checkpointRun.paused.state;
    let resumedTrace = checkpointRun.paused.trace;
    for (let index = 5; index < 10; index += 1) {
        const time = (index + 1) * 16;
        const deltaTime = 16;
        const simulationInputs = buildSimulationInputs({
            document: snapshot.document,
            runtime: snapshot.runtime,
            time,
            deltaTime,
        });
        resumedState = evaluateSimulationFrame({
            document: snapshot.document,
            runtime: snapshot.runtime,
            previousSimulationState: resumedState,
            time,
            deltaTime,
        });
        resumedTrace = recordSimulationTrace({
            previousTrace: resumedTrace,
            simulationState: resumedState,
            simulationHash: hashSimulationState(resumedState),
            simulationInputs,
        });
    }

    assert.deepEqual(
        resumedTrace.entries.map((entry) => entry.simulationHash),
        uninterrupted.trace.entries.map((entry) => entry.simulationHash),
    );
    assert.equal(hashRuntimeState(resumedTrace), hashRuntimeState(uninterrupted.trace));
});

test('trace recording is coordination-only and does not mutate simulation truth', () => {
    const snapshot = createSnapshot();
    const state = evaluateSimulationFrame({
        document: snapshot.document,
        runtime: snapshot.runtime,
        previousSimulationState: null,
        time: 16,
        deltaTime: 16,
    });
    const stateBefore = structuredClone(state);
    const simulationInputs = buildSimulationInputs({
        document: snapshot.document,
        runtime: snapshot.runtime,
        time: 16,
        deltaTime: 16,
    });

    recordSimulationTrace({
        previousTrace: null,
        simulationState: state,
        simulationHash: hashSimulationState(state),
        simulationInputs,
    });

    assert.deepEqual(state, stateBefore);
});

test('primitive simulation trace sequence and fingerprint are deterministic across repeated runs', () => {
    const left = runTrace({ ticks: 6 }).trace;
    const right = runTrace({ ticks: 6 }).trace;

    const leftPrimitive = left.entries.map((entry) => entry.primitiveTrace);
    const rightPrimitive = right.entries.map((entry) => entry.primitiveTrace);

    assert.ok(left.entries.every((entry) => Array.isArray(entry.primitiveTrace) && entry.primitiveTrace.length > 0));
    assert.deepEqual(leftPrimitive, rightPrimitive);
    assert.equal(hashRuntimeState(left), hashRuntimeState(right));
});

test('spring-chain constraints always emit primitive trace lineage entries', () => {
    const trace = runTrace({ ticks: 3 }).trace;
    const constraintEvents = trace.entries.flatMap((entry) =>
        (entry.primitiveTrace ?? []).filter((primitive) =>
            String(primitive?.type).startsWith('constraint.spring-chain'),
        ),
    );

    assert.ok(constraintEvents.length > 0);
});
