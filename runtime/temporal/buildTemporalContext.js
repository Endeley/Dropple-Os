import { evaluateSequence } from '@/runtime/sequencer/evaluation/evaluateSequence.js';
import { resolveShotForTime } from '@/runtime/scene/resolveShotForTime.js';

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

function resolveActiveSceneId(document, runtime) {
    return (
        runtime?.scene?.activeSceneId ??
        document?.scenes?.activeSceneId ??
        document?.sceneGraph?.activeSceneId ??
        null
    );
}

export function buildTemporalContext({ document, runtime, cursorIndex } = {}) {
    const sequenceMap = getSequenceMap(document);
    const sequenceId = resolveActiveSequenceId(document, runtime, sequenceMap);
    const { frame, timeMs } = resolveFrameAndTime(runtime, cursorIndex);
    const activeSceneId = resolveActiveSceneId(document, runtime);
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
        activeCamera: sequenceView?.activeCamera
            ? {
                  cameraNodeRef: sequenceView.activeCamera.cameraNodeRef ?? null,
                  clipId: sequenceView.activeCamera.clipId ?? null,
                  trackId: sequenceView.activeCamera.trackId ?? null,
              }
            : null,
    };
}
