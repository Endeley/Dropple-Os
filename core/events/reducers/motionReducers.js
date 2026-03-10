import { EventTypes } from '../eventTypes.js';

function ensureMotion(nextState) {
    return {
        ...nextState,
        document: {
            ...(nextState?.document || {}),
            motion: {
                clips: {
                    ...(nextState?.document?.motion?.clips || {}),
                },
            },
        },
    };
}

function getMotion(nextState) {
    return nextState?.document?.motion?.clips || {};
}

function defaultClipId() {
    return 'clip-default';
}

function findClipByTargetProperty(clips, nodeId, property) {
    return Object.values(clips).find(
        (clip) => clip?.target === nodeId && clip?.property === property,
    );
}

function sortKeyframes(keyframes = []) {
    return keyframes
        .slice()
        .sort((a, b) => (a?.t || 0) - (b?.t || 0));
}

export function createMotionClip(state, clip) {
    if (!clip?.id || !clip?.target || !clip?.property) return state;
    const ensured = ensureMotion(state);
    const clips = getMotion(ensured);
    if (clips[clip.id]) return state;

    return {
        ...ensured,
        document: {
            ...ensured.document,
            motion: {
                clips: {
                    ...clips,
                    [clip.id]: {
                        ...clip,
                        keyframes: sortKeyframes(clip.keyframes || []),
                    },
                },
            },
        },
    };
}

export function updateMotionClip(state, clipId, patch = {}) {
    if (!clipId) return state;
    const ensured = ensureMotion(state);
    const clips = getMotion(ensured);
    const clip = clips[clipId];
    if (!clip) return state;

    const nextClip = {
        ...clip,
        ...patch,
        id: clip.id,
        keyframes: patch.keyframes ? sortKeyframes(patch.keyframes) : clip.keyframes,
    };

    return {
        ...ensured,
        document: {
            ...ensured.document,
            motion: {
                clips: {
                    ...clips,
                    [clipId]: nextClip,
                },
            },
        },
    };
}

export function deleteMotionClip(state, clipId) {
    if (!clipId) return state;
    const ensured = ensureMotion(state);
    const clips = getMotion(ensured);
    if (!clips[clipId]) return state;
    const nextClips = { ...clips };
    delete nextClips[clipId];

    return {
        ...ensured,
        document: {
            ...ensured.document,
            motion: {
                clips: nextClips,
            },
        },
    };
}

export function addMotionKeyframe(state, clipId, keyframe) {
    if (!clipId || !keyframe) return state;
    const ensured = ensureMotion(state);
    const clips = getMotion(ensured);
    const clip = clips[clipId];
    if (!clip) return state;

    const nextKeyframe = {
        id: keyframe.id,
        t: keyframe.t ?? keyframe.time ?? keyframe.timeMs,
        v: keyframe.v ?? keyframe.value,
        easing: keyframe.easing,
    };
    if (!Number.isFinite(nextKeyframe.t) || nextKeyframe.v === undefined) return state;
    if ((clip.keyframes || []).some((entry) => entry?.id === nextKeyframe.id)) return state;

    return updateMotionClip(state, clipId, {
        keyframes: sortKeyframes([...(clip.keyframes || []), nextKeyframe]),
    });
}

export function updateMotionKeyframe(state, clipId, keyframeId, patch = {}) {
    if (!clipId || !keyframeId || !patch) return state;
    const ensured = ensureMotion(state);
    const clips = getMotion(ensured);
    const clip = clips[clipId];
    if (!clip) return state;

    let changed = false;
    const keyframes = (clip.keyframes || []).map((keyframe) => {
        if (keyframe?.id !== keyframeId) return keyframe;
        changed = true;
        const nextPatch = {};
        if (patch.t !== undefined || patch.time !== undefined || patch.timeMs !== undefined) {
            nextPatch.t = patch.t ?? patch.time ?? patch.timeMs;
        }
        if (patch.v !== undefined || patch.value !== undefined) {
            nextPatch.v = patch.v ?? patch.value;
        }
        if (patch.easing !== undefined) {
            nextPatch.easing = patch.easing;
        }
        return {
            ...keyframe,
            ...nextPatch,
        };
    });

    if (!changed) return state;

    return updateMotionClip(state, clipId, {
        keyframes: sortKeyframes(keyframes),
    });
}

export function deleteMotionKeyframe(state, clipId, keyframeId) {
    if (!clipId || !keyframeId) return state;
    const ensured = ensureMotion(state);
    const clips = getMotion(ensured);
    const clip = clips[clipId];
    if (!clip) return state;

    const nextKeyframes = (clip.keyframes || []).filter((keyframe) => keyframe?.id !== keyframeId);
    if (nextKeyframes.length === (clip.keyframes || []).length) return state;

    return updateMotionClip(state, clipId, {
        keyframes: nextKeyframes,
    });
}

export function motionReducers(state, event) {
    const { type, payload } = event;

    switch (type) {
        case EventTypes.MOTION_CLIP_CREATE:
            return createMotionClip(state, payload?.clip);

        case EventTypes.MOTION_CLIP_UPDATE:
            return updateMotionClip(state, payload?.clipId, payload?.patch);

        case EventTypes.MOTION_CLIP_DELETE:
            return deleteMotionClip(state, payload?.clipId);

        case EventTypes.MOTION_KEYFRAME_ADD:
            return addMotionKeyframe(state, payload?.clipId, payload?.keyframe);

        case EventTypes.MOTION_KEYFRAME_UPDATE:
            return updateMotionKeyframe(state, payload?.clipId, payload?.keyframeId, payload?.patch);

        case EventTypes.MOTION_KEYFRAME_DELETE:
            return deleteMotionKeyframe(state, payload?.clipId, payload?.keyframeId);

        case EventTypes.ANIMATION_TRACK_CREATE: {
            const { trackId, nodeId, property } = payload || {};
            return createMotionClip(state, {
                id: trackId,
                target: nodeId,
                property,
                keyframes: [],
            });
        }

        case EventTypes.ANIMATION_TRACK_DELETE:
            return deleteMotionClip(state, payload?.clipId || payload?.trackId);

        case EventTypes.ANIMATION_KEYFRAME_CREATE: {
            const { nodeId, property, timeMs, value, easing = 'linear' } = payload || {};
            if (!nodeId || !property || !Number.isFinite(timeMs) || value === undefined) return state;
            const ensured = ensureMotion(state);
            const clips = getMotion(ensured);
            const clipId =
                payload?.clipId ||
                payload?.trackId ||
                findClipByTargetProperty(clips, nodeId, property)?.id ||
                defaultClipId();

            const nextState = clips[clipId]
                ? state
                : createMotionClip(state, {
                      id: clipId,
                      target: nodeId,
                      property,
                      keyframes: [],
                  });

            return addMotionKeyframe(nextState, clipId, {
                id: payload?.keyframeId || `kf-${clipId}-${timeMs}`,
                t: timeMs,
                v: value,
                easing,
            });
        }

        case EventTypes.ANIMATION_KEYFRAME_ADD:
            return addMotionKeyframe(state, payload?.clipId || payload?.trackId, payload?.keyframe);

        case EventTypes.ANIMATION_KEYFRAME_UPDATE:
            return updateMotionKeyframe(
                state,
                payload?.clipId || payload?.trackId,
                payload?.keyframeId,
                payload?.patch,
            );

        case EventTypes.ANIMATION_KEYFRAME_DELETE:
            return deleteMotionKeyframe(
                state,
                payload?.clipId || payload?.trackId,
                payload?.keyframeId,
            );

        default:
            return state;
    }
}
