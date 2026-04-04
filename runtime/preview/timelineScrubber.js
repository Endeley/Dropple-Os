import { evaluateTimelineFrame } from '@/timeline/evaluateTimelineFrame.js';
import { getNodes } from '@/runtime/document/documentAdapter.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';

/**
 * Read-only scrubbing: sets cursor time and fills animated store with preview nodes.
 * Does not mutate runtime state.
 */
export function scrubTimeline({ timeline, baseState, time }) {
    const previewState = evaluateTimelineFrame({
        timeline,
        baseState,
        time,
    });

    useAnimatedRuntimeStore.setState(
        {
            previewNodes: getNodes(previewState),
        },
        false
    );
}
