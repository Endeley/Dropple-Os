import test from 'node:test';
import assert from 'node:assert/strict';

import { buildEvaluationInputs } from '../buildEvaluationInputs.js';
import { runAnimationPreview } from '../runAnimationPreview.js';
import { useAnimatedRuntimeStore } from '../../stores/useAnimatedRuntimeStore.js';
import { useRuntimeStore } from '../../stores/useRuntimeStore.js';
import { evaluateTransitionFrame } from '../../transition/evaluateTransitionFrame.js';
import { createSnapshotArtifact } from '../../export/exportArtifact.js';
import { hashExportOutput } from '../../export/exportFingerprint.js';
import { resolveViewerRuntimeCamera } from '../../../viewer/runtimeCameraDiagnostics.js';
import { createEventDispatcher } from '../../dispatcher/dispatch.js';
import { seek, pause } from '../../clock/clockController.js';
import { clock } from '../../clock/clock.js';

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
            motion: {
                clips: {},
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

function resetDerivedStores() {
    useAnimatedRuntimeStore.setState({ previewNodes: {}, cameraTransform: null }, false);
    useRuntimeStore.setState(
        {
            frameTime: 0,
            evaluatedScene: null,
            frameHash: null,
            shotId: null,
            shotTimeMs: null,
            evalStatus: 'NO_SHOT',
        },
        false,
    );
    pause();
    clock.time = 0;
    clock.delta = 0;
    clock.lastTick = null;
}

test('transition-window preview camera matches export-time render input camera', () => {
    const snapshot = createTransitionRuntimeSnapshot();
    const dispatcher = createEventDispatcher();
    resetDerivedStores();
    dispatcher.hydrateRuntimeState(snapshot, { animate: false });

    runAnimationPreview({
        designState: snapshot,
        timeMs: 900,
    });

    const animated = useAnimatedRuntimeStore.getState();
    const inputs = buildEvaluationInputs(snapshot, { timeMs: 900, strictSceneScope: true });

    assert.deepEqual(animated.cameraTransform, {
        x: inputs.cameraTransform.x,
        y: inputs.cameraTransform.y,
        zoom: inputs.cameraTransform.zoom,
        rotation: inputs.cameraTransform.rotation,
    });
    assert.equal(inputs.renderInput.camera.transition?.active, true);
    assert.equal(inputs.renderInput.camera.transition?.progress, 0.5);
});

test('transition-window clock playback matches export-time transition evaluation', () => {
    const snapshot = createTransitionRuntimeSnapshot();
    const dispatcher = createEventDispatcher();
    resetDerivedStores();

    dispatcher.hydrateRuntimeState(snapshot, { animate: false });

    seek(900);

    const inputs = buildEvaluationInputs(snapshot, { timeMs: 900, strictSceneScope: true });
    const exportLike = evaluateTransitionFrame({
        renderInput: {
            ...inputs.renderInput,
            timeMs: 900,
        },
        timeMs: 900,
    });
    const runtimeFrame = useRuntimeStore.getState();

    assert.deepEqual(runtimeFrame.evaluatedScene, exportLike.evaluatedScene);
    assert.equal(runtimeFrame.shotId, exportLike.shotId);
    assert.equal(runtimeFrame.shotTimeMs, exportLike.shotTimeMs);
    assert.equal(runtimeFrame.evalStatus, exportLike.ok ? 'OK' : 'NO_SHOT');
});

test('transition-window viewer diagnostics match canonical render input camera metadata', () => {
    const snapshot = createTransitionRuntimeSnapshot();
    const artifact = createSnapshotArtifact({ snapshot });

    const diagnostics = resolveViewerRuntimeCamera(artifact);
    const inputs = buildEvaluationInputs(snapshot, { timeMs: 900, strictSceneScope: true });

    assert.equal(diagnostics.source, inputs.renderInput.camera.source);
    assert.equal(diagnostics.resolvedFrom, inputs.renderInput.camera.resolvedFrom);
    assert.equal(diagnostics.transition?.active, inputs.renderInput.camera.transition?.active);
    assert.equal(diagnostics.transition?.progress, inputs.renderInput.camera.transition?.progress);
    assert.equal(diagnostics.transition?.fromShotId, inputs.renderInput.camera.transition?.fromShotId);
    assert.equal(diagnostics.transition?.toShotId, inputs.renderInput.camera.transition?.toShotId);
    assert.deepEqual(diagnostics.transform, inputs.renderInput.camera.transform);
});

test('transition-window render input hash stays stable at the same cursor', async () => {
    const snapshot = createTransitionRuntimeSnapshot();

    const left = buildEvaluationInputs(snapshot, { timeMs: 900, strictSceneScope: true });
    const right = buildEvaluationInputs(snapshot, { timeMs: 900, strictSceneScope: true });

    const leftHash = await hashExportOutput(left.renderInput);
    const rightHash = await hashExportOutput(right.renderInput);

    assert.equal(leftHash, rightHash);
});

test('transition-window render input hash evolution is deterministic across ordered samples', async () => {
    const snapshot = createTransitionRuntimeSnapshot();
    const sampleTimes = [799, 800, 900, 1000, 1001];

    const left = [];
    for (const timeMs of sampleTimes) {
        const inputs = buildEvaluationInputs(snapshot, { timeMs, strictSceneScope: true });
        left.push(await hashExportOutput(inputs.renderInput));
    }

    const right = [];
    for (const timeMs of sampleTimes) {
        const inputs = buildEvaluationInputs(snapshot, { timeMs, strictSceneScope: true });
        right.push(await hashExportOutput(inputs.renderInput));
    }

    assert.deepEqual(left, right);
    assert.notEqual(left[0], left[1]);
    assert.notEqual(left[1], left[2]);
    assert.notEqual(left[2], left[3]);
    assert.notEqual(left[3], left[4]);
});
