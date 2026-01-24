// core/events/reducers/timelineReducers.js

import { EventTypes } from '../eventTypes.js';

/**
 * Timeline reducers
 *
 * 🔒 ID POLICY (Phase 8):
 * - Reducers MUST NOT generate IDs
 * - All IDs must be provided by events
 * - Reducers are pure and deterministic
 */
export function timelineReducers(state, event) {
    const { type, payload } = event;

    switch (type) {
        case EventTypes.TIMELINE_KEYFRAME_ADD: {
            const {
                nodeId,
                trackId,
                keyframeId, // 🔐 MUST be provided by event
                time,
                property,
                value,
                easing = 'linear',
            } = payload;

            if (!keyframeId) {
                // Hard guard — reducers must not fabricate identity
                return state;
            }

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;

            if (!timeline) return state;

            const track = timeline.tracks.find((t) => t.id === trackId);
            if (!track) return state;

            const clip = track.clips?.[0];
            if (!clip) return state;

            const keyframe = {
                id: keyframeId,
                time,
                property,
                value,
                easing,
            };

            const nextClip = {
                ...clip,
                keyframes: [...clip.keyframes, keyframe],
            };

            const nextTrack = {
                ...track,
                clips: [nextClip],
            };

            const nextTimeline = {
                ...timeline,
                tracks: timeline.tracks.map((t) => (t.id === trackId ? nextTrack : t)),
            };

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: nextTimeline,
                    },
                },
            };
        }

        default:
            return state;
    }
}
