import { evaluateSequenceAtTime } from '../sequencer/evaluation/evaluateSequenceAtTime.js';
import { getNode, getSceneGraph } from '../document/documentAdapter.js';
import { extractActiveSceneTree } from '../scene/extractActiveSceneTree.js';
import { getCanonicalShotTrack } from '@/core/scene/shotTracks.js';
import {
    assertSceneGraphInvariants,
    resolveCanonicalSceneSelection,
} from '@/core/scene/sceneGraphInvariants.js';

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

function buildSequenceCameraTransform(runtimeState, timeMs) {
    const sequenceView = evaluateSequenceAtTime({
        document: runtimeState?.document,
        timeMs,
    });
    const cameraNodeRef = sequenceView?.activeCamera?.cameraNodeRef ?? null;
    if (!cameraNodeRef) return null;

    const node = getNode(runtimeState, cameraNodeRef);
    const transform = node?.props?.transform ?? {};

    return {
        x: Number(transform.x ?? 0),
        y: Number(transform.y ?? 0),
        zoom: Number(transform.scale ?? transform.zoom ?? 1),
        rotation: Number(transform.rotation ?? 0),
        nodeRef: cameraNodeRef,
        clipId: sequenceView?.activeCamera?.clipId ?? null,
        sequenceId: sequenceView?.sequenceId ?? null,
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
    const cameraTransform = buildSequenceCameraTransform(runtimeState, timeMs);

    return {
        sceneGraphTree,
        activeSceneId,
        shotTimeline,
        activeShotId,
        cameraTransform,
    };
}
