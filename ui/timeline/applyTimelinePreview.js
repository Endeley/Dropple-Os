// NOTE: This file is runtime/UI glue. Pure timeline evaluation lives elsewhere.
import {
    evaluatePreviewEvents,
    flattenTimeline,
    getNodes,
    getProjectedRuntimeViewState,
    useAnimatedRuntimeStore,
} from '@/ui/bridges/timelinePreviewRuntimeBridge.js';

/**
 * Applies timeline intent as a preview into the animated render store.
 * Read-only: does not use dispatcher, history, or reducers outside applyEvent.
 */
export function applyTimelinePreview({ timeline, time }) {
    const baseState = getProjectedRuntimeViewState();
    if (!timeline || !baseState) return;

    let state = baseState;

    const events = flattenTimeline({
        timeline,
        upToTime: time,
    });

    state = evaluatePreviewEvents(state, events);

    useAnimatedRuntimeStore.setState(
        {
            previewNodes: getNodes(state),
        },
        false
    );
}
