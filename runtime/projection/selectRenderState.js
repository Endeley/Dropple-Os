// runtime/projection/selectRenderState.js

import { getSceneGraph } from '@/runtime/document/documentAdapter';
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
    const state = preview ?? runtime;
    const graph = getSceneGraph(state);

    if (!state || !graph) {
        return state;
    }

    return {
        ...state,
        nodes: graph.nodes ?? state.nodes ?? {},
        rootIds: graph.rootIds ?? state.rootIds ?? [],
    };
}
