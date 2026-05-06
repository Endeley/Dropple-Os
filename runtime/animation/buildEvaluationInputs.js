import { getSceneGraph } from '../document/documentAdapter.js';
import { extractActiveSceneTree } from '../scene/extractActiveSceneTree.js';
import { getCanonicalShotTrack } from '@/core/scene/shotTracks.js';
import {
    assertSceneGraphInvariants,
    resolveCanonicalSceneSelection,
} from '@/core/scene/sceneGraphInvariants.js';
import { buildTemporalContext } from '@/runtime/temporal/buildTemporalContext.js';

function buildShotTimeline(sceneGraph, activeSceneId) {
    if (!sceneGraph || !Array.isArray(sceneGraph.scenes)) {
        return { shots: [] };
    }

    const scene = sceneGraph.scenes.find((item) => item.id === activeSceneId) ?? null;
    const shotsInTrack = getCanonicalShotTrack(scene)?.shots ?? [];
    if (!scene || shotsInTrack.length === 0) {
        return { shots: [] };
    }

    const shots = shotsInTrack.map((shot) => {
        const startMs = Number.isFinite(shot.start) ? shot.start : 0;
        const durationMs = Number.isFinite(shot.duration) ? shot.duration : 0;
        const endMs = startMs + durationMs;

        let cameraTransform = null;
        if (shot.camera?.keyframes?.length) {
            const frames = shot.camera.keyframes;
            cameraTransform = {
                x: {
                    keyframes: frames.map((frame) => ({
                        t: frame.time,
                        v: frame.x,
                    })),
                },
                y: {
                    keyframes: frames.map((frame) => ({
                        t: frame.time,
                        v: frame.y,
                    })),
                },
            };
        }

        return {
            id: shot.id,
            startMs,
            endMs,
            cameraTransform,
            transitionOut: shot?.transitionOut ?? null,
            timeOffsetMs: Number.isFinite(shot.timeOffsetMs) ? shot.timeOffsetMs : undefined,
        };
    });

    return { shots };
}

function buildRuntimeCameraTransform(camera) {
    if (!camera?.transform) return null;

    return {
        x: Number(camera.transform.x ?? 0),
        y: Number(camera.transform.y ?? 0),
        zoom: Number(camera.transform.zoom ?? 1),
        rotation: Number(camera.transform.rotation ?? 0),
        nodeRef: camera.nodeRef ?? null,
        clipId: camera.clipId ?? null,
        trackId: camera.trackId ?? null,
        sequenceId: camera.sequenceId ?? null,
        shotId: camera.shotId ?? null,
        timeMs: camera.timeMs ?? null,
        resolvedFrom: camera.resolvedFrom ?? null,
        source: camera.source ?? null,
    };
}

export function buildEvaluationInputs(runtimeState, { timeMs = 0, strictSceneScope = false } = {}) {
    const sceneGraph = getSceneGraph(runtimeState);
    const selection = resolveCanonicalSceneSelection({
        sceneGraph,
        preferredSceneId: runtimeState?.scene?.activeSceneId ?? null,
        preferredShotId: runtimeState?.scene?.activeShotId ?? null,
    });
    const activeSceneId = selection.activeSceneId;
    const activeShotId = selection.activeShotId;

    assertSceneGraphInvariants({
        sceneGraph,
        compositions: runtimeState?.document?.compositions ?? null,
        activeSceneId,
        activeShotId,
        requireActiveShot: false,
    });

    const sceneGraphTree = extractActiveSceneTree(sceneGraph, activeSceneId, activeShotId, {
        strict: strictSceneScope,
    });
    const shotTimeline = buildShotTimeline(sceneGraph, activeSceneId);
    const temporalContext = buildTemporalContext({
        document: runtimeState?.document ?? null,
        runtime: {
            ...runtimeState,
            playback: {
                ...(runtimeState?.playback ?? {}),
                frame: null,
                time: null,
                timeMs,
            },
        },
        cursorIndex: null,
    });
    const camera = temporalContext?.camera ?? null;
    const cameraTransform = buildRuntimeCameraTransform(temporalContext?.camera ?? null);
    const renderInput = {
        sceneGraph,
        sceneGraphTree,
        activeSceneId,
        shotTimeline,
        activeShotId,
        temporalContext,
        camera,
        frameRate: Number(temporalContext?.frameRate ?? 24),
        timeMs,
        strictSceneScope,
    };

    return {
        renderInput,
        sceneGraph,
        sceneGraphTree,
        activeSceneId,
        shotTimeline,
        activeShotId,
        temporalContext,
        camera,
        frameRate: Number(temporalContext?.frameRate ?? 24),
        cameraTransform,
        timeMs,
        strictSceneScope,
    };
}
