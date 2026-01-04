import { useEffect } from 'react';
import { samplePreviewState } from './samplePreviewState.js';
import { useTimelinePreviewStore } from './useTimelinePreviewStore.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { getRuntimeState } from '@/runtime/state/runtimeState.js';

/**
 * Bridges UI scrubbing into the animated render store.
 * Read-only: never mutates runtime state or reducers.
 */
export function useTimelinePreviewBridge(timelineOverride) {
    const time = useTimelinePreviewStore((s) => s.time);
    const isScrubbing = useTimelinePreviewStore((s) => s.isScrubbing);

    useEffect(() => {
        const runtimeState = getRuntimeState();
        if (!runtimeState) return;

        const timeline = timelineOverride || runtimeState.timeline?.timelines?.default;

        if (isScrubbing && timeline) {
            const preview = samplePreviewState({
                baseState: runtimeState,
                timeline,
                time,
            });

            useAnimatedRuntimeStore.setState(
                {
                    nodes: preview.nodes || {},
                    rootIds: preview.rootIds || [],
                },
                false
            );
            return;
        }

        // Snap back to authoritative runtime state when not scrubbing.
        useAnimatedRuntimeStore.setState(
            {
                nodes: runtimeState.nodes || {},
                rootIds: runtimeState.rootIds || [],
            },
            false
        );
    }, [time, isScrubbing, timelineOverride]);
}
