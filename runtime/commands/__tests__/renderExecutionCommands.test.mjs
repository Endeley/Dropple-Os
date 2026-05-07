import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createExportExecutionCommand,
    createRenderExecutionCommandState,
    performExportExecutionCommand,
    persistRenderExecutionCommandState,
    restoreRenderExecutionCommandState,
    runExportExecutionCommand,
    stepExportExecutionCommand,
} from '../renderExecutionCommands.js';

function createWorkspace() {
    return {
        document: {
            sceneGraph: {
                rootIds: ['fallback-root'],
                nodes: {
                    'fallback-root': { id: 'fallback-root', type: 'frame', children: [] },
                    compA: { id: 'compA', type: 'frame', x: 0, opacity: 1, children: [] },
                    compB: { id: 'compB', type: 'frame', x: 100, opacity: 0.2, children: [] },
                },
                activeSceneId: 'sceneA',
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
            sequences: {
                activeSequenceId: 'seqA',
                sequences: {
                    seqA: {
                        id: 'seqA',
                        frameRate: 24,
                        tracks: {},
                    },
                },
            },
            exports: {
                targets: [{ type: 'mp4' }],
            },
        },
        scene: {
            activeSceneId: 'sceneA',
            activeShotId: 'shotA',
        },
        timeline: {
            timelines: {
                default: { tracks: [], duration: 0, events: [] },
            },
        },
        nodes: [],
    };
}

function installWindowLocalStorage() {
    const store = new Map();
    globalThis.window = {
        localStorage: {
            getItem(key) {
                return store.has(key) ? store.get(key) : null;
            },
            setItem(key, value) {
                store.set(key, String(value));
            },
            removeItem(key) {
                store.delete(key);
            },
        },
    };
}

test.beforeEach(() => {
    installWindowLocalStorage();
});

test.afterEach(() => {
    delete globalThis.window;
});

test('render execution commands expose canonical workflow boundary for create/run/perform', () => {
    const initial = createRenderExecutionCommandState();
    const created = createExportExecutionCommand({
        snapshot: createWorkspace(),
        state: initial,
    });
    const run = runExportExecutionCommand({
        snapshot: createWorkspace(),
        state: created.state,
    });
    const performed = performExportExecutionCommand({
        state: run.state,
    });

    assert.equal(created.result.assignment.mode, 'create');
    assert.equal(run.result.queueEntry?.status, 'completed');
    assert.equal(performed.output.media.exports.targets[0].type, 'mp4');
    assert.equal(run.result.executionRecord?.status, 'completed');
});

test('stepExportExecutionCommand resumes deterministically from command state', () => {
    let state = createRenderExecutionCommandState();
    state = createExportExecutionCommand({
        snapshot: createWorkspace(),
        state,
    }).state;

    const midpoint = Math.floor(state.workflow.manifest.totalFrames / 2);
    for (let index = 0; index < midpoint; index += 1) {
        state = stepExportExecutionCommand({
            snapshot: createWorkspace(),
            state,
        }).state;
    }

    const resumed = runExportExecutionCommand({
        snapshot: createWorkspace(),
        state,
    });
    const fresh = runExportExecutionCommand({
        snapshot: createWorkspace(),
        state: createRenderExecutionCommandState(),
    });

    assert.deepEqual(resumed.result.checkpoint, fresh.result.checkpoint);
    assert.equal(resumed.result.executionRecord?.status, 'completed');
    assert.equal(fresh.result.executionRecord?.status, 'completed');
    assert.equal(resumed.result.executionRecord?.terminal, true);
    assert.equal(fresh.result.executionRecord?.terminal, true);
    assert.deepEqual(resumed.result.executionRecord?.progress, fresh.result.executionRecord?.progress);
    assert.ok((resumed.result.executionRecord?.history.length ?? 0) >= (fresh.result.executionRecord?.history.length ?? 0));
});

test('render execution command state can be persisted and restored', () => {
    const run = runExportExecutionCommand({
        snapshot: createWorkspace(),
        state: createRenderExecutionCommandState(),
    });
    const persisted = persistRenderExecutionCommandState({
        state: run.state,
        metadata: { source: 'command-test' },
    });
    const restored = restoreRenderExecutionCommandState();

    assert.equal(persisted.metadata.source, 'command-test');
    assert.equal(restored.registryState.records.length, 1);
    assert.equal(restored.registryState.records[0].status, 'completed');
});
