// NOTE: This file is runtime/UI glue. Pure timeline evaluation lives elsewhere.
import {
    evaluateTimelinePreview,
    flattenTimeline,
    getRuntimeSnapshot,
    useAnimatedRuntimeStore,
} from '@/ui/bridges/timelinePreviewRuntimeBridge.js';

/**
 * Applies timeline intent as a preview into the animated render store.
 * Read-only: does not use dispatcher, history, or reducers outside applyEvent.
 */
export function applyTimelinePreview({ timeline, time }) {
    const baseState = getRuntimeSnapshot();
    if (!timeline || !baseState) return;

    let state = baseState;

    const events = flattenTimeline({
        timeline,
        upToTime: time,
    });

    state = evaluateTimelinePreview(state, events);

    useAnimatedRuntimeStore.setState(
        {
            nodes: state.nodes || {},
            rootIds: state.rootIds || [],
        },
        false
    );
}
