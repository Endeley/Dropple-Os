import { useEffect } from 'react';
import { samplePreviewState } from './samplePreviewState.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { selectRenderState } from '@/runtime/projection';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useTimelineStore } from '@/runtime/stores/useTimelineStore.js';

/**
 * Bridges UI scrubbing into the animated render store.
 * Read-only: never mutates runtime state or reducers.
 */
export function useTimelinePreviewBridge(timelineOverride) {
    const frameTime = useRuntimeStore((s) => s.frameTime);
    const isScrubbing = useTimelineStore((s) => s.isScrubbing);

    useEffect(() => {
        const runtimeState = selectRenderState();
        if (!runtimeState) return;

        const timeline = timelineOverride || runtimeState.timeline?.timelines?.default;

        if (isScrubbing && timeline && Number.isFinite(frameTime)) {
            const preview = samplePreviewState({
                baseState: runtimeState,
                timeline,
                time: frameTime,
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
    }, [frameTime, isScrubbing, timelineOverride]);
}
