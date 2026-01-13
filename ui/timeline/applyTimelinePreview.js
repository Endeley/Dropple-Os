// NOTE: This file is runtime/UI glue. Pure timeline evaluation lives elsewhere.
import { flattenTimeline } from '@/engine/timeline/flattenTimeline.js';
import { applyEvent } from '@/core/events/applyEvent.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { getRuntimeState } from '@/runtime/state/runtimeState.js';

/**
 * Applies timeline intent as a preview into the animated render store.
 * Read-only: does not use dispatcher, history, or reducers outside applyEvent.
 */
export function applyTimelinePreview({ timeline, time }) {
    const baseState = getRuntimeState();
    if (!timeline || !baseState) return;

    let state = baseState;

    const events = flattenTimeline({
        timeline,
        upToTime: time,
    });

    events.forEach((evt) => {
        state = applyEvent(state, evt);
    });

    useAnimatedRuntimeStore.setState(
        {
            nodes: state.nodes || {},
            rootIds: state.rootIds || [],
        },
        false
    );
}
