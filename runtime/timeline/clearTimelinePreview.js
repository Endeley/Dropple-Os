import { useTimelinePreviewStore } from '../stores/useTimelinePreviewStore.js';

export function clearTimelinePreview() {
    useTimelinePreviewStore.getState().clear();
}
