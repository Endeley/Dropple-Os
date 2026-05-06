import { evaluateSequence } from '@/runtime/sequencer/evaluation/evaluateSequence.js';
import { resolveShotForTime } from '@/runtime/scene/resolveShotForTime.js';
import { getCameraTransformAtTime } from '@/core/scene/cameraPlayback.v1.js';
import { getCanonicalShotTrack } from '@/core/scene/shotTracks.js';
import {
    assertSceneGraphInvariants,
    resolveCanonicalSceneSelection,
} from '@/core/scene/sceneGraphInvariants.js';
import { resolveSceneTransitionWindow } from '@/runtime/transition/resolveSceneTransitionWindow.js';
import { assertCameraTransitionAuthority } from '@/runtime/transition/assertCameraTransitionGovernance.js';

function normalizeCameraTransform(transform = {}) {
    return {
        x: Number(transform.x ?? 0),
        y: Number(transform.y ?? 0),
        zoom: Number(transform.zoom ?? transform.scale ?? 1),
        rotation: Number(transform.rotation ?? 0),
    };
}

function blendNumber(a, b, t) {
    return Number(a ?? 0) + (Number(b ?? 0) - Number(a ?? 0)) * Number(t ?? 0);
}

function blendCameraTransforms(fromTransform, toTransform, t) {
    if (!fromTransform && !toTransform) return null;
    if (!fromTransform) return normalizeCameraTransform(toTransform);
    if (!toTransform) return normalizeCameraTransform(fromTransform);

    return {
        x: blendNumber(fromTransform.x, toTransform.x, t),
        y: blendNumber(fromTransform.y, toTransform.y, t),
        zoom: blendNumber(fromTransform.zoom, toTransform.zoom, t),
        rotation: blendNumber(fromTransform.rotation, toTransform.rotation, t),
    };
}

function buildSceneShotTimeline(sceneGraph, activeSceneId) {
    const scene = sceneGraph?.scenes?.find((entry) => entry?.id === activeSceneId) ?? null;
    const shots = getCanonicalShotTrack(scene)?.shots ?? [];

    return {
        shots: shots.map((shot) => {
            const startMs = Number.isFinite(shot?.start) ? Number(shot.start) : 0;
            const durationMs = Number.isFinite(shot?.duration) ? Number(shot.duration) : 0;
            return {
                id: shot?.id ?? null,
                startMs,
                endMs: startMs + durationMs,
                transitionOut: shot?.transitionOut ?? null,
                shot,
            };
        }),
    };
}

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

function resolveSequenceCameraTransform(document, activeCamera) {
    const nodeRef = activeCamera?.nodeRef ?? activeCamera?.cameraNodeRef ?? null;
    if (!nodeRef) return null;

    const node = document?.sceneGraph?.nodes?.[nodeRef] ?? null;
    const transform = normalizeCameraTransform(node?.props?.transform ?? {});

    return {
        source: 'sequence',
        resolvedFrom: activeCamera?.sourceType ?? 'camera-track',
        timeMs: activeCamera?.timeMs ?? null,
        sequenceId: activeCamera?.sequenceId ?? null,
        nodeRef,
        clipId: activeCamera?.clipId ?? null,
        trackId: activeCamera?.trackId ?? null,
        shotId: null,
        transform,
    };
}

function resolveShotCamera(activeShot, timeMs) {
    const cameraTrack = activeShot?.shot?.camera ?? null;
    if (!cameraTrack) return null;

    const transform = getCameraTransformAtTime(
        cameraTrack,
        Number(activeShot?.localTime ?? 0),
    );
    if (!transform) return null;

    return {
        source: 'shot',
        resolvedFrom: 'shot-track',
        timeMs: Number.isFinite(timeMs) ? Number(timeMs) : null,
        sequenceId: null,
        shotId: activeShot?.shotId ?? null,
        trackId: null,
        clipId: null,
        nodeRef: null,
        transform: normalizeCameraTransform(transform),
    };
}

function resolveShotCameraFromTimelineShot(timelineShot, timeMs) {
    const shot = timelineShot?.shot ?? null;
    if (!shot) return null;

    return resolveShotCamera(
        {
            shotId: shot.id ?? null,
            shot,
            localTime: Math.max(
                0,
                Math.min(
                    Number(timeMs ?? 0) - Number(timelineShot?.startMs ?? 0),
                    Math.max(0, Number(timelineShot?.endMs ?? 0) - Number(timelineShot?.startMs ?? 0)),
                ),
            ),
        },
        timeMs,
    );
}

