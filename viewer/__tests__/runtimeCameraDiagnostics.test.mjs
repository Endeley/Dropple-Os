import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createSnapshotArtifact,
} from '@/runtime/export/exportArtifact.js';
import { buildEvaluationInputs } from '@/runtime/animation/buildEvaluationInputs.js';
import { resolveViewerRuntimeCamera } from '@/viewer/runtimeCameraDiagnostics.js';

function createTransitionRuntimeSnapshot() {
    return {
        document: {
            sceneGraph: {
                activeSceneId: 'scene-1',
                rootIds: ['fallback-root', 'comp-a', 'comp-b'],
                nodes: {
                    'fallback-root': { id: 'fallback-root', type: 'frame', children: [] },
                    'comp-a': {
                        id: 'comp-a',
                        type: 'frame',
                        children: [],
                        props: {
                            transform: { x: 0, y: 0, scale: 1, rotation: 0 },
                        },
                    },
                    'comp-b': {
                        id: 'comp-b',
                        type: 'frame',
                        children: [],
                        props: {
                            transform: { x: 0, y: 0, scale: 1, rotation: 0 },
                        },
                    },
                },
                scenes: [
                    {
                        id: 'scene-1',
                        shots: [
                            {
                                id: 'shot-a',
                                start: 0,
                                duration: 1000,
                                compositionId: 'comp-a',
                                transitionOut: { type: 'crossfade', durationMs: 200 },
                                camera: {
                                    keyframes: [{ time: 0, x: 320, y: 180, zoom: 1.25, rotation: 12 }],
                                },
                            },
                            {
                                id: 'shot-b',
                                start: 1000,
                                duration: 1000,
                                compositionId: 'comp-b',
                                camera: {
                                    keyframes: [{ time: 0, x: 640, y: 360, zoom: 2, rotation: 24 }],
                                },
                            },
                        ],
                    },
                ],
            },
            sequences: {
                activeSequenceId: null,
                sequences: {},
            },
        },
        playback: {
            timeMs: 900,
        },
        scene: {
            activeSceneId: 'scene-1',
            activeShotId: 'shot-a',
            computed: {},
            transformDirty: new Set(),
            layoutDirty: new Set(),
            paintDirty: new Set(),
            indexDirty: new Set(),
            layoutRoots: new Map(),
            dependencyGraph: null,
            spatialIndex: null,
        },
        timeline: {
            timelines: {
                default: { tracks: [], duration: 0, events: [] },
            },
        },
    };
}

test('resolveViewerRuntimeCamera exposes blended runtime camera diagnostics deterministically', () => {
    const artifact = createSnapshotArtifact({
        snapshot: createTransitionRuntimeSnapshot(),
    });

    const left = resolveViewerRuntimeCamera(artifact);
    const right = resolveViewerRuntimeCamera(artifact);

    assert.deepEqual(left, right);
    assert.equal(left.resolvedFrom, 'transition-crossfade');
    assert.equal(left.transition?.active, true);
    assert.equal(left.transition?.fromShotId, 'shot-a');
    assert.equal(left.transition?.toShotId, 'shot-b');
    assert.equal(left.transition?.progress, 0.5);
    assert.equal(left.transform.x, 480);
    assert.equal(left.transform.y, 270);
    assert.equal(left.transform.zoom, 1.625);
    assert.equal(left.transform.rotation, 18);
});

test('resolveViewerRuntimeCamera matches export evaluation camera truth during transition windows', () => {
    const snapshot = createTransitionRuntimeSnapshot();
    const artifact = createSnapshotArtifact({ snapshot });

    const diagnostics = resolveViewerRuntimeCamera(artifact);
    const inputs = buildEvaluationInputs(snapshot, {
        timeMs: 900,
        strictSceneScope: true,
    });

    assert.equal(inputs.cameraTransform.source, diagnostics.source);
    assert.equal(inputs.cameraTransform.resolvedFrom, diagnostics.resolvedFrom);
    assert.equal(inputs.cameraTransform.timeMs, diagnostics.timeMs);
    assert.deepEqual(inputs.cameraTransform, {
        x: diagnostics.transform.x,
        y: diagnostics.transform.y,
        zoom: diagnostics.transform.zoom,
        rotation: diagnostics.transform.rotation,
        nodeRef: diagnostics.nodeRef,
        clipId: diagnostics.clipId,
        trackId: diagnostics.trackId,
        sequenceId: diagnostics.sequenceId,
        shotId: diagnostics.shotId,
        timeMs: diagnostics.timeMs,
        resolvedFrom: diagnostics.resolvedFrom,
        source: diagnostics.source,
    });
});
