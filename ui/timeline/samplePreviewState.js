import { sampleProperty } from '@/timeline/sampleTimeline.js';

/**
 * Pure preview sampler: baseState + timeline + time -> preview state.
 * No mutations, no dispatch, deterministic.
 */
export function samplePreviewState({ baseState, timeline, time }) {
    if (!timeline || !baseState) return baseState;

    const nextNodes = { ...(baseState.nodes || {}) };

    const trackList = Array.isArray(timeline.tracks)
        ? timeline.tracks
        : Object.values(timeline.tracks || {});

    trackList.forEach((track) => {
        const node = nextNodes[track.nodeId];
        if (!node) return;

        const patch = {};

        Object.entries(track.properties || {}).forEach(([prop, keyframes]) => {
            const value = sampleProperty(keyframes, time);
            if (value != null) {
                patch[prop] = value;
            }
        });

        nextNodes[track.nodeId] = { ...node, ...patch };
    });

    return {
        ...baseState,
        nodes: nextNodes,
    };
}
