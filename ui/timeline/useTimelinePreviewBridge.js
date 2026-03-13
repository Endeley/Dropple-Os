import { useEffect } from 'react';
import { samplePreviewState } from './samplePreviewState.js';
import {
    getSceneGraph,
    selectRenderState,
    useAnimatedRuntimeStore,
    useRuntimeStore,
    useTimelineStore,
} from '@/ui/bridges/timelinePreviewRuntimeBridge.js';

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
        const graph = getSceneGraph(runtimeState);

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
                nodes: graph?.nodes || {},
                rootIds: graph?.rootIds || [],
            },
            false
        );
    }, [frameTime, isScrubbing, timelineOverride]);
}
