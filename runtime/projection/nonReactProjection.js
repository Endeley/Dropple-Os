import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { projectActiveSequenceView } from '@/runtime/projection/selectors/sequenceSelectors.js';
import { selectActiveSequenceView } from '@/runtime/projection/selectors/sequenceRuntimeSelectors.js';

/**
 * Canonical non-React projection access.
 *
 * Use this for non-React bridge code that needs projected/editor-facing state.
 * Prefer these helpers over legacy v1 projection getters.
 */
export function getProjectedRuntimeViewState() {
    const state = useRuntimeStore.getState();
    if (!state) return null;

    return {
        ...state,
        sequencer:
            selectActiveSequenceView(state) ??
            projectActiveSequenceView(state.document, {
                frame: Number(state?.cursorIndex ?? 0),
            }),
        isReplaying: state.isReplaying ?? false,
    };
}

export function getProjectedWorkspaceViewState() {
    const state = useRuntimeStore.getState();
    const workspace = state?.workspace ?? null;

    return {
        id: workspace?.id ?? null,
        workspace,
        viewport: workspace?.viewport ?? null,
        canvasSurface: workspace?.canvasSurface ?? null,
        canvasPolicy: workspace?.canvasPolicy ?? null,
        policy: workspace?.policy ?? null,
        ui: workspace?.ui ?? null,
        timeline: workspace?.timeline ?? null,
        profile: workspace?.profile ?? null,
        enabledTriggerTypes: workspace?.enabledTriggerTypes ?? null,
        allowedEventTypes: workspace?.allowedEventTypes ?? null,
        selection: state?.selection ?? null,
        selectionBounds: state?.selectionBounds ?? null,
        guides: state?.guides ?? [],
        groupTransform: state?.groupTransform ?? null,
        tools: state?.tools ?? null,
    };
}