function resolveBlendedCamera({
    sequenceId,
    sequenceCamera,
    sceneShotTimeline,
    timeMs,
} = {}) {
    const transitionWindow = resolveSceneTransitionWindow({
        shots: sceneShotTimeline?.shots ?? [],
        activeShotId: null,
        timeMs,
    });
    if (!transitionWindow || transitionWindow.transition?.type !== 'crossfade') {
        return null;
    }

    const fromShotCamera = resolveShotCameraFromTimelineShot(transitionWindow.fromShot, timeMs);
    const toShotCamera = resolveShotCameraFromTimelineShot(transitionWindow.toShot, timeMs);
    assertCameraTransitionAuthority({
        transitionWindow,
        fromShotCamera,
        toShotCamera,
        sequenceCamera,
    });

    if (!fromShotCamera && !toShotCamera) {
        return sequenceCamera
            ? {
                  ...sequenceCamera,
                  transition: null,
              }
            : null;
    }

    const fromOwner = fromShotCamera ?? sequenceCamera;
    const toOwner = toShotCamera ?? sequenceCamera;
    if (!fromOwner || !toOwner) {
        return fromOwner ?? toOwner ?? null;
    }

    return {
        source: fromShotCamera || toShotCamera ? 'shot' : 'sequence',
        resolvedFrom: 'transition-crossfade',
        timeMs: Number.isFinite(timeMs) ? Number(timeMs) : null,
        sequenceId: sequenceId ?? fromOwner.sequenceId ?? toOwner.sequenceId ?? null,
        shotId: transitionWindow.fromShotId ?? null,
        trackId: fromOwner.trackId === toOwner.trackId ? fromOwner.trackId ?? null : null,
        clipId: fromOwner.clipId === toOwner.clipId ? fromOwner.clipId ?? null : null,
        nodeRef: fromOwner.nodeRef === toOwner.nodeRef ? fromOwner.nodeRef ?? null : null,
        transform: blendCameraTransforms(fromOwner.transform, toOwner.transform, transitionWindow.t),
        transition: {
            active: true,
            type: transitionWindow.transition.type,
            progress: transitionWindow.t,
            fromShotId: transitionWindow.fromShotId ?? null,
            toShotId: transitionWindow.toShotId ?? null,
        },
    };
}

export function buildTemporalContext({ document, runtime, cursorIndex } = {}) {
    const sequenceMap = getSequenceMap(document);
    const sequenceId = resolveActiveSequenceId(document, runtime, sequenceMap);
    const { frame, timeMs } = resolveFrameAndTime(runtime, cursorIndex);
    const sceneGraph = document?.sceneGraph ?? null;
    const selection = resolveCanonicalSceneSelection({
        sceneGraph,
        preferredSceneId: runtime?.scene?.activeSceneId ?? null,
        preferredShotId: runtime?.scene?.activeShotId ?? null,
    });
    const activeSceneId = selection.activeSceneId;

    assertSceneGraphInvariants({
        sceneGraph,
        compositions: document?.compositions ?? null,
        activeSceneId,
        activeShotId: selection.activeShotId,
        requireActiveShot: false,
    });

    const sequence = sequenceId ? sequenceMap[sequenceId] ?? null : null;
    const sequenceView = sequence
        ? evaluateSequence({
              sequence,
              assets: document?.assets ?? null,
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
    const sceneShotTimeline = buildSceneShotTimeline(sceneGraph, activeSceneId);
    const activeCamera = sequenceView?.activeCamera
        ? {
              sequenceId: sequenceId ?? null,
              nodeRef: sequenceView.activeCamera.nodeRef ?? sequenceView.activeCamera.cameraNodeRef ?? null,
              cameraNodeRef: sequenceView.activeCamera.cameraNodeRef ?? sequenceView.activeCamera.nodeRef ?? null,
              clipId: sequenceView.activeCamera.clipId ?? null,
              trackId: sequenceView.activeCamera.trackId ?? null,
              sourceType: sequenceView.activeCamera.sourceType ?? null,
              startTime: sequenceView.activeCamera.startTime ?? null,
              endTime: sequenceView.activeCamera.endTime ?? null,
              priority: sequenceView.activeCamera.priority ?? null,
              timeMs: resolvedTimeMs,
          }
        : null;
    const sequenceCamera = resolveSequenceCameraTransform(document, activeCamera);
    const camera =
        resolveBlendedCamera({
            sequenceId,
            sequenceCamera,
            sceneShotTimeline,
            timeMs: resolvedTimeMs,
        }) ??
        resolveShotCamera(activeShot, resolvedTimeMs) ??
        sequenceCamera;

    return {
        sequenceId,
        frameRate: Number(sequenceView?.frameRate ?? 24),
        frame: Number(sequenceView?.frame ?? frame),
        timeMs: resolvedTimeMs,
        activeClips: Array.isArray(sequenceView?.activeClips) ? sequenceView.activeClips : [],
        activeAudioClips: Array.isArray(sequenceView?.activeAudioClips) ? sequenceView.activeAudioClips : [],
        activeVideoClips: Array.isArray(sequenceView?.activeVideoClips) ? sequenceView.activeVideoClips : [],
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
