import test from 'node:test';
import assert from 'node:assert/strict';

import { createExportExecution, runExportExecution, stepExportExecution } from '../exportSession.js';
import { getRenderExecutionRecord } from '../renderExecutionRegistry.js';
import {
    createRenderExecutionSnapshot,
    hydrateRenderExecutionSnapshot,
    RENDER_EXECUTION_STORE_VERSION,
} from '../renderExecutionSchema.js';
import {
    clearRenderExecutionStore,
    loadRenderExecutionSnapshot,
    persistRenderExecutionRegistry,
    restoreRenderExecutionRegistry,
} from '../renderExecutionStore.js';

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
    clearRenderExecutionStore();
});

test.afterEach(() => {
    clearRenderExecutionStore();
    delete globalThis.window;
});

test('render execution snapshot roundtrip preserves canonical lineage state', () => {
    let workflow = createExportExecution({
        snapshot: createWorkspace(),
    });
    workflow = stepExportExecution({
        snapshot: createWorkspace(),
        queueState: workflow.queueState,
        checkpoint: workflow.checkpoint,
        registryState: workflow.registryState,
    });
    workflow = runExportExecution({
        snapshot: createWorkspace(),
        queueState: workflow.queueState,
        checkpoint: workflow.checkpoint,
        registryState: workflow.registryState,
    });

    const snapshot = createRenderExecutionSnapshot({
        registryState: workflow.registryState,
        metadata: { source: 'test' },
    });
    const hydrated = hydrateRenderExecutionSnapshot(snapshot);
    const record = getRenderExecutionRecord(hydrated, workflow.manifest.manifestId);

    assert.equal(snapshot.version, RENDER_EXECUTION_STORE_VERSION);
    assert.equal(record?.status, 'completed');
    assert.equal(record?.history.length, 3);
});

test('render execution store persists and restores durable registry state', () => {
    let workflow = runExportExecution({
        snapshot: createWorkspace(),
    });

    const persisted = persistRenderExecutionRegistry(workflow.registryState, {
        source: 'render-store-test',
    });
    const loadedSnapshot = loadRenderExecutionSnapshot();
    const restored = restoreRenderExecutionRegistry();
    const record = getRenderExecutionRecord(restored, workflow.manifest.manifestId);

    assert.deepEqual(loadedSnapshot, persisted);
    assert.equal(record?.manifestId, workflow.manifest.manifestId);
    assert.equal(record?.sessionId, workflow.manifest.sessionId);
    assert.equal(record?.assignmentId, workflow.assignment.assignmentId);
    assert.equal(record?.checkpointId, workflow.checkpoint.checkpointId);
    assert.equal(record?.recordId, getRenderExecutionRecord(workflow.registryState, workflow.manifest.manifestId)?.recordId);
    assert.equal(record?.terminal, true);
    assert.equal(record?.history.at(-1)?.status, 'completed');
});

test('persisted and restored registry preserves canonical execution identity across resumed and uninterrupted runs', () => {
    let partial = createExportExecution({
        snapshot: createWorkspace(),
    });
    const midpoint = Math.floor(partial.manifest.totalFrames / 2);

    for (let index = 0; index < midpoint; index += 1) {
        partial = stepExportExecution({
            snapshot: createWorkspace(),
            queueState: partial.queueState,
            checkpoint: partial.checkpoint,
            registryState: partial.registryState,
        });
    }

    const resumed = runExportExecution({
        snapshot: createWorkspace(),
        queueState: partial.queueState,
        checkpoint: partial.checkpoint,
        registryState: partial.registryState,
    });
    const uninterrupted = runExportExecution({
        snapshot: createWorkspace(),
    });

    persistRenderExecutionRegistry(resumed.registryState, {
        source: 'render-store-provenance',
    });
    const restored = restoreRenderExecutionRegistry();
    const restoredRecord = getRenderExecutionRecord(restored, resumed.manifest.manifestId);
    const uninterruptedRecord = getRenderExecutionRecord(
        uninterrupted.registryState,
        uninterrupted.manifest.manifestId,
    );

    assert.equal(restoredRecord?.recordId, uninterruptedRecord?.recordId);
    assert.equal(restoredRecord?.manifestId, uninterruptedRecord?.manifestId);
    assert.equal(restoredRecord?.sessionId, uninterruptedRecord?.sessionId);
    assert.equal(restoredRecord?.assignmentId, uninterruptedRecord?.assignmentId);
    assert.equal(restoredRecord?.checkpointId, uninterruptedRecord?.checkpointId);
    assert.deepEqual(restoredRecord?.progress, uninterruptedRecord?.progress);
});
