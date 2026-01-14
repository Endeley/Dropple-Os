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
