import { sampleProperty } from './sampleTimeline.js';

/**
 * Pure timeline frame evaluator.
 * No runtime imports, no side effects.
 */
export function evaluateTimelineFrame({ timeline, baseState, time }) {
    if (!timeline || !baseState) return baseState;

    const SNAP_MS = 16;
    const snappedTime = Math.round(time / SNAP_MS) * SNAP_MS;
    const nextNodes = { ...(baseState.nodes || {}) };

    Object.values(timeline.tracks || {}).forEach((track) => {
        const node = nextNodes[track.nodeId];
        if (!node) return;

        const patch = {};

        Object.entries(track.properties || {}).forEach(([prop, keyframes]) => {
            const value = sampleProperty(keyframes, snappedTime);
            if (value !== null) {
                patch[prop] = value;
            }
        });

        nextNodes[track.nodeId] = {
            ...node,
            ...patch,
        };
    });

    return {
        nodes: nextNodes,
        rootIds: baseState.rootIds,
    };
}
