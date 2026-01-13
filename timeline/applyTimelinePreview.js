// NOTE: This file is runtime/UI glue. Pure timeline evaluation lives elsewhere.
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { sampleProperty } from './sampleTimeline.js';
import { perfStart, perfEnd } from '@/perf/perfTracker.js';

/**
 * Applies a preview frame based on timeline time.
 * Read-only. No reducers touched.
 */
export function applyTimelinePreview({ timeline, baseState, time }) {
    if (!timeline || !baseState) return;

    perfStart('timeline.preview');
    const SNAP_MS = 16;
    const snappedTime = Math.round(time / SNAP_MS) * SNAP_MS;
    const nextNodes = { ...baseState.nodes };

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

    useAnimatedRuntimeStore.setState(
        {
            nodes: nextNodes,
            rootIds: baseState.rootIds,
        },
        false
    );
    perfEnd('timeline.preview');
}
