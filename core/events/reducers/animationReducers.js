import { EventTypes } from '../eventTypes.js';

/**
 * Animation reducers (Phase 5A)
 *
 * 🔒 Rules:
 * - Pure functions only
 * - No ID generation
 * - No sorting
 * - No derived values
 * - Invalid payloads → no-op
 */
export function animationReducers(state, event) {
    const { type, payload } = event;
    const timeline = state.timeline?.timelines?.default;
    if (!timeline) return state;

    function ensureAnimations(nextState) {
        if (nextState.timeline?.animations) return nextState;
        return {
            ...nextState,
            timeline: {
                ...nextState.timeline,
                animations: {
                    clips: {},
                    tracks: {},
                    keyframes: {},
                },
            },
        };
    }

    function defaultClipId() {
        return 'clip-default';
    }

    switch (type) {
        case EventTypes.ANIMATION_TRACK_CREATE: {
            const { trackId, nodeId, property } = payload || {};
            if (!trackId || !nodeId || !property) return state;
            if (timeline.tracks?.some((t) => t.id === trackId)) return state;

            const nextTrack = {
                id: trackId,
                nodeId,
                property,
                keyframes: [],
            };

            return {
                ...state,
                timeline: {
                    ...state.timeline,
                    timelines: {
                        ...state.timeline.timelines,
                        default: {
                            ...timeline,
                            tracks: [...(timeline.tracks || []), nextTrack],
                        },
                    },
                },
            };
        }

        case EventTypes.ANIMATION_TRACK_DELETE: {
            const { trackId } = payload || {};
            if (!trackId) return state;

            return {
                ...state,
                timeline: {
                    ...state.timeline,
                    timelines: {
                        ...state.timeline.timelines,
                        default: {
                            ...timeline,
                            tracks: (timeline.tracks || []).filter((t) => t.id !== trackId),
                        },
                    },
                },
            };
        }

        case EventTypes.ANIMATION_KEYFRAME_CREATE: {
            const { nodeId, property, timeMs, value, easing = 'linear' } = payload || {};
            if (!nodeId || !property || !Number.isFinite(timeMs) || !Number.isFinite(value)) return state;

            const ensured = ensureAnimations(state);
            const animations = ensured.timeline.animations;
            const clipId = payload?.clipId || defaultClipId();
            const existingClip = animations.clips?.[clipId];
            const nextClip = existingClip
                ? {
                      ...existingClip,
                      durationMs: Math.max(existingClip.durationMs || 0, timeMs),
                  }
                : {
                      id: clipId,
                      durationMs: Math.max(0, timeMs),
                      trackIds: [],
                  };

            const tracks = animations.tracks || {};
            const keyframes = animations.keyframes || {};

            const existingTrack = Object.values(tracks).find(
                (track) => track?.nodeId === nodeId && track?.property === property
            );

            const trackId = existingTrack?.id || payload?.trackId || `track-${nodeId}-${property}`;
            const clipIdForTrack = existingTrack?.clipId || payload?.clipId || clipId;
            const keyframeId = payload?.keyframeId || `kf-${trackId}-${timeMs}`;

            const nextTrack = existingTrack
                ? {
                      ...existingTrack,
                      clipId: clipIdForTrack,
                      keyframeIds: [...(existingTrack.keyframeIds || [])],
                  }
                : {
                      id: trackId,
                      nodeId,
                      property,
                      clipId: clipIdForTrack,
                      keyframeIds: [],
                  };

            const existingKeyframeId = (nextTrack.keyframeIds || []).find((id) => keyframes[id]?.timeMs === timeMs);
            const finalKeyframeId = existingKeyframeId || keyframeId;

            const nextKeyframes = {
                ...keyframes,
                [finalKeyframeId]: {
                    id: finalKeyframeId,
                    trackId,
                    timeMs,
                    value,
                    easing,
                },
            };

            if (!existingKeyframeId) {
                nextTrack.keyframeIds = [...(nextTrack.keyframeIds || []), finalKeyframeId];
            }

            nextTrack.keyframeIds = (nextTrack.keyframeIds || [])
                .slice()
                .sort((a, b) => (nextKeyframes[a]?.timeMs || 0) - (nextKeyframes[b]?.timeMs || 0));

            const nextTracks = {
                ...tracks,
                [trackId]: nextTrack,
            };

            const nextClips = {
                ...animations.clips,
                [clipId]: {
                    ...nextClip,
                    trackIds: nextClip.trackIds?.includes(trackId)
                        ? nextClip.trackIds
                        : [...(nextClip.trackIds || []), trackId],
                },
            };

            return {
                ...ensured,
                timeline: {
                    ...ensured.timeline,
                    animations: {
                        clips: nextClips,
                        tracks: nextTracks,
                        keyframes: nextKeyframes,
                    },
                },
            };
        }

        case EventTypes.ANIMATION_KEYFRAME_ADD: {
            const { trackId, keyframe } = payload || {};
            if (!trackId || !keyframe?.id) return state;

            let changed = false;
            const nextTracks = (timeline.tracks || []).map((track) => {
                if (track.id !== trackId) return track;
                if (track.keyframes?.some((kf) => kf.id === keyframe.id)) return track;
                changed = true;
                return {
                    ...track,
                    keyframes: [...(track.keyframes || []), keyframe],
                };
            });

            if (!changed) return state;

            return {
                ...state,
                timeline: {
                    ...state.timeline,
                    timelines: {
                        ...state.timeline.timelines,
                        default: {
                            ...timeline,
                            tracks: nextTracks,
                        },
                    },
                },
            };
        }

        case EventTypes.ANIMATION_KEYFRAME_UPDATE: {
            const { trackId, keyframeId, patch } = payload || {};
            if (!trackId || !keyframeId || !patch) return state;

            let changed = false;
            const nextTracks = (timeline.tracks || []).map((track) => {
                if (track.id !== trackId) return track;
                const nextKeyframes = (track.keyframes || []).map((kf) => {
                    if (kf.id !== keyframeId) return kf;
                    changed = true;
                    return { ...kf, ...patch };
                });
                return { ...track, keyframes: nextKeyframes };
            });

            if (!changed) return state;

            return {
                ...state,
                timeline: {
                    ...state.timeline,
                    timelines: {
                        ...state.timeline.timelines,
                        default: {
                            ...timeline,
                            tracks: nextTracks,
                        },
                    },
                },
            };
        }

        case EventTypes.ANIMATION_KEYFRAME_DELETE: {
            const { trackId, keyframeId } = payload || {};
            if (!trackId || !keyframeId) return state;

            let changed = false;
            const nextTracks = (timeline.tracks || []).map((track) => {
                if (track.id !== trackId) return track;
                const nextKeyframes = (track.keyframes || []).filter((kf) => kf.id !== keyframeId);
                if (nextKeyframes.length !== (track.keyframes || []).length) {
                    changed = true;
                }
                return { ...track, keyframes: nextKeyframes };
            });

            if (!changed) return state;

            return {
                ...state,
                timeline: {
                    ...state.timeline,
                    timelines: {
                        ...state.timeline.timelines,
                        default: {
                            ...timeline,
                            tracks: nextTracks,
                        },
                    },
                },
            };
        }

        default:
            return state;
    }
}
