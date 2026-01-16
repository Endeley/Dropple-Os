// core/events/reducers/timelineReducers.js

import { EventTypes } from '../eventTypes.js';

/**
 * Timeline reducers
 *
 * 🔒 Rules:
 * - Pure functions
 * - No ID generation
 * - Deterministic updates only
 */
export function timelineReducers(state, event) {
    const { type, payload } = event;

    switch (type) {
        case EventTypes.TIMELINE_EVENT_ADD: {
            const event = payload?.event;
            if (!event) return state;

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const nextEvents = [...(timeline.events || []), event];

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            events: nextEvents,
                        },
                    },
                },
            };
        }
        case EventTypes.TIMELINE_KEYFRAME_ADD: {
            const { nodeId, trackId, keyframeId, time, property, value, easing = 'linear' } = payload;

            if (!keyframeId) return state;

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const track = timeline.tracks.find((t) => t.id === trackId);
            if (!track) return state;

            const clip = track.clips?.[0];
            if (!clip) return state;

            const nextClip = {
                ...clip,
                keyframes: [...clip.keyframes, { id: keyframeId, time, property, value, easing }],
            };

            const nextTrack = {
                ...track,
                clips: [nextClip],
            };

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            tracks: timeline.tracks.map((t) => (t.id === trackId ? nextTrack : t)),
                        },
                    },
                },
            };
        }

        case EventTypes.TIMELINE_KEYFRAME_MOVE: {
            const { keyframeId, trackId, time } = payload;

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const track = timeline.tracks.find((t) => t.id === trackId);
            if (!track) return state;

            const clip = track.clips?.[0];
            if (!clip) return state;

            const nextClip = {
                ...clip,
                keyframes: clip.keyframes.map((kf) => (kf.id === keyframeId ? { ...kf, time } : kf)),
            };

            const nextTrack = {
                ...track,
                clips: [nextClip],
            };

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            tracks: timeline.tracks.map((t) => (t.id === trackId ? nextTrack : t)),
                        },
                    },
                },
            };
        }

        default:
            return state;
    }
}
