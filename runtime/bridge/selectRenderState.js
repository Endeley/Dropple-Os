import { useRuntimeStore } from '../stores/useRuntimeStore.js';
import { useTimelinePreviewStore } from '../stores/useTimelinePreviewStore.js';

/**
 * Selects which state the canvas should render.
 *
 * Priority:
 * 1. Timeline preview (read-only)
 * 2. Runtime state (authoritative)
 */
export function useRenderState() {
    const runtime = useRuntimeStore();
    const preview = useTimelinePreviewStore((s) => s.previewState);

    return preview ?? runtime;
}
