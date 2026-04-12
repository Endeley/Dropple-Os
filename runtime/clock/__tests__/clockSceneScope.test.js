import test from 'node:test';
import assert from 'node:assert/strict';

import { seek } from '../clockController.js';
import { clock } from '../clock.js';
import { __resetRuntimeStateInternal, __setRuntimeStateInternal, initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';

function resetClock() {
    clock.time = 0;
    clock.delta = 0;
    clock.playing = false;
    clock.speed = 1;
    clock.lastTick = null;
}

function installRuntime(overrides) {
    const next = structuredClone(initialRuntimeState);
    const state = {
        ...next,
        ...overrides,
        document: {
            ...next.document,
            ...(overrides?.document ?? {}),
        },
        scene: {
            ...next.scene,
            ...(overrides?.scene ?? {}),
        },
    };
    __setRuntimeStateInternal(state, 'system');
}

test.afterEach(() => {
    __resetRuntimeStateInternal();
    resetClock();
    useRuntimeStore.setState(
        {
            frameTime: 0,
            evaluatedScene: { __evaluatedSchemaVersion: 1, children: [] },
            frameHash: null,
            shotId: null,
            shotTimeMs: null,
            evalStatus: 'NO_SHOT',
        },
        false,
    );
});

test('seek throws deterministically when strict scene scope is invalid', () => {
    installRuntime({
        document: {
            sceneGraph: {
                rootIds: ['fallback-root'],
                nodes: {
                    'fallback-root': { id: 'fallback-root', type: 'frame', children: [] },
                },
                activeSceneId: 'sceneA',
                activeShotId: 'shotA',
                scenes: [
                    {
                        id: 'sceneA',
                        shots: [{ id: 'shotA', start: 0, duration: 1000, compositionId: 'missing-root' }],
                    },
                ],
            },
        },
        scene: {
            activeSceneId: 'sceneA',
            activeShotId: 'shotA',
        },
    });

    assert.throws(
        () => seek(0),
        /extractActiveSceneTree: no valid composition root \(sceneA\)/,
    );
    assert.throws(
        () => seek(0),
        /extractActiveSceneTree: no valid composition root \(sceneA\)/,
    );
});

test('seek evaluates successfully when strict scene scope is valid', () => {
    installRuntime({
        document: {
            sceneGraph: {
                rootIds: ['fallback-root'],
                nodes: {
                    'fallback-root': { id: 'fallback-root', type: 'frame', children: [] },
                    compA: { id: 'compA', type: 'frame', children: ['childA'] },
                    childA: { id: 'childA', type: 'rect', children: [] },
                },
                activeSceneId: 'sceneA',
                activeShotId: 'shotA',
                scenes: [
                    {
                        id: 'sceneA',
                        shots: [{ id: 'shotA', start: 0, duration: 1000, compositionId: 'compA' }],
                    },
                ],
            },
        },
        scene: {
            activeSceneId: 'sceneA',
            activeShotId: 'shotA',
        },
    });

    assert.doesNotThrow(() => seek(0));

    const frameState = useRuntimeStore.getState();
    assert.equal(frameState.evalStatus, 'OK');
    assert.equal(frameState.shotId, 'shotA');
});

test('seek composes crossfade transitions deterministically', () => {
    installRuntime({
        document: {
            sceneGraph: {
                rootIds: ['fallback-root'],
                nodes: {
                    'fallback-root': { id: 'fallback-root', type: 'frame', children: [] },
                    compA: { id: 'compA', type: 'frame', x: 0, opacity: 1, children: [] },
                    compB: { id: 'compB', type: 'frame', x: 100, opacity: 0.2, children: [] },
                },
                activeSceneId: 'sceneA',
                activeShotId: 'shotA',
                scenes: [
                    {
                        id: 'sceneA',
                        shots: [
                            {
                                id: 'shotA',
                                start: 0,
                                duration: 1000,
                                compositionId: 'compA',
                                transitionOut: { type: 'crossfade', durationMs: 200 },
                            },
                            {
                                id: 'shotB',
                                start: 1000,
                                duration: 1000,
                                compositionId: 'compB',
                            },
                        ],
                    },
                ],
            },
        },
        scene: {
            activeSceneId: 'sceneA',
            activeShotId: 'shotA',
        },
    });

    seek(900);
    const left = structuredClone(useRuntimeStore.getState().evaluatedScene);
    seek(900);
    const right = structuredClone(useRuntimeStore.getState().evaluatedScene);

    assert.deepEqual(left, right);
    assert.equal(useRuntimeStore.getState().shotId, 'shotA');
});
