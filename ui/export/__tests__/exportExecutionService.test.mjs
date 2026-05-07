import test from 'node:test';
import assert from 'node:assert/strict';

import { createExportExecutionService } from '../exportExecutionService.js';

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

test('export execution service exposes stable app-facing workflow lifecycle', async () => {
    const service = createExportExecutionService();

    const created = await service.createWorkflow({
        snapshot: createWorkspace(),
    });
    const run = await service.runWorkflow({
        snapshot: createWorkspace(),
    });
    const performed = await service.performWorkflow();

    assert.equal(created.assignment.mode, 'create');
    assert.equal(run.queueEntry?.status, 'completed');
    assert.equal(performed.output.media.exports.targets[0].type, 'mp4');
    assert.equal(service.getState().workflow?.manifest.manifestId, run.manifest.manifestId);
});

test('export execution service persists and restores command-backed state', async () => {
    const service = createExportExecutionService();
    await service.runWorkflow({
        snapshot: createWorkspace(),
    });

    const persisted = await service.persist({ source: 'service-test' });
    service.reset();
    const restored = await service.restore();

    assert.equal(persisted.metadata.source, 'service-test');
    assert.equal(restored.registryState.records.length, 1);
    assert.equal(restored.registryState.records[0].status, 'completed');
});
