import { evaluateSequence } from '@/runtime/sequencer/evaluation/evaluateSequence.js';
import { resolveShotForTime } from '@/runtime/scene/resolveShotForTime.js';
import { getCameraTransformAtTime } from '@/core/scene/cameraPlayback.v1.js';

function getSequenceMap(document) {
    const sequences = document?.sequences?.sequences;
    if (sequences && typeof sequences === 'object' && !Array.isArray(sequences)) {
        return sequences;
    }

    if (Array.isArray(document?.sequences)) {
        return Object.fromEntries(
            document.sequences
                .filter(Boolean)
                .map((sequence) => [sequence.id, sequence])
                .filter(([id]) => Boolean(id))
        );
    }

    return {};
}

function resolveActiveSequenceId(document, runtime, sequenceMap) {
    const runtimeSequenceId = runtime?.playback?.sequenceId ?? null;
    if (runtimeSequenceId && sequenceMap[runtimeSequenceId]) {
        return runtimeSequenceId;
    }

    const documentSequenceId = document?.sequences?.activeSequenceId ?? null;
    if (documentSequenceId && sequenceMap[documentSequenceId]) {
        return documentSequenceId;
    }

    const ids = Object.keys(sequenceMap).sort();
    return ids.length === 1 ? ids[0] : null;
}

function resolveFrameAndTime(runtime, cursorIndex) {
    const playback = runtime?.playback ?? {};
    const frame = Number.isFinite(playback?.frame)
        ? Number(playback.frame)
        : Number.isFinite(playback?.time)
          ? Number(playback.time)
          : Number.isFinite(cursorIndex)
            ? Number(cursorIndex)
            : 0;

    const timeMs = Number.isFinite(playback?.timeMs)
        ? Number(playback.timeMs)
        : frame;

    return { frame, timeMs };
}

function resolveRuntimeActiveSceneId(runtime) {
    return runtime?.scene?.activeSceneId ?? null;
}

function resolveSequenceCameraTransform(document, activeCamera) {
    const cameraNodeRef = activeCamera?.cameraNodeRef ?? null;
    if (!cameraNodeRef) return null;

    const node = document?.sceneGraph?.nodes?.[cameraNodeRef] ?? null;
    const transform = node?.props?.transform ?? {};

    return {
        source: 'sequence',
        nodeRef: cameraNodeRef,
        clipId: activeCamera?.clipId ?? null,
        trackId: activeCamera?.trackId ?? null,
        transform: {
            x: Number(transform.x ?? 0),
            y: Number(transform.y ?? 0),
            zoom: Number(transform.scale ?? transform.zoom ?? 1),
            rotation: Number(transform.rotation ?? 0),
        },
    };
}

function resolveShotCamera(activeShot) {
    const cameraTrack = activeShot?.shot?.camera ?? null;
    if (!cameraTrack) return null;

    const transform = getCameraTransformAtTime(
        cameraTrack,
        Number(activeShot?.localTime ?? 0),
    );
    if (!transform) return null;

    return {
        source: 'shot',
        shotId: activeShot?.shotId ?? null,
        track: cameraTrack,
        transform,
    };
}

export function buildTemporalContext({ document, runtime, cursorIndex } = {}) {
    const sequenceMap = getSequenceMap(document);
    const sequenceId = resolveActiveSequenceId(document, runtime, sequenceMap);
    const { frame, timeMs } = resolveFrameAndTime(runtime, cursorIndex);
    const activeSceneId = resolveRuntimeActiveSceneId(runtime);
    const sceneGraph = document?.sceneGraph ?? null;

    const sequence = sequenceId ? sequenceMap[sequenceId] ?? null : null;
    const sequenceView = sequence
        ? evaluateSequence({
              sequence,
              frame,
              timeMs,
          })
        : null;
    const resolvedTimeMs = Number(sequenceView?.timeMs ?? timeMs);
    const activeShot = resolveShotForTime({
        sceneGraph,
        activeSceneId,
        globalTime: resolvedTimeMs,
    });
    const activeCamera = sequenceView?.activeCamera
        ? {
              cameraNodeRef: sequenceView.activeCamera.cameraNodeRef ?? null,
              clipId: sequenceView.activeCamera.clipId ?? null,
              trackId: sequenceView.activeCamera.trackId ?? null,
          }
        : null;
    const camera = resolveShotCamera(activeShot) ?? resolveSequenceCameraTransform(document, activeCamera);

    return {
        sequenceId,
        frame: Number(sequenceView?.frame ?? frame),
        timeMs: resolvedTimeMs,
        activeClips: Array.isArray(sequenceView?.activeClips) ? sequenceView.activeClips : [],
        activeShot: activeShot
            ? {
                  shotId: activeShot.shotId ?? null,
                  sceneId: activeSceneId,
                  localTime: Number(activeShot.localTime ?? 0),
              }
            : null,
        activeCamera,
        camera,
    };
}
