import { evaluateTimeline } from './evaluateTimeline.js';
import { useTimelinePreviewStore } from '../stores/useTimelinePreviewStore.js';
import { getRuntimeState } from '../state/runtimeState.js';

/**
 * Scrub timeline to a given time.
 * Read-only preview.
 */
export function scrubTimeline(timeline, time) {
    const baseState = getRuntimeState();
    if (!baseState) return;

    const preview = evaluateTimeline({
        baseState,
        timeline,
        time,
    });

    useTimelinePreviewStore.setState({
        time,
        previewState: preview,
    });
}
