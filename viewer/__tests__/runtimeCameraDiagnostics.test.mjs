import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
    buildRuntimeSnapshotFromArtifact,
    createEnvironmentArtifact,
    createSnapshotArtifact,
} from '@/runtime/export/exportArtifact.js';
import { buildEvaluationInputs } from '@/runtime/animation/buildEvaluationInputs.js';
import { resolveViewerRuntimeCamera } from '@/viewer/runtimeCameraDiagnostics.js';
import { publishTemplateFromWorkspace } from '@/templates/publishTemplateFromWorkspace.js';
import { activateTemplateEnvironment } from '@/runtime/templates/activateTemplateEnvironment.js';
import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import {
    buildInitialEnvironmentDescriptorFromQuery,
    resolveSeededWorkspace,
} from '@/app/workspace/new/workspaceEnvironmentBoot.js';
import { hashRuntimeState } from '@/core/persistence/hashDocument.js';
import { createDerivedEnvironmentDescriptor } from '@/domain/templates/DerivedEnvironmentDescriptor.js';

function withTempRegistry(run) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-viewer-environment-parity-'));
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    try {
        return run();
    } finally {
        process.chdir(originalCwd);
    }
}

function createEnvironmentSeedDocument() {
    return {
        sceneGraph: {
            rootIds: ['root'],
            nodes: {
                root: {
                    id: 'root',
                    type: 'frame',
                    children: ['headline'],
                },
                headline: {
                    id: 'headline',
                    type: 'text',
                    children: [],
                },
            },
        },
        motion: {
            clips: {
                'clip-headline-opacity': {
                    id: 'clip-headline-opacity',
                    target: 'headline',
                    property: 'opacity',
                    keyframes: [
                        { id: 'kf-0', t: 0, v: 0 },
                        { id: 'kf-500', t: 500, v: 0.7, easing: 'ease-in' },
                    ],
                },
            },
        },
    };
}

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

test('environment-backed viewer artifacts preserve canonical environment identity and playback truth from workspace boot', () =>
    withTempRegistry(() => {
        const publication = publishTemplateFromWorkspace({
            document: createEnvironmentSeedDocument(),
            metadata: {
                title: 'Viewer Environment Parity',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });

        const descriptor = buildInitialEnvironmentDescriptorFromQuery({
            lineageRootId: publication.seed.lineage.rootId,
            versionId: publication.seed.lineage.nodeId,
            workspaceId: 'design',
            modeId: 'graphic',
            overlayId: 'brand-systems',
        });
        const descriptorWithPlayback = createDerivedEnvironmentDescriptor({
            lineage: descriptor.lineage,
            environment: {
                ...descriptor.environment,
                runtimeConfig: {
                    playback: {
                        time: 240,
                        paused: true,
                    },
                },
            },
            metadata: descriptor.metadata,
        });
        const seeded = resolveSeededWorkspace({
            initialEnvironmentDescriptor: descriptorWithPlayback,
        });
        const artifact = createEnvironmentArtifact({
            descriptor: seeded.initialEnvironmentDescriptor,
            resolvedEnvironment: seeded.initialResolvedTemplateEnvironment,
        });
        const reconstructed = buildRuntimeSnapshotFromArtifact(artifact);
        const dispatcher = createEventDispatcher({ headless: true });
        const activated = activateTemplateEnvironment({
            descriptor: seeded.initialEnvironmentDescriptor,
            dispatcher,
        });
        const diagnostics = resolveViewerRuntimeCamera(artifact);

        assert.equal(
            seeded.initialEnvironmentDescriptor.environmentId,
            seeded.initialResolvedTemplateEnvironment.environmentId,
        );
        assert.equal(
            reconstructed.document?.meta?.id,
            seeded.initialEnvironmentDescriptor.environmentId,
        );
        assert.equal(
            activated.runtimeSnapshot.document?.meta?.id,
            seeded.initialEnvironmentDescriptor.environmentId,
        );
        assert.equal(reconstructed.playback?.time, 240);
        assert.equal(reconstructed.playback?.timeMs, 240);
        assert.equal(reconstructed.playback?.frame, 240);
        assert.equal(reconstructed.playback?.isPlaying, false);
        assert.equal(activated.runtimeSnapshot.playback?.time, 240);
        assert.equal(activated.runtimeSnapshot.playback?.timeMs, 240);
        assert.equal(activated.runtimeSnapshot.playback?.frame, 240);
        assert.equal(activated.runtimeSnapshot.playback?.isPlaying, false);
        assert.equal(
            hashRuntimeState(reconstructed),
            hashRuntimeState(activated.runtimeSnapshot),
        );
        assert.equal(diagnostics, null);
    }));
