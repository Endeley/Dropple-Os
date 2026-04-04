import { evaluateTimelineFrame } from '@/timeline/evaluateTimelineFrame.js';
import { getNodes } from '@/runtime/document/documentAdapter.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { perfStart, perfEnd } from '@/runtime/instrumentation/perfTracker.js';

/**
 * Runtime glue for applying timeline preview to animated store.
 */
export function applyTimelinePreview(args) {
    perfStart('timeline.preview');

    const result = evaluateTimelineFrame(args);
    if (!result) {
        perfEnd('timeline.preview');
        return;
    }

    useAnimatedRuntimeStore.setState(
        {
            previewNodes: getNodes(result),
        },
        false
    );

    perfEnd('timeline.preview');
}
