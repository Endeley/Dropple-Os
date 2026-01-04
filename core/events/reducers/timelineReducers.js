import { EventTypes } from '../eventTypes.js';

export function timelineReducers(state, event) {
    const { type, payload } = event;

    switch (type) {
        case EventTypes.TIMELINE_KEYFRAME_ADD: {
            const { nodeId, trackId, time, property, value } = payload;

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};

            const timeline = timelines.default;
            if (!timeline) return state;

            const track = timeline.tracks.find((t) => t.id === trackId);
            if (!track) return state;

            const clip = track.clips[0]; // MVP: one clip per track
            if (!clip) return state;

            const keyframe = {
                id: crypto.randomUUID(),
                time,
                property,
                value,
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
